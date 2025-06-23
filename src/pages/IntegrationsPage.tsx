import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader2, CalendarX2, ArrowRight, MessageCircle, Settings, Lock } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import WhatsAppTestModal from '../components/modals/WhatsAppTestModal';
import { checkWhatsAppStatus } from '/root/MerlinDesk/src/lib/whatsapp.ts';
import { useAuth } from '../contexts/AuthContext';
import { usePlanLimits } from '../hooks/usePlanLimits';
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

  const isWhatsAppConfigured = whatsappStatus?.success && 
    whatsappStatus?.status?.whatsapp_token && 
    whatsappStatus?.status?.whatsapp_phone_number_id;

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-gray-600">Conecte seus calendários e serviços ao MerlinDesk para sincronização automática.</p>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Google Calendar Integration */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Google Calendar</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between px-4 py-3 border rounded-lg shadow-sm bg-white">
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
