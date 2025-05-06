import { useEffect, useState } from 'react';
import { Calendar } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useCalendars() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  async function fetchCalendars() {
    try {
      if (!user) {
        setCalendars([]);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('calendars')
        .select('*')
        .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setCalendars(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch calendars'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCalendars();
  }, [user]);

  const refetch = async () => {
    setLoading(true);
    await fetchCalendars();
  };

  return { calendars, loading, error, refetch };
}
