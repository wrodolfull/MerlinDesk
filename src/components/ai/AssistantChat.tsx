import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Send, X, MessageSquare, Stars } from 'lucide-react';
import Button from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Loader } from 'lucide-react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}


const AssistantChat: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [assistantInfo, setAssistantInfo] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Buscar informações do assistente quando o usuário logar
  useEffect(() => {
    if (user?.id) {
      fetchAssistantInfo();
    }
  }, [user?.id]);
  
  // Saudar o usuário quando ele abre o chat pela primeira vez
  useEffect(() => {
    if (isOpen && messages.length === 0 && user && assistantInfo) {
      const greeting = `Olá ${displayName}! Sou seu assistente virtual para agendamentos. Como posso ajudá-lo hoje?`;
      setMessages([{ role: 'assistant', content: greeting, timestamp: new Date() }]);
    }
  }, [isOpen, user, assistantInfo]);
  
  // Rolar para a última mensagem
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const fetchAssistantInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('assistant_settings')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();
      
      if (error) {
        // Criar um novo assistente se não existir
        createNewAssistant();
        return;
      }
      
      setAssistantInfo(data);
    } catch (error) {
      console.error('Erro ao buscar informações do assistente:', error);
    }
  };
  const displayName = (user as any).name || (user as any).user_metadata?.name || 'cliente';

  const createNewAssistant = async () => {
    try {
      // Criar um novo assistente no banco de dados
      const { data, error } = await supabase
        .from('assistant_settings')
        .insert({
          user_id: user?.id,
          assistant_name: `Assistente de ${displayName}`,
          instructions: 'Você é um assistente virtual para agendamentos. Ajude o usuário com informações sobre a agenda, horários disponíveis e detalhes de compromissos.',
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setAssistantInfo(data);
    } catch (error) {
      console.error('Erro ao criar novo assistente:', error);
    }
  };
  
  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !user) return;
    
    const userMessage: Message = {
        role: 'user',
        content: inputMessage,
        timestamp: new Date(),
      };
      
      setMessages([...messages, userMessage]);
      setInputMessage('');
      setIsLoading(true);
          
    try {
      // Fazer requisição para o backend que irá interagir com a OpenAI
      const session = await supabase.auth.getSession();
      const token = session.data.session?.access_token;

      const response = await fetch('https://zqtrmtkbkdzyapdtapss.supabase.co/functions/v1/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: inputMessage,
          assistantId: assistantInfo?.id,
          userId: user.id,
        }),
      });
      
      const data = await response.json();
      
      if (data.error) {
        setMessages([...messages, userMessage, { 
          role: 'assistant', 
          content: 'Desculpe, ocorreu um erro ao processar sua mensagem.', 
          timestamp: new Date() 
        }]);
        return;
      }
      
      setMessages([...messages, userMessage, { 
        role: 'assistant', 
        content: data.content, 
        timestamp: new Date() 
      }]);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages([...messages, userMessage, { 
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro de conexão.', 
        timestamp: new Date() 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botão de chat flutuante */}
      {!isOpen && (
        <Button 
          className="rounded-full w-14 h-14 flex items-center justify-center shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Stars size={24} />
        </Button>
      )}
      
      {/* Container do chat */}
      {isOpen && (
        <Card className="w-80 md:w-96 h-[500px] flex flex-col shadow-xl">
          <CardHeader className="p-4 border-b">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-medium">Assistente Virtual</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Mensagens */}
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Indicador de carregamento */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-lg p-3 bg-gray-100">
                  <Loader className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            
            {/* Referência para rolar para a última mensagem */}
            <div ref={messagesEndRef} />
          </CardContent>
          
          {/* Área de input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <Button 
                onClick={handleSendMessage} 
                disabled={isLoading || !inputMessage.trim()}
              >
                <Send size={18} />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AssistantChat;
