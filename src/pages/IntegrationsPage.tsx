import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Loader2, CalendarX2, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import googleIcon from '../../assets/google-icon.png';

export default function Integracoes() {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.id) {
        setUserId(data.user.id);
        checkIntegrationStatus(data.user.id);
      }
    };
    getUser();
  }, []);

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

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Integrações</h1>
        <p className="text-gray-600">Conecte seus calendários ao MerlinDesk para sincronização automática de agendamentos.</p>
      </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

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
    </DashboardLayout>
  );
}
