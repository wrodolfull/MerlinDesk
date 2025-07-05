import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader2, CalendarX2, ArrowRight, MessageCircle, Settings, Lock, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Switch } from '../components/ui/Switch';
import Button from '../components/ui/Button';
import { toast } from '../components/ui/Toast';
import WhatsAppTestModal from '../components/modals/WhatsAppTestModal';
import { checkWhatsAppStatus } from '/root/MerlinDesk/src/lib/whatsapp.ts';
import { useAuth } from '../contexts/AuthContext';
import { usePlanLimits } from '../hooks/usePlanLimits';
import { useGoogleCalendarSync } from '../hooks/useGoogleCalendarSync';
import googleIcon from '../../assets/google-icon.png';

export default function Integracoes() {
  const { user } = useAuth();
  const { limits } = usePlanLimits();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [whatsappStatus, setWhatsappStatus] = useState<any>(null);
  const [showWhatsAppTest, setShowWhatsAppTest] = useState(false);
  const [showGoogleSettings, setShowGoogleSettings] = useState(false);

  // Hook para sincronização do Google Calendar
  const { 
    settings, 
    isLoading, 
    isSyncing, 
    error: syncError, 
    toggleSync, 
    manualSync 
  } = useGoogleCalendarSync(userId || '');

  // Verificar se o usuário tem plano Empresa
  const hasEnterprisePlan = limits?.whatsapp_notifications === true;

  useEffect(() => {
    const getUser = async () => {
      if (user?.id) {
        setUserId(user.id);
        checkIntegrationStatus(user.id);
        if (hasEnterprisePlan) {
          checkWhatsAppIntegrationStatus();
        }
      }
    };
    getUser();
  }, [user, hasEnterprisePlan]);

  const checkIntegrationStatus = async (user_id: string) => {
    const { data, error } = await supabase
      .from('user_integrations')
      .select('status, last_sync_at')
      .eq('user_id', user_id)
      .eq('integration_type', 'google_calendar')
      .maybeSingle();

    if (data?.status === 'active') {
      setConnected(true);
      if (data.last_sync_at) {
        const formatted = new Date(data.last_sync_at).toLocaleString('pt-BR');
        setLastSync(formatted);
      }
    } else {
      setConnected(false);
      setLastSync(null);
    }

    if (error) {
      console.error(error);
      setError('Erro ao verificar integração.');
    }
  };

  const checkWhatsAppIntegrationStatus = async () => {
    try {
      const result = await checkWhatsAppStatus();
      setWhatsappStatus(result);
    } catch (error) {
      console.error('Erro ao verificar status do WhatsApp:', error);
    }
  };

  const handleGoogleAuth = () => {
    if (!userId) return alert('Usuário não autenticado');
    window.location.href = `https://merlindesk.com/google/auth?user_id=${userId}`;
  };

  const handleGoogleDisconnect = async () => {
    if (!userId) return alert('Usuário não autenticado');
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('https://merlindesk.com/google/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      if (res.ok) {
        setConnected(false);
        setLastSync(null);
        setShowGoogleSettings(false);
        alert('Integração revogada com sucesso.');
      } else {
        setError('Erro ao revogar integração.');
      }
    } catch (err) {
      console.error(err);
      setError('Erro de conexão com servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncToggle = async (enabled: boolean) => {
    try {
      await toggleSync(enabled);
      toast.success(enabled ? 'Sincronização bidirecional ativada!' : 'Sincronização bidirecional desativada!');
    } catch (error) {
      toast.error('Erro ao alterar configuração de sincronização');
    }
  };

  const handleManualSync = async () => {
    try {
      const result = await manualSync(7);
      toast.success(`Sincronização concluída: ${result.syncedCount} eventos sincronizados`);
    } catch (error) {
      toast.error('Erro na sincronização manual');
    }
  };

  const isWhatsAppConfigured = whatsappStatus?.success && 
    whatsappStatus?.status?.whatsapp_token && 
    whatsappStatus?.status?.whatsapp_phone_number_id;

  const isWebhookExpired = settings.webhookExpiresAt && settings.webhookExpiresAt < new Date();

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-gray-600">Conecte seus calendários e serviços ao MerlinDesk para sincronização automática.</p>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {syncError && <p className="text-red-600 mb-4">{syncError}</p>}

      {/* Google Calendar Integration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between px-4 py-3 border rounded-lg shadow-sm bg-white">
            <div className="flex items-center space-x-4">
              <img src={googleIcon} alt="Google Icon" className="w-10 h-10" />
              <div>
                <p className="font-semibold text-gray-800">Google Calendar</p>
                {connected ? (
                  <p className="text-sm text-green-600 font-medium flex items-center">
                    Conectado <CheckCircle className="w-4 h-4 ml-1" />
                  </p>
                ) : (
                  <p className="text-sm text-gray-500">Não conectado</p>
                )}
                {lastSync && (
                  <p className="text-sm text-gray-400">Última sincronização: <strong>{lastSync}</strong></p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {connected && (
                <Button
                  onClick={() => setShowGoogleSettings(!showGoogleSettings)}
                  variant="outline"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                  {showGoogleSettings ? (
                    <ChevronUp className="w-4 h-4 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 ml-2" />
                  )}
                </Button>
              )}
              {connected ? (
                <button
                  onClick={handleGoogleDisconnect}
                  className="text-red-600 border border-red-600 px-4 py-1 rounded hover:bg-red-50 flex items-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Desconectando...
                    </>
                  ) : (
                    <>
                      <CalendarX2 className="w-4 h-4 mr-2" />
                      Desconectar
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleGoogleAuth}
                  className="text-blue-600 border border-blue-600 px-4 py-1 rounded hover:bg-blue-50 flex items-center"
                >
                  Conectar <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              )}
            </div>
          </div>

          {/* Configurações de Sincronização */}
          {connected && showGoogleSettings && (
            <div className="mt-4 space-y-4">
              {/* Sincronização Bidirecional */}
              <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">Sincronização Bidirecional</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Mantenha seus agendamentos sincronizados entre o Merlin e o Google Calendar
                  </p>
                </div>
                <Switch
                  checked={settings.syncEnabled}
                  onCheckedChange={handleSyncToggle}
                  disabled={isLoading}
                />
              </div>

              {/* Status do Webhook */}
              {settings.syncEnabled && (
                <div className="p-4 bg-white border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Status do Webhook</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      {settings.webhookConfigured ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-600">Webhook configurado</span>
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-yellow-600">Webhook não configurado</span>
                        </>
                      )}
                    </div>
                    
                    {settings.webhookConfigured && settings.webhookExpiresAt && (
                      <div className="text-sm text-gray-600">
                        Expira em: {settings.webhookExpiresAt.toLocaleDateString('pt-BR')} às {settings.webhookExpiresAt.toLocaleTimeString('pt-BR')}
                        {isWebhookExpired && (
                          <span className="ml-2 text-red-600 font-medium">(Expirado)</span>
                        )}
                      </div>
                    )}
                    
                    {settings.webhookConfigured && (
                      <p className="text-xs text-gray-500">
                        O Google Calendar enviará notificações automáticas quando eventos forem modificados
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Sincronização Manual */}
              {settings.syncEnabled && (
                <div className="p-4 bg-white border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3">Sincronização Manual</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Sincronize manualmente eventos dos últimos 7 dias do Google Calendar
                  </p>
                  <Button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    variant="outline"
                    size="sm"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sincronizar Agora
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Informações */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Como funciona</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Agendamentos criados no Merlin são automaticamente criados no Google Calendar</li>
                  <li>• Eventos criados no Google Calendar são sincronizados para o Merlin</li>
                  <li>• Modificações em qualquer lado são refletidas automaticamente</li>
                  <li>• Apenas eventos com a marca "Desenvolvido por Merlindesk.com" são sincronizados</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Integration */}
      <Card className={`mb-6 ${!hasEnterprisePlan ? 'opacity-60' : ''}`}>
        <CardHeader>
          <CardTitle className="flex items-center">
            WhatsApp Business API
            {!hasEnterprisePlan && (
              <div className="ml-2 flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-1" />
                Plano Empresa
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between px-4 py-3 border rounded-lg shadow-sm bg-white">
          <div className="flex items-center space-x-4">
            <MessageCircle className="w-10 h-10 text-green-600" />
            <div>
              <p className="font-semibold text-gray-800">WhatsApp Notifications</p>
              {!hasEnterprisePlan ? (
                <p className="text-sm text-gray-500">
                  Disponível apenas no plano Empresa
                </p>
              ) : isWhatsAppConfigured ? (
                <p className="text-sm text-green-600 font-medium flex items-center">
                  Configurado <CheckCircle className="w-4 h-4 ml-1" />
                </p>
              ) : (
                <p className="text-sm text-gray-500">Não configurado</p>
              )}
              <p className="text-sm text-gray-400">
                Envio automático de notificações de agendamento
              </p>
            </div>
          </div>
          {hasEnterprisePlan ? (
            <Button
              onClick={() => setShowWhatsAppTest(true)}
              variant="outline"
              size="sm"
            >
              Testar
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              disabled
              className="cursor-not-allowed"
            >
              <Lock className="w-4 h-4 mr-1" />
              Bloqueado
            </Button>
          )}
        </CardContent>
      </Card>

      {/* WhatsApp Test Modal */}
      <WhatsAppTestModal
        open={showWhatsAppTest}
        onClose={() => setShowWhatsAppTest(false)}
      />
    </DashboardLayout>
  );
}
