// AssistantChat.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Clock, Users, MessageSquare, BarChart3, X, MoreHorizontal, Settings, Trash2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface QuickCommand {
  label: string;
  command: string;
  icon: React.ReactNode;
  category: string;
  description?: string;
}

interface AssistantSettings {
  assistant_name: string;
  welcome_message: string;
  auto_responses: boolean;
}

const AssistantChat: React.FC = () => {
  const { user } = useAuth();
  
  // Estados inicializados com valores padrão para evitar undefined
  const [assistantName, setAssistantName] = useState('Assistente Virtual');
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Configurações com valores padrão
  const [settings, setSettings] = useState<AssistantSettings>({
    assistant_name: 'Assistente Virtual',
    welcome_message: 'Olá! 👋 Sou seu assistente virtual para agendamentos. Como posso ajudar hoje?',
    auto_responses: true
  });
  
  // Estados de mensagens e input com valores iniciais seguros
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState(''); // Sempre string vazia
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Função para gerar ID único
  const generateUniqueId = useCallback(() => {
    return `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const quickCommands: QuickCommand[] = [
    { 
      label: 'Agendamentos Hoje', 
      command: 'Mostrar agendamentos de hoje', 
      icon: <Clock className="w-4 h-4" />, 
      category: 'consulta',
      description: 'Lista todos os agendamentos do dia atual'
    },
    { 
      label: 'Agendamentos Amanhã', 
      command: 'Mostrar agendamentos de amanhã', 
      icon: <Clock className="w-4 h-4" />, 
      category: 'consulta',
      description: 'Lista agendamentos do próximo dia'
    },
    { 
      label: 'Pendentes', 
      command: 'Mostrar agendamentos pendentes', 
      icon: <Users className="w-4 h-4" />, 
      category: 'consulta',
      description: 'Agendamentos aguardando confirmação'
    },
    { 
      label: 'Confirmados', 
      command: 'Mostrar agendamentos confirmados', 
      icon: <Users className="w-4 h-4" />, 
      category: 'consulta',
      description: 'Agendamentos já confirmados'
    },
    { 
      label: 'Relatório Geral', 
      command: 'Gerar relatório de agendamentos', 
      icon: <BarChart3 className="w-4 h-4" />, 
      category: 'relatorio',
      description: 'Relatório completo de agendamentos'
    },
    { 
      label: 'Status do Bot', 
      command: 'Verificar status do sistema de agendamentos', 
      icon: <Bot className="w-4 h-4" />, 
      category: 'sistema',
      description: 'Verifica funcionamento geral do sistema'
    }
  ];

  const categories = [
  { id: 'all', label: 'Todos', icon: '📋' },
  { id: 'consulta', label: 'Consultas', icon: '🔍' },
  { id: 'relatorio', label: 'Relatórios', icon: '📊' },
  { id: 'sistema', label: 'Sistema', icon: '⚙️' }
  ];

  // Carregar configurações do assistente
  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('assistant_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (data && !error) {
          const newSettings = {
            assistant_name: data.assistant_name || 'Assistente Virtual',
            welcome_message: data.welcome_message || 'Olá! 👋 Sou seu assistente virtual para agendamentos. Como posso ajudar hoje?',
            auto_responses: data.auto_responses !== undefined ? data.auto_responses : true
          };
          
          setSettings(newSettings);
          setAssistantName(newSettings.assistant_name);
        }
      } catch (error) {
        console.log('Configurações não encontradas, usando padrão:', error);
      }
    };
    
    fetchSettings();
  }, [user?.id]);

  // Inicializar mensagem de boas-vindas
  useEffect(() => {
    if (settings.welcome_message && messages.length === 0) {
      setMessages([{
        id: generateUniqueId(),
        content: settings.welcome_message,
        isUser: false,
        timestamp: new Date()
      }]);
    }
  }, [settings.welcome_message, messages.length, generateUniqueId]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focar input quando abrir
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const saveSettings = async (newSettings: Partial<AssistantSettings>) => {
    if (!user?.id) return;
    
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      const { error } = await supabase
        .from('assistant_settings')
        .upsert({
          user_id: user.id,
          ...updatedSettings
        });
      
      if (!error) {
        setSettings(updatedSettings);
        if (newSettings.assistant_name) {
          setAssistantName(newSettings.assistant_name);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = {
      id: generateUniqueId(),
      content: text,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage(''); // Sempre string vazia
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Simular delay de digitação
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          message: text,
          assistantId: 'agendamentos-bot',
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: generateUniqueId(),
        content: data.content || 'Desculpe, não consegui processar sua solicitação.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: generateUniqueId(),
        content: '❌ Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const clearMessages = () => {
    setMessages([{
      id: generateUniqueId(),
      content: settings.welcome_message,
      isUser: false,
      timestamp: new Date()
    }]);
  };

  // Função formatMessageContent com verificação de segurança
  const formatMessageContent = (content: string | undefined | null) => {
    // Verificação de segurança para evitar erro de undefined
    if (!content || typeof content !== 'string') {
      return '';
    }
    
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-gray-200 px-1 rounded">$1</code>')
      .replace(/\n/g, '<br>')
      .replace(/#{1,6}\s*(.*?)(?:\n|$)/g, '<h3 style="margin: 10px 0; font-weight: bold; font-size: 14px;">$1</h3>')
      .replace(/•\s*(.*?)(?:\n|<br>)/g, '<div style="margin-left: 15px; margin: 2px 0;">• $1</div>');
  };

  const filteredCommands = selectedCategory === 'all' 
    ? quickCommands 
    : quickCommands.filter(cmd => cmd.category === selectedCategory);

  return (
    <>
      {/* Botão flutuante */}
      <button 
        onClick={() => setIsOpen(prev => !prev)} 
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-all duration-200 hover:scale-110"
        title={isOpen ? 'Fechar assistente' : 'Abrir assistente'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[400px] max-h-[600px] bg-white shadow-2xl border rounded-xl flex flex-col overflow-hidden z-50 animate-in slide-in-from-bottom-2 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <div>
                <div className="font-bold text-sm">{assistantName}</div>
                <div className="text-xs text-blue-100">
                  {isTyping ? 'Digitando...' : 'Online'}
                </div>
              </div>
            </div>
            
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setShowMenu(!showMenu)} 
                className="hover:bg-white/20 p-2 rounded-full transition-colors"
                title="Menu"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-white border shadow-lg rounded-lg z-50 max-h-80 overflow-hidden">
                  
                  {/* Header do menu */}
                  <div className="p-3 bg-gray-50 border-b flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">Comandos Rápidos</span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setShowSettings(true)}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Configurações"
                      >
                        <Settings className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={clearMessages}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Limpar conversa"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Filtros de categoria */}
                  <div className="p-2 border-b bg-gray-50">
                    <div className="flex flex-wrap gap-1">
                      {categories.map(category => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id)}
                          className={`text-xs px-2 py-1 rounded-full transition-colors ${
                            selectedCategory === category.id
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {category.icon} {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Lista de comandos */}
                  <div className="max-h-60 overflow-y-auto">
                    {filteredCommands.map((cmd, index) => (
                      <button
                        key={`${cmd.category}-${index}`}
                        onClick={() => { 
                          sendMessage(cmd.command); 
                          setShowMenu(false); 
                        }}
                        className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-100 transition-colors group"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 group-hover:text-blue-700 mt-0.5">
                            {cmd.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-800 group-hover:text-gray-900">
                              {cmd.label}
                            </div>
                            {cmd.description && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {cmd.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Área de mensagens */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-sm ${
                    message.isUser
                      ? 'bg-blue-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 rounded-bl-md border'
                  }`}
                >
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: formatMessageContent(message.content) 
                    }}
                  />
                  <div className={`text-xs mt-2 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {/* Indicador de digitação */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white border rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-xs text-gray-500">Digitando...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input de mensagem */}
          <div className="p-4 border-t bg-white">
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                sendMessage(inputMessage); 
              }} 
              className="flex gap-2"
            >
              <input
                ref={inputRef}
                value={inputMessage || ''} // Garantir que nunca seja undefined
                onChange={(e) => setInputMessage(e.target.value || '')} // Garantir string
                placeholder="Digite sua mensagem..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 text-sm"
                disabled={isLoading}
                maxLength={500}
              />
              <button 
                type="submit" 
                disabled={!inputMessage.trim() || isLoading} 
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-xl transition-colors"
                title="Enviar mensagem"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            
            <div className="text-xs text-gray-500 mt-2 text-center">
              💡 Fale comigo sobre agendamentos, relatórios ou status do sistema.
            </div>
          </div>
        </div>
      )}

      {/* Modal de configurações */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-lg p-6 w-96 max-w-[90vw]">
            <h3 className="text-lg font-bold mb-4">Configurações do Assistente</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Assistente</label>
                <input
                  type="text"
                  value={settings.assistant_name || ''} // Garantir que nunca seja undefined
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    assistant_name: e.target.value || '' 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Mensagem de Boas-vindas</label>
                <textarea
                  value={settings.welcome_message || ''} // Garantir que nunca seja undefined
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    welcome_message: e.target.value || '' 
                  }))}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 h-20 resize-none"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="auto-responses"
                  checked={settings.auto_responses || false} // Garantir boolean
                  onChange={(e) => setSettings(prev => ({ 
                    ...prev, 
                    auto_responses: e.target.checked 
                  }))}
                  className="rounded"
                />
                <label htmlFor="auto-responses" className="text-sm">Respostas automáticas</label>
              </div>
            </div>
            
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  saveSettings(settings);
                  setShowSettings(false);
                }}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Salvar
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AssistantChat;
