import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { 
  Send, Phone, Video, MoreVertical, Search, QrCode, 
  Paperclip, Mic, Image, Smile, X, PauseCircle, Pin, Bell, Calendar, Mail, UserPlus
} from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import WhatsAppModal from '../components/modals/WhatsAppModal';
import CreateClientModal from '../components/modals/CreateClientModal';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/Popover';
import EmojiPicker from '../components/ui/EmojiPicker';
import { Spinner } from '../components/ui/Spinner';
import { toast, ToastContainer } from '../components/ui/Toast';
import { format, parseISO } from 'date-fns';
import { Client } from '../types';
import ClientAppointmentsList from '../components/chat/ClientAppointmentsList';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOutgoing: boolean;
  type: 'text' | 'image' | 'file' | 'audio';
  fileUrl?: string;
  fileName?: string;
  duration?: number;
  read?: boolean;
}

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsWithLastAppointment, setClientsWithLastAppointment] = useState<{[key: string]: string | null}>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [calendarId, setCalendarId] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Referência para a subscription do Supabase
  const messagesSubscriptionRef = useRef<any>(null);

  useEffect(() => {
    // Solicitar permissão para notificações
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationsEnabled(permission === 'granted');
      });
    }
    
    if (user?.id) {
      fetchClients();
    }
    
    return () => {
      // Limpar a subscription ao desmontar
      if (messagesSubscriptionRef.current) {
        messagesSubscriptionRef.current.unsubscribe();
      }
    };
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedClient) {
      fetchMessages(selectedClient.id);
      subscribeToMessages(selectedClient.id);
      
      // Marcar mensagens como lidas quando selecionar um cliente
      markMessagesAsRead(selectedClient.id);
    }
    
    return () => {
      // Limpar a subscription ao mudar de cliente
      if (messagesSubscriptionRef.current) {
        messagesSubscriptionRef.current.unsubscribe();
      }
    };
  }, [selectedClient]);

  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Buscar todos os calendários do usuário
      const { data: calendarsData, error: calendarsError } = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);

      if (calendarsError) throw calendarsError;

      if (!calendarsData || calendarsData.length === 0) {
        throw new Error('No calendars found');
      }

      // Salvar o ID do primeiro calendário para uso no modal de criação de cliente
      setCalendarId(calendarsData[0].id);

      const calendarIds = calendarsData.map(cal => cal.id);

      // Buscar os clientes vinculados a qualquer um dos calendários do usuário
      // OU clientes que foram criados pelo usuário (owner_id = user.id)
      const { data, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .or(`calendar_id.in.(${calendarIds.join(',')}),owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      setClients(data || []);
      
      // Buscar o último agendamento para cada cliente
      if (data && data.length > 0) {
        const clientIds = data.map(client => client.id);
        
        // Buscar todos os agendamentos para esses clientes
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            client_id, 
            start_time
          `)
          .in('client_id', clientIds)
          .order('start_time', { ascending: false });
          
        if (appointmentsError) throw appointmentsError;
        
        // Processar os dados para obter o último agendamento de cada cliente
        const lastAppointments: {[key: string]: string | null} = {};
        
        data.forEach(client => {
          const clientAppointments = appointmentsData?.filter(apt => apt.client_id === client.id) || [];
          if (clientAppointments.length > 0) {
            lastAppointments[client.id] = clientAppointments[0].start_time;
          } else {
            lastAppointments[client.id] = null;
          }
        });
        
        setClientsWithLastAppointment(lastAppointments);
      }
      
      // Se houver clientes, selecione o primeiro por padrão
      if (data && data.length > 0 && !selectedClient) {
        setSelectedClient(data[0]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao buscar clientes';
      console.error(message);
      toast.error('Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleClientCreated = () => {
    // Recarregar a lista de clientes após a criação de um novo
    fetchClients();
  };

  const subscribeToMessages = (clientId: string) => {
    // Cancelar subscription anterior se existir
    if (messagesSubscriptionRef.current) {
      messagesSubscriptionRef.current.unsubscribe();
    }
    
    // Criar nova subscription
    messagesSubscriptionRef.current = supabase
      .channel('messages-channel')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `receiver_id=eq.${user?.id}`
      }, (payload) => {
        // Verificar se a mensagem é do cliente selecionado
        if (payload.new.sender_id === clientId) {
          const newMessage: Message = {
            id: payload.new.id,
            sender: clients.find(c => c.id === payload.new.sender_id)?.name || 'Cliente',
            content: payload.new.content,
            timestamp: payload.new.created_at,
            isOutgoing: false,
            type: payload.new.type || 'text',
            fileUrl: payload.new.file_url,
            fileName: payload.new.file_name,
            duration: payload.new.duration,
            read: false
          };
          
          setMessages(prev => [...prev, newMessage]);
          
          // Marcar como lida se o cliente estiver selecionado
          if (selectedClient?.id === clientId) {
            markMessageAsRead(payload.new.id);
          } else {
            // Incrementar contador de não lidas
            updateUnreadCount(clientId);
            // Mostrar notificação no navegador
            showBrowserNotification(
              clients.find(c => c.id === clientId)?.name || 'Cliente',
              payload.new.content
            );
          }
        } else {
          // Mensagem de outro cliente, atualizar contadores e mostrar notificação
          updateUnreadCount(payload.new.sender_id);
          // Mostrar notificação no navegador
          showBrowserNotification(
            clients.find(c => c.id === payload.new.sender_id)?.name || 'Cliente',
            payload.new.content
          );
        }
      })
      .subscribe();
  };

  const showBrowserNotification = (sender: string, message: string) => {
    if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('Nova mensagem de ' + sender, {
        body: message,
        icon: '/logo.png'
      });
    }
  };

  const updateUnreadCount = (clientId: string) => {
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === clientId 
          ? {...client, unread_count: (client.unread_count || 0) + 1} 
          : client
      )
    );
  };

  const markMessagesAsRead = async (clientId: string) => {
    try {
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .match({ sender_id: clientId, receiver_id: user?.id, read: false });
      
      if (error) throw error;
      
      // Atualizar no estado local
      setMessages(prev => 
        prev.map(msg => 
          !msg.isOutgoing ? {...msg, read: true} : msg
        )
      );
      
      // Zerar contador de não lidas
      setClients(prevClients => 
        prevClients.map(client => 
          client.id === clientId 
            ? {...client, unread_count: 0} 
            : client
        )
      );
    } catch (err) {
      console.error('Erro ao marcar mensagens como lidas:', err);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
      
      if (error) throw error;
    } catch (err) {
      console.error('Erro ao marcar mensagem como lida:', err);
    }
  };

  const fetchMessages = async (clientId: string) => {
    try {
      setLoadingMessages(true);
      
      // Verificar primeiro se a tabela existe
      const { data: tableCheck, error: tableError } = await supabase
        .from('messages')
        .select('count(*)', { count: 'exact', head: true });
        
      if (tableError) {
        console.error('Erro ao verificar tabela messages:', tableError);
        throw tableError;
      }
      
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${user?.id},receiver_id.eq.${user?.id}`)
        .or(`sender_id.eq.${clientId},receiver_id.eq.${clientId}`)
        .order('created_at');

      if (error) throw error;

      const formattedMessages: Message[] = (data || []).map(msg => ({
        id: msg.id,
        sender: msg.sender_id === user?.id ? user.email || 'Você' : selectedClient?.name || 'Cliente',
        content: msg.content,
        timestamp: msg.created_at,
        isOutgoing: msg.sender_id === user?.id,
        type: msg.type || 'text',
        fileUrl: msg.file_url,
        fileName: msg.file_name,
        duration: msg.duration,
        read: msg.read
      }));

      setMessages(formattedMessages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao buscar mensagens';
      console.error('Erro detalhado ao buscar mensagens:', err);
      toast.error('Erro ao carregar mensagens');
    } finally {
      setLoadingMessages(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient) return;

    try {
      // Verificar primeiro se a tabela existe
      const { data: tableCheck, error: tableError } = await supabase
        .from('messages')
        .select('count(*)', { count: 'exact', head: true });
        
      if (tableError) {
        console.error('Erro ao verificar tabela messages:', tableError);
        throw tableError;
      }
      
      const newMsg = {
        content: newMessage,
        sender_id: user?.id,
        receiver_id: selectedClient.id,
        created_at: new Date().toISOString(),
        type: 'text',
        read: false
      };

      const { data, error } = await supabase
        .from('messages')
        .insert(newMsg)
        .select();

      if (error) throw error;

      const message: Message = {
        id: data[0].id,
        sender: user?.email || 'Você',
        content: newMessage,
        timestamp: new Date().toISOString(),
        isOutgoing: true,
        type: 'text',
        read: false
      };

      setMessages((prev) => [...prev, message]);
      
      // Atualiza o último status da mensagem no cliente
      updateClientLastMessage(selectedClient.id, newMessage);
      
      setNewMessage('');
    } catch (err) {
      console.error('Erro detalhado ao enviar mensagem:', err);
      const message = err instanceof Error ? err.message : 'Falha ao enviar mensagem';
      toast.error('Erro ao enviar mensagem');
    }
  };

  const updateClientLastMessage = async (clientId: string, message: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          last_message: message,
          last_message_time: new Date().toISOString()
        })
        .eq('id', clientId);

      if (error) throw error;

      // Atualiza o estado local dos clientes
      setClients(prevClients => {
        const updatedClients = prevClients.map(client => 
          client.id === clientId 
            ? {...client, last_message: message, last_message_time: new Date().toISOString()} 
            : client
        );
        
        // Reordenar clientes por data da última mensagem (mais recente primeiro)
        return updatedClients.sort((a, b) => {
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          
          if (a.last_message_time && b.last_message_time) {
            return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
          }
          
          // Se não tiver última mensagem, ordena por nome
          return a.name.localeCompare(b.name);
        });
      });
    } catch (err) {
      console.error('Erro ao atualizar último status da mensagem:', err);
    }
  };

  const togglePinClient = async (clientId: string) => {
    try {
      // Encontrar o cliente atual
      const client = clients.find(c => c.id === clientId);
      if (!client) return;
      
      const newPinnedStatus = !client.is_pinned;
      
      // Atualizar no banco de dados
      const { error } = await supabase
        .from('clients')
        .update({ is_pinned: newPinnedStatus })
        .eq('id', clientId);
      
      if (error) throw error;
      
      // Atualizar no estado local
      setClients(prevClients => {
        const updatedClients = prevClients.map(client => 
          client.id === clientId 
            ? {...client, is_pinned: newPinnedStatus} 
            : client
        );
        
        // Reordenar clientes: primeiro os fixados, depois por data da última mensagem
        return updatedClients.sort((a, b) => {
          // Primeiro critério: fixados no topo
          if (a.is_pinned && !b.is_pinned) return -1;
          if (!a.is_pinned && b.is_pinned) return 1;
          
          // Segundo critério: data da última mensagem (mais recente primeiro)
          if (a.last_message_time && b.last_message_time) {
            return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime();
          }
          
          // Se não tiver última mensagem, ordena por nome
          return a.name.localeCompare(b.name);
        });
      });
      
      toast.success(newPinnedStatus ? 'Contato fixado com sucesso' : 'Contato desfixado');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao fixar/desfixar contato';
      console.error(message);
      toast.error('Erro ao fixar/desfixar contato');
    }
  };

  const handleFileUpload = async (file: File, type: 'image' | 'file') => {
    if (!selectedClient) return;
    
    try {
      // Upload do arquivo para o storage do Supabase
      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user?.id}/${selectedClient.id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('chat_files')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Obtém a URL pública do arquivo
      const { data: { publicUrl } } = supabase
        .storage
        .from('chat_files')
        .getPublicUrl(filePath);
      
      // Salva a mensagem no banco de dados
      const newMsg = {
        content: type === 'image' ? 'Imagem' : `Arquivo: ${file.name}`,
        sender_id: user?.id,
        receiver_id: selectedClient.id,
        created_at: new Date().toISOString(),
        type: type,
        file_url: publicUrl,
        file_name: file.name,
        read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMsg)
        .select();
      
      if (error) throw error;
      
      // Adiciona a mensagem à lista local
      const message: Message = {
        id: data[0].id,
        sender: user?.email || 'Você',
        content: type === 'image' ? 'Imagem' : `Arquivo: ${file.name}`,
        timestamp: new Date().toISOString(),
        isOutgoing: true,
        type: type,
        fileUrl: publicUrl,
        fileName: file.name,
        read: false
      };
      
      setMessages((prev) => [...prev, message]);
      
      // Atualiza o último status da mensagem no cliente
      updateClientLastMessage(selectedClient.id, type === 'image' ? '📷 Imagem' : `📎 Arquivo`);
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar arquivo';
      console.error(message);
      toast.error('Erro ao enviar arquivo');
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.click();
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = '*/*';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const isImage = file.type.startsWith('image/');
    handleFileUpload(file, isImage ? 'image' : 'file');
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleAudioUpload(audioBlob);
        
        // Encerra o stream de áudio
        stream.getTracks().forEach(track => track.stop());
        
        setIsRecording(false);
        setRecordingTime(0);
        if (recordingTimerRef.current) {
          clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Inicia o contador de tempo
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
    } catch (err) {
      console.error('Erro ao iniciar gravação:', err);
      toast.error('Não foi possível acessar o microfone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleAudioUpload = async (audioBlob: Blob) => {
    if (!selectedClient) return;
    
    try {
      // Cria um arquivo a partir do blob
      const fileName = `audio_${Date.now()}.wav`;
      const audioFile = new File([audioBlob], fileName, { type: 'audio/wav' });
      
      // Upload do arquivo para o storage do Supabase
      const filePath = `${user?.id}/${selectedClient.id}/${fileName}`;
      
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from('chat_files')
        .upload(filePath, audioFile);
      
      if (uploadError) throw uploadError;
      
      // Obtém a URL pública do arquivo
      const { data: { publicUrl } } = supabase
        .storage
        .from('chat_files')
        .getPublicUrl(filePath);
      
      // Salva a mensagem no banco de dados
      const newMsg = {
        content: 'Áudio',
        sender_id: user?.id,
        receiver_id: selectedClient.id,
        created_at: new Date().toISOString(),
        type: 'audio',
        file_url: publicUrl,
        duration: recordingTime,
        read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMsg)
        .select();
      
      if (error) throw error;
      
      // Adiciona a mensagem à lista local
      const message: Message = {
        id: data[0].id,
        sender: user?.email || 'Você',
        content: 'Áudio',
        timestamp: new Date().toISOString(),
        isOutgoing: true,
        type: 'audio',
        fileUrl: publicUrl,
        duration: recordingTime,
        read: false
      };
      
      setMessages((prev) => [...prev, message]);
      
      // Atualiza o último status da mensagem no cliente
      updateClientLastMessage(selectedClient.id, '🎤 Áudio');
      
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Falha ao enviar áudio';
      console.error(message);
      toast.error('Erro ao enviar áudio');
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
  };

  const formatLastAppointment = (dateString: string | null) => {
    if (!dateString) return 'Sem consultas';
    try {
      return format(parseISO(dateString), 'dd/MM/yyyy');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const filteredClients = clients.filter((client) =>
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.phone && client.phone.includes(searchTerm))
  );

  const renderMessageContent = (message: Message) => {
    switch (message.type) {
      case 'image':
        return (
          <div className="relative">
            <img 
              src={message.fileUrl} 
              alt="Imagem" 
              className="max-w-full rounded-lg max-h-72 object-contain cursor-pointer" 
              onClick={() => window.open(message.fileUrl, '_blank')}
            />
          </div>
        );
      case 'file':
        return (
          <div className="flex items-center space-x-2">
            <Paperclip size={16} />
            <a 
              href={message.fileUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              {message.fileName || 'Arquivo'}
            </a>
          </div>
        );
      case 'audio':
        return (
          <div className="flex items-center space-x-2">
            <audio src={message.fileUrl} controls className="max-w-[200px]" />
            <span className="text-xs text-gray-500">
              {message.duration ? formatRecordingTime(message.duration) : '00:00'}
            </span>
          </div>
        );
      default:
        return <div className="text-sm">{message.content}</div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-2rem)] -mt-6 -mx-8">
        {/* Clients Sidebar */}
        <div className="w-80 border-r bg-white flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
              className="flex-1 mr-2"
            />
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:bg-primary-50"
                onClick={() => setShowCreateClientModal(true)}
                title="Adicionar novo cliente"
              >
                <UserPlus size={20} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:bg-primary-50"
                onClick={() => setShowWhatsAppModal(true)}
                title="Conectar WhatsApp"
              >
                <QrCode size={20} />
              </Button>
            </div>
          </div>
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-4 text-center text-gray-500 flex justify-center">
                <Spinner size="md" /> <span className="ml-2">Carregando clientes...</span>
              </div>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <div
                  key={client.id}
                  className={`relative w-full border-b ${
                    selectedClient?.id === client.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <button
                    className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors"
                    onClick={() => setSelectedClient(client)}
                  >
                    <div className="relative">
                      <Avatar size="md" alt={client.name} src={client.avatar_url} />
                      {client.unread_count && client.unread_count > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {client.unread_count}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium flex items-center">
                        {client.name}
                        {client.is_pinned && (
                          <Pin size={14} className="ml-1 text-primary-500" />
                        )}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-[180px]">
                        {client.last_message || client.email}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {formatLastAppointment(clientsWithLastAppointment[client.id])}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      {client.last_message_time && (
                        <div className="text-xs text-gray-500">
                          {new Date(client.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </div>
                      )}
                      <button
                        className={`mt-1 p-1 rounded-full ${client.is_pinned ? 'text-primary-500 hover:bg-primary-50' : 'text-gray-400 hover:bg-gray-100'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePinClient(client.id);
                        }}
                        title={client.is_pinned ? "Desafixar contato" : "Fixar contato"}
                      >
                        <Pin size={14} />
                      </button>
                    </div>
                  </button>
                  
                  {/* Menu de opções do cliente */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <button 
                        className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreVertical size={16} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48" align="end" side="bottom">
                      <div className="py-1">
                        <button
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => togglePinClient(client.id)}
                        >
                          <Pin size={16} />
                          <span>{client.is_pinned ? 'Desafixar contato' : 'Fixar contato'}</span>
                        </button>
                        <button
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => {
                            if (client.unread_count && client.unread_count > 0) {
                              markMessagesAsRead(client.id);
                            }
                          }}
                        >
                          <Bell size={16} />
                          <span>Marcar como lido</span>
                        </button>
                        {client.phone && (
                          <button
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            onClick={() => {
                              const formattedPhone = client.phone?.replace(/\D/g, '');
                              window.open(`https://wa.me/${formattedPhone}`, '_blank');
                            }}
                          >
                            <Phone size={16} />
                            <span>Abrir WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente disponível'}
                <div className="mt-4">
                  <Button 
                    variant="primary"
                    onClick={() => setShowCreateClientModal(true)}
                    leftIcon={<UserPlus size={16} />}
                  >
                    Adicionar Cliente
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50">
          {selectedClient ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-white border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar size="md" alt={selectedClient.name} src={selectedClient.avatar_url} />
                  <div>
                    <div className="font-medium flex items-center">
                      {selectedClient.name}
                      {selectedClient.is_pinned && (
                        <Pin size={14} className="ml-1 text-primary-500" />
                      )}
                    </div>
                    <div className="flex space-x-2 text-sm text-gray-500">
                      {selectedClient.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {selectedClient.phone}
                        </div>
                      )}
                      {selectedClient.email && (
                        <div className="flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {selectedClient.email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {/* Botão para visualizar agendamentos */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        title="Ver agendamentos"
                      >
                        <Calendar size={18} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="end" side="bottom">
                      <div className="p-3 border-b">
                        <h3 className="font-medium">Agendamentos de {selectedClient.name}</h3>
                      </div>
                      <ClientAppointmentsList clientId={selectedClient.id} />
                    </PopoverContent>
                  </Popover>
                  
                  {selectedClient.phone && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        const formattedPhone = selectedClient.phone?.replace(/\D/g, '');
                        window.open(`https://wa.me/${formattedPhone}`, '_blank');
                      }}
                    >
                      <Phone size={18} />
                    </Button>
                  )}
                  <Button variant="ghost" size="sm">
                    <Video size={18} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Search size={18} />
                  </Button>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical size={18} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48" align="end" side="bottom">
                      <div className="py-1">
                        <button
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          onClick={() => togglePinClient(selectedClient.id)}
                        >
                          <Pin size={16} />
                          <span>{selectedClient.is_pinned ? 'Desafixar contato' : 'Fixar contato'}</span>
                        </button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Messages */}
              <div 
                className="flex-1 overflow-y-auto p-4"
                style={{ backgroundImage: 'url(/images/chat-background.png)', backgroundSize: 'contain' }}
              >
                {loadingMessages ? (
                  <div className="flex justify-center items-center h-full">
                    <Spinner size="lg" />
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.isOutgoing
                              ? 'bg-green-100 text-gray-900'
                              : 'bg-white text-gray-900'
                          }`}
                        >
                          {renderMessageContent(message)}
                          <div
                            className={`text-xs mt-1 flex items-center justify-end ${
                              message.isOutgoing ? 'text-gray-500' : 'text-gray-500'
                            }`}
                          >
                            {new Date(message.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            {message.isOutgoing && (
                              <svg className={`w-4 h-4 ml-1 ${message.read ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <div className="bg-gray-100 rounded-full p-6 mb-4">
                      <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="font-medium">Inicie uma conversa com {selectedClient.name}</p>
                    <p className="text-sm mt-1">Envie uma mensagem para começar a conversar</p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-3 bg-white border-t">
                {isRecording ? (
                  <div className="flex items-center space-x-4 p-2 bg-gray-50 rounded-full">
                    <div className="flex-1 flex items-center">
                      <span className="animate-pulse">
                        <Mic size={20} className="text-red-500 mr-2" />
                      </span>
                      <span className="text-red-500">Gravando... {formatRecordingTime(recordingTime)}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={stopRecording}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X size={20} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={stopRecording}
                      className="text-gray-500 hover:text-green-500"
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                    <div className="flex space-x-2">
                      <Popover open={isAttachmentMenuOpen} onOpenChange={setIsAttachmentMenuOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <Paperclip size={20} />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2" align="start" side="top">
                          <div className="flex flex-col space-y-2">
                            <button
                              type="button"
                              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md w-full text-left"
                              onClick={() => {
                                handleImageClick();
                                setIsAttachmentMenuOpen(false);
                              }}
                            >
                              <Image size={18} />
                              <span>Imagem</span>
                            </button>
                            <button
                              type="button"
                              className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-md w-full text-left"
                              onClick={() => {
                                handleFileClick();
                                setIsAttachmentMenuOpen(false);
                              }}
                            >
                              <Paperclip size={18} />
                              <span>Documento</span>
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                      
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                    
                    <div className="flex-1 relative">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Digite uma mensagem..."
                        className="rounded-full py-2 px-4"
                      />
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              className="text-gray-500 hover:text-gray-700"
                            >
                              <Smile size={20} />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-64 p-0" align="end" side="top">
                            <EmojiPicker onEmojiSelect={handleEmojiSelect} />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    {newMessage.trim() ? (
                      <Button 
                        type="submit" 
                        variant="primary" 
                        size="sm" 
                        className="rounded-full w-10 h-10 flex items-center justify-center"
                      >
                        <Send size={18} />
                      </Button>
                    ) : (
                      <Button 
                        type="button" 
                        variant="primary" 
                        size="sm" 
                        className="rounded-full w-10 h-10 flex items-center justify-center"
                        onClick={startRecording}
                      >
                        <Mic size={18} />
                      </Button>
                    )}
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center flex-col text-gray-500 bg-gray-50">
              <div className="bg-gray-100 rounded-full p-8 mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium mb-2">Bem-vindo ao seu chat</h2>
              <p className="text-center max-w-md">
                Selecione um cliente para iniciar uma conversa ou use a barra de pesquisa para encontrar contatos
              </p>
              <div className="mt-6">
                <Button 
                  variant="primary"
                  onClick={() => setShowCreateClientModal(true)}
                  leftIcon={<UserPlus size={16} />}
                >
                  Adicionar Novo Cliente
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* WhatsApp Modal */}
        {showWhatsAppModal && (
          <WhatsAppModal onClose={() => setShowWhatsAppModal(false)} />
        )}
        
        {/* Create Client Modal */}
        {showCreateClientModal && calendarId && (
          <CreateClientModal 
            calendarId={calendarId}
            onClose={() => setShowCreateClientModal(false)} 
            onSuccess={handleClientCreated}
          />
        )}
        
        {/* Container de Toast para notificações visuais */}
        <ToastContainer />
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
