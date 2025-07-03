import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { GoogleIntegration } from '../types';

export const useGoogleIntegration = () => {
  const { user } = useAuth();
  const [integration, setIntegration] = useState<GoogleIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Buscar integração existente
  const fetchIntegration = useCallback(async () => {
    if (!user?.id) {
      setIntegration(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('user_integrations')
        .select('*')
        .eq('user_id', user.id)
        .eq('integration_type', 'google_calendar')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      setIntegration(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch Google integration');
      console.error('Google integration fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Iniciar processo de conexão com Google
  const connectGoogle = useCallback(async () => {
    if (!user?.id) {
      throw new Error('User not authenticated');
    }

    try {
      setIsConnecting(true);
      setError(null);

      // Usar a rota existente do servidor
      const authUrl = `${window.location.origin}/api/google/auth?user_id=${user.id}`;
      window.location.href = authUrl;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect Google';
      setError(message);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  }, [user?.id]);

  // Desconectar Google
  const disconnectGoogle = useCallback(async () => {
    if (!user?.id || !integration) {
      throw new Error('No integration to disconnect');
    }

    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .from('user_integrations')
        .delete()
        .eq('id', integration.id);

      if (error) throw error;

      setIntegration(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to disconnect Google';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, integration]);

  // Sincronizar calendário
  const syncCalendar = useCallback(async () => {
    if (!user?.id || !integration) {
      throw new Error('No Google integration found');
    }

    try {
      setLoading(true);
      setError(null);

      // Usar a rota existente do servidor para sincronização
      const response = await fetch('/api/google/calendar/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id,
          integration_id: integration.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync calendar');
      }

      const data = await response.json();

      // Atualizar última sincronização
      if (data.success) {
        setIntegration(prev => prev ? {
          ...prev,
          lastSyncAt: new Date()
        } : null);
      }

      return data;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sync calendar';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [user?.id, integration]);

  // Verificar se está conectado
  const isConnected = useCallback((): boolean => {
    return integration !== null && integration.status === 'active';
  }, [integration]);

  // Verificar se precisa renovar token
  const needsTokenRefresh = useCallback((): boolean => {
    if (!integration?.credentials?.expiry_date) return false;
    
    const expiryDate = new Date(integration.credentials.expiry_date);
    const now = new Date();
    const timeUntilExpiry = expiryDate.getTime() - now.getTime();
    
    // Renovar se expira em menos de 1 hora
    return timeUntilExpiry < 60 * 60 * 1000;
  }, [integration]);

  useEffect(() => {
    fetchIntegration();
  }, [fetchIntegration]);

  return {
    integration,
    loading,
    error,
    isConnecting,
    isConnected,
    needsTokenRefresh,
    connectGoogle,
    disconnectGoogle,
    syncCalendar,
    refetch: fetchIntegration,
  };
}; 