import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Client } from '../types';

export const useClients = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        setClients([]);
        return;
      }

      // 1. Adicionar os campos faltantes na query
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, email, phone, created_at, calendar_id, owner_id')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // 2. Mapear corretamente todos os campos necessários
      const mappedData: Client[] = (data || []).map((client) => ({
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone || undefined,
        calendarId: client.calendar_id, 
        ownerId: client.owner_id,
        createdAt: new Date(client.created_at),
      }));

      setClients(mappedData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch clients');
      console.error('Client fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  return {
    clients,
    loading,
    error,
    refetch: fetchClients,
  };
};
