import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Send, Phone, Video, MoreVertical, Search, QrCode } from 'lucide-react';
import Avatar from '../components/ui/Avatar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import WhatsAppModal from '../components/modals/WhatsAppModal';

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isOutgoing: boolean;
}

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchClients();
    }
  }, [user?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user?.id)
        .order('name');

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clients';
      console.error(message);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedClient) return;

    const message: Message = {
      id: Date.now().toString(),
      sender: user?.email || 'You',
      content: newMessage,
      timestamp: new Date().toISOString(),
      isOutgoing: true,
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage('');
  };

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-2rem)] -mt-6 -mx-8">
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="outline"
            leftIcon={<QrCode size={18} />}
            onClick={() => setShowWhatsAppModal(true)}
          >
            Connect WhatsApp
          </Button>
        </div>

        {/* Clients Sidebar */}
        <div className="w-80 border-r bg-white">
          <div className="p-4 border-b">
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading clients...</div>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <button
                  key={client.id}
                  className={`w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors ${
                    selectedClient?.id === client.id ? 'bg-primary-50' : ''
                  }`}
                  onClick={() => setSelectedClient(client)}
                >
                  <Avatar size="md" alt={client.name} />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{client.name}</div>
                    <div className="text-sm text-gray-500">{client.email}</div>
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? 'No clients found' : 'No clients available'}
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
                  <Avatar size="md" alt={selectedClient.name} />
                  <div>
                    <div className="font-medium">{selectedClient.name}</div>
                    <div className="text-sm text-gray-500">{selectedClient.email}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone size={18} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video size={18} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical size={18} />
                  </Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.isOutgoing
                            ? 'bg-primary-600 text-white'
                            : 'bg-white text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.isOutgoing ? 'text-primary-100' : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 bg-white border-t">
                <div className="flex space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <Send size={18} />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a client to start chatting
            </div>
          )}
        </div>

        {/* WhatsApp Modal */}
        {showWhatsAppModal && (
          <WhatsAppModal onClose={() => setShowWhatsAppModal(false)} />
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;
