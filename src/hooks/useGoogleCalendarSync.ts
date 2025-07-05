import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getApiBaseUrl } from '../lib/utils';

interface SyncSettings {
  syncEnabled: boolean;
  webhookConfigured: boolean;
  webhookExpiresAt?: Date;
}

export function useGoogleCalendarSync(userId: string) {
  const [settings, setSettings] = useState<SyncSettings>({
    syncEnabled: false,
    webhookConfigured: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      loadSyncSettings();
    }
  }, [userId]);

  const loadSyncSettings = async () => {
    try {
      console.log('🔍 Carregando configurações de sincronização para usuário:', userId);
      
      const { data: integration, error } = await supabase
        .from('user_integrations')
        .select('google_sync_enabled, google_webhook_url, google_webhook_expires_at')
        .eq('user_id', userId)
        .eq('integration_type', 'google_calendar')
        .eq('status', 'active')
        .single();

      console.log('📋 Dados da integração:', integration);
      console.log('❌ Erro da integração:', error);

      if (error) throw error;

      setSettings({
        syncEnabled: integration?.google_sync_enabled || false,
        webhookConfigured: !!integration?.google_webhook_url,
        webhookExpiresAt: integration?.google_webhook_expires_at ? new Date(integration.google_webhook_expires_at) : undefined
      });

      console.log('✅ Configurações carregadas:', {
        syncEnabled: integration?.google_sync_enabled || false,
        webhookConfigured: !!integration?.google_webhook_url,
        webhookUrl: integration?.google_webhook_url
      });
    } catch (err) {
      console.error('❌ Erro ao carregar configurações de sincronização:', err);
      setError('Erro ao carregar configurações');
    }
  };

  const toggleSync = async (enabled: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Alterando sincronização para:', enabled);
      
      if (enabled && !settings.webhookConfigured) {
        console.log('🔧 Configurando webhook...');
        await setupWebhook();
      }

      const { error } = await supabase
        .from('user_integrations')
        .update({ google_sync_enabled: enabled })
        .eq('user_id', userId)
        .eq('integration_type', 'google_calendar');

      if (error) throw error;

      setSettings(prev => ({ ...prev, syncEnabled: enabled }));
      console.log('✅ Sincronização alterada com sucesso');
    } catch (err: any) {
      console.error('❌ Erro ao alterar sincronização:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const setupWebhook = async () => {
    try {
      console.log('🔧 Iniciando configuração do webhook...');
      console.log('🌐 URL da API:', getApiBaseUrl());
      
      const response = await fetch(`${getApiBaseUrl()}/google/calendar/setup-webhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      console.log('📡 Resposta do servidor:', response.status, response.statusText);

      const result = await response.json();
      console.log('📋 Resultado da configuração:', result);

      if (!result.success) {
        throw new Error(result.error || 'Erro desconhecido na configuração do webhook');
      }

      setSettings(prev => ({ 
        ...prev, 
        webhookConfigured: true,
        webhookExpiresAt: new Date(result.expiration)
      }));

      console.log('✅ Webhook configurado com sucesso');
    } catch (err: any) {
      console.error('❌ Erro ao configurar webhook:', err);
      throw err;
    }
  };

  const manualSync = async (days: number = 7) => {
    setIsSyncing(true);
    setError(null);

    try {
      console.log('🔄 Iniciando sincronização manual...');
      
      const response = await fetch(`${getApiBaseUrl()}/google/calendar/sync-from-google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, days })
      });

      const result = await response.json();
      console.log('📋 Resultado da sincronização:', result);

      if (!result.success) {
        throw new Error(result.error);
      }

      return result;
    } catch (err: any) {
      console.error('❌ Erro na sincronização manual:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    settings,
    isLoading,
    isSyncing,
    error,
    toggleSync,
    manualSync,
    refreshSettings: loadSyncSettings
  };
} 