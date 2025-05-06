import { useEffect, useState } from 'react';
import { Specialty } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useSpecialties(calendarId?: string) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // ✅ hook SEMPRE chamado no topo (sem condicional)
  const { user } = useAuth();

  const fetchSpecialties = async () => {
    setLoading(true);
    try {
      if (!user) {
        setSpecialties([]);
        return;
      }

      let query = supabase
        .from('specialties')
        .select('*')
        .eq('user_id', user.id) // ✅ filtra por usuário logado
        .order('name');

      if (calendarId) {
        query = query.eq('calendar_id', calendarId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setSpecialties(data || []);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch specialties'));
    } finally {
      setLoading(false);
    }
  };

  // ✅ sempre chama o efeito, mas o efeito decide o que fazer
  useEffect(() => {
    fetchSpecialties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarId, user?.id]); // depende só de user.id, não do objeto inteiro

  const refetch = async () => {
    await fetchSpecialties();
  };

  return { specialties, loading, error, refetch };
}
