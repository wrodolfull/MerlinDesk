import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  user_id: string; // adicione isso no tipo se ainda não estiver
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchClients = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.id)  // ✅ filtrar pelo usuário logado
          .order('name');

        if (error) throw error;
        setClients(data || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  return { clients, loading, error };
};
