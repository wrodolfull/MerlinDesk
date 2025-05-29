import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import LanguageSelector from '../components/ui/LanguageSelector';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';
import { useAuth } from '../contexts/AuthContext';
import { CreditCard, Check, Key, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface ProfileSettingsForm {
  name: string;
  email: string;
  phone: string;
  timezone: string;
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface NotificationSettingsForm {
  emailNotifications: boolean;
  smsNotifications: boolean;
  reminderTime: number;
}

interface APIKeysForm {
  openaiKey: string;
  deepseekKey: string;
}

const SettingsPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { timezone, setTimezone } = useSettings();
  const { user } = useAuth();
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [apiKeys, setApiKeys] = useState<APIKeysForm>({
    openaiKey: '',
    deepseekKey: '',
  });

  // Get the active tab from URL params or default to 'general'
  const searchParams = new URLSearchParams(location.search);
  const activeTab = searchParams.get('tab') || 'general';

  const setTab = (tab: string) => {
    navigate(`/settings?tab=${tab}`);
  };

  useEffect(() => {
    // If user is not authenticated, set loading to false and return early
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch subscription data
        const { data: subscription, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            plan:subscription_plans(*)
          `)
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        if (subscriptionError) throw subscriptionError;
        setCurrentPlan(subscription?.plan || null);

        // Fetch API keys
        const { data: settings, error: settingsError } = await supabase
          .from('user_settings')
          .select('openai_key, deepseek_key')
          .eq('user_id', user.id)
          .single();

        if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;

        if (settings) {
          setApiKeys({
            openaiKey: settings.openai_key || '',
            deepseekKey: settings.deepseek_key || '',
          });
        }

        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const profileForm = useForm<ProfileSettingsForm>({
    defaultValues: {
      name: user?.user_metadata?.full_name || user?.user_metadata?.name || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
      timezone: timezone,
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const notificationForm = useForm<NotificationSettingsForm>({
    defaultValues: {
      emailNotifications: true,
      smsNotifications: true,
      reminderTime: 24,
    },
  });

  const apiKeysForm = useForm<APIKeysForm>({
    defaultValues: apiKeys,
  });

  const onProfileSubmit = async (data: ProfileSettingsForm) => {
    try {
      setUpdating(true);
      setTimezone(data.timezone);

      // Preparar dados para atualização
      const updateData: any = {
        data: {
          full_name: data.name,
          name: data.name,
          phone: data.phone,
        }
      };

      // Atualizar email se foi alterado
      if (data.email !== user?.email) {
        updateData.email = data.email;
        toast.success('Um email de confirmação foi enviado para o novo endereço');
      }

      // Atualizar senha se fornecida
      if (data.currentPassword && data.newPassword) {
        // Verificar senha atual
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user?.email || '',
          password: data.currentPassword,
        });

        if (signInError) {
          toast.error('Senha atual incorreta');
          return;
        }

        updateData.password = data.newPassword;
      }

      // Atualizar dados do usuário
      const { error: updateError } = await supabase.auth.updateUser(updateData);

      if (updateError) throw updateError;

      toast.success('Perfil atualizado com sucesso');
      
      // Limpar campos de senha
      profileForm.setValue('currentPassword', '');
      profileForm.setValue('newPassword', '');
      profileForm.setValue('confirmPassword', '');

    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.message || 'Falha ao atualizar perfil');
    } finally {
      setUpdating(false);
    }
  };

  const onNotificationSubmit = (data: NotificationSettingsForm) => {
    console.log('Notification settings:', data);
    toast.success('Configurações de notificação salvas');
  };

  const onAPIKeysSubmit = async (data: APIKeysForm) => {
    try {
      const { error } = await supabase
        .from('user_settings')
        .upsert({
          user_id: user?.id,
          openai_key: data.openaiKey,
          deepseek_key: data.deepseekKey,
        });

      if (error) throw error;

      toast.success('Chaves de API atualizadas com sucesso');
      setApiKeys(data);
    } catch (err) {
      console.error('Erro ao atualizar chaves de API:', err);
      toast.error('Falha ao atualizar chaves de API');
    }
  };

  const handleUpgrade = () => {
    navigate('/pricing');
  };

  const formatFeatureLabel = (key: string, value: any): string => {
    const labels: Record<string, string> = {
      analytics: 'Relatórios e Análises',
      calendars: 'Calendários',
      professionals: 'Profissionais',
      custom_branding: 'Marca personalizada',
      sms_notifications: 'Notificações por SMS',
      email_notifications: 'Notificações por Email',
      appointments_per_month: 'Agendamentos por mês',
    };

    if (typeof value === 'boolean') {
      return value ? `${labels[key]} habilitado` : `${labels[key]} desabilitado`;
    }

    if (value === -1) {
      return `${labels[key]} ilimitados`;
    }

    return `${value} ${labels[key]}`;
  };


  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600">Gerencie suas preferências e configurações da conta</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setTab('general')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Geral
          </button>
          <button
            onClick={() => setTab('notifications')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notifications'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notificações
          </button>
          <button
            onClick={() => setTab('api-keys')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'api-keys'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Chaves de API
          </button>
          <button
            onClick={() => setTab('subscription')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'subscription'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Assinatura
          </button>
        </nav>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        {activeTab === 'general' && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Idioma</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-w-xs">
                  <LanguageSelector />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="mr-2" size={20} />
                  Informações do Perfil
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                  <Input
                    label="Nome Completo"
                    {...profileForm.register('name', { required: 'Nome é obrigatório' })}
                  />
                  
                  <Input
                    label="Email"
                    type="email"
                    {...profileForm.register('email', { 
                      required: 'Email é obrigatório',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Email inválido'
                      }
                    })}
                  />
                  
                  <Input
                    label="Telefone"
                    {...profileForm.register('phone', {
                      pattern: {
                        value: /^[\d\s\(\)\-\+]+$/,
                        message: 'Formato de telefone inválido'
                      }
                    })}
                    placeholder="(11) 99999-9999"
                  />
                  
                  <Controller
                    name="timezone"
                    control={profileForm.control}
                    render={({ field }) => (
                      <Select
                        label="Fuso Horário"
                        options={[
                          { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
                          { value: 'America/New_York', label: 'New York (GMT-4)' },
                          { value: 'America/Los_Angeles', label: 'Los Angeles (GMT-7)' },
                          { value: 'Europe/London', label: 'London (GMT+1)' },
                          { value: 'Europe/Paris', label: 'Paris (GMT+2)' },
                          { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
                        ]}
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  <div className="pt-4 border-t">
                    <h3 className="text-lg font-medium mb-4">Alterar Senha</h3>
                    
                    <Input
                      type="password"
                      label="Senha Atual"
                      {...profileForm.register('currentPassword', {
                        validate: (value) => {
                          const newPass = profileForm.watch('newPassword');
                          if (newPass && !value) {
                            return 'Senha atual é obrigatória para alterar a senha';
                          }
                          return true;
                        }
                      })}
                    />

                    <Input
                      type="password"
                      label="Nova Senha"
                      {...profileForm.register('newPassword', {
                        minLength: {
                          value: 8,
                          message: 'A senha deve ter pelo menos 8 caracteres',
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: 'A senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'
                        }
                      })}
                    />

                    <Input
                      type="password"
                      label="Confirmar Nova Senha"
                      {...profileForm.register('confirmPassword', {
                        validate: value => {
                          const newPassword = profileForm.watch('newPassword');
                          return !newPassword || value === newPassword || 'As senhas não coincidem';
                        }
                      })}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" isLoading={updating}>
                      {updating ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        )}

        {/* Notification Settings */}
        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...notificationForm.register('emailNotifications')}
                  />
                  <label htmlFor="emailNotifications" className="text-sm text-gray-700">
                    Notificações por Email
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smsNotifications"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    {...notificationForm.register('smsNotifications')}
                  />
                  <label htmlFor="smsNotifications" className="text-sm text-gray-700">
                    Notificações por SMS
                  </label>
                </div>

                <Input
                  type="number"
                  label="Tempo de Lembrete (horas)"
                  {...notificationForm.register('reminderTime', {
                    required: true,
                    min: 1,
                    max: 72,
                  })}
                />

                <div className="flex justify-end">
                  <Button type="submit">
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* API Keys Settings */}
        {activeTab === 'api-keys' && (
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Chaves de API</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={apiKeysForm.handleSubmit(onAPIKeysSubmit)} className="space-y-4">
                <Input
                  label="Chave da API OpenAI"
                  type="password"
                  leftIcon={<Key size={16} />}
                  {...apiKeysForm.register('openaiKey')}
                  placeholder="sk-..."
                />

                <Input
                  label="Chave da API DeepSeek"
                  type="password"
                  leftIcon={<Key size={16} />}
                  {...apiKeysForm.register('deepseekKey')}
                  placeholder="ds-..."
                />

                <div className="flex justify-end">
                  <Button type="submit">
                    Salvar Chaves de API
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Subscription Settings */}
        {activeTab === 'subscription' && (
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div>Carregando detalhes da assinatura...</div>
              ) : error ? (
                <div className="text-red-600">Erro ao carregar assinatura: {error}</div>
              ) : currentPlan ? (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Plano {currentPlan.name}</h3>
                      <p className="text-gray-600">{currentPlan.description}</p>
                    </div>
                    <CreditCard className="h-8 w-8 text-primary-600" />
                  </div>

                  <div className="space-y-3 mb-6">
                    {Object.entries(currentPlan.features || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 text-primary-500 mr-3" />
                      <span>{formatFeatureLabel(key, value)}</span>
                    </div>
                  ))}
                  </div>

                  {(!currentPlan.name || currentPlan.name === 'Free') && (
                    <Button onClick={handleUpgrade} className="w-full">
                      Fazer Upgrade para Plano Business
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Nenhuma assinatura ativa encontrada</p>
                  <Button onClick={handleUpgrade}>
                    Ver Planos Disponíveis
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SettingsPage;
