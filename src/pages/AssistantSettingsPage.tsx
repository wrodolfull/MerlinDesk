import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';
import { Loader } from 'lucide-react';
 
const AssistantSettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assistantInfo, setAssistantInfo] = useState({
    id: '',
    assistant_name: '',
    instructions: ''
  });

  useEffect(() => {
    if (user?.id) {
      fetchAssistantInfo();
    }
  }, [user?.id]);

  const fetchAssistantInfo = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assistant_settings')
        .select('*')
        .eq('user_id', user?.id)
        .single();
      
      if (error) {
        console.error('Erro ao buscar informações do assistente:', error);
        if (error.code === 'PGRST116') {
          // Criar um novo assistente se não existir
          createNewAssistant();
        }
        return;
      }
      
      setAssistantInfo({
        id: data.id,
        assistant_name: data.assistant_name,
        instructions: data.instructions
      });
    } catch (error) {
      console.error('Erro ao buscar informações do assistente:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewAssistant = async () => {
    try {
      const defaultInstructions = `Você é um assistente virtual para agendamentos. Ajude o usuário com informações sobre a agenda, horários disponíveis e detalhes de compromissos. Responda em tom profissional e amigável. Lembre-se sempre de cumprimentar o usuário pelo nome.`;
      
      const { data, error } = await supabase
        .from('assistant_settings')
        .insert({
          user_id: user?.id,
          assistant_name: `Assistente de ${user?.user_metadata?.name || 'Usuário'}`,
          instructions: defaultInstructions,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      
      setAssistantInfo({
        id: data.id,
        assistant_name: data.assistant_name,
        instructions: data.instructions
      });
    } catch (error) {
      console.error('Erro ao criar novo assistente:', error);
      toast.error('Erro ao criar assistente virtual');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('assistant_settings')
        .update({
          assistant_name: assistantInfo.assistant_name,
          instructions: assistantInfo.instructions,
          updated_at: new Date().toISOString()
        })
        .eq('id', assistantInfo.id);
      
      if (error) throw error;
      
      toast.success('Configurações do assistente atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações do assistente');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAssistantInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleClearHistory = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico de conversas?')) return;
    
    try {
      const { error } = await supabase
        .from('assistant_messages')
        .delete()
        .eq('user_id', user?.id);
      
      if (error) throw error;
      
      toast.success('Histórico de conversas limpo com sucesso!');
    } catch (error) {
      console.error('Erro ao limpar histórico:', error);
      toast.error('Erro ao limpar histórico de conversas');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Assistente Virtual</h1>
        <p className="text-gray-600">Personalize seu assistente para melhor atender suas necessidades</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personalização do Assistente</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Assistente
            </label>
            <Input
              name="assistant_name"
              value={assistantInfo.assistant_name}
              onChange={handleChange}
              placeholder="Nome do seu assistente"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instruções (personalidade e conhecimento)
            </label>
            <textarea
              name="instructions"
              value={assistantInfo.instructions}
              onChange={handleChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              placeholder="Defina como seu assistente deve se comportar e quais conhecimentos específicos ele deve ter..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Estas instruções definem a personalidade e o conhecimento específico do seu assistente.
              Seja específico sobre como você quer que ele responda e quais informações ele deve priorizar.
            </p>
          </div>
          
          <div className="flex justify-between items-center pt-4">
            <Button 
              variant="outline" 
              onClick={handleClearHistory}
            >
              Limpar Histórico de Conversas
            </Button>
            
            <Button 
              onClick={handleSaveChanges} 
              isLoading={saving}
              disabled={saving}
            >
              Salvar Configurações
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default AssistantSettingsPage;
