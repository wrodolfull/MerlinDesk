// AssistantChat.tsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Bot, Clock, Users, MessageSquare, BarChart3, X, MoreHorizontal, Settings, Trash2, Sparkles, Stars, MessageCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import { Card } from '../ui/Card';
import Input from '../ui/Input';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  role: 'user' | 'assistant';
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

export const AssistantChat: React.FC = () => {
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
  const [input, setInput] = useState('');
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
    }
  ];

  const categories = [
  { id: 'all', label: 'Todos', icon: '📋' },
  { id: 'consulta', label: 'Consultas', icon: '🔍' },
  { id: 'relatorio', label: 'Relatórios', icon: '📊' }
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
        timestamp: new Date(),
        role: 'assistant'
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: generateUniqueId(), role: 'user', content: userMessage, isUser: true, timestamp: new Date() }]);
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('https://zqtrmtkbkdzyapdtapss.supabase.co/functions/v1/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: userMessage,
          userId: user?.id
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMessages(prev => [...prev, { id: generateUniqueId(), role: 'assistant', content: data.content, isUser: false, timestamp: new Date() }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        id: generateUniqueId(),
        role: 'assistant', 
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        isUser: false, 
        timestamp: new Date()
      }]);
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
      timestamp: new Date(),
      role: 'assistant'
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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 p-3 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col shadow-xl">
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Assistente Virtual</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <ReactMarkdown className="prose prose-sm max-w-none">
                {message.content}
              </ReactMarkdown>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="px-4"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default AssistantChat;
