import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useProfessionals = (calendarId?: string) => {
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);

      let query = supabase.from('professionals').select(`
        *,
        specialty:specialties(id, name)
      `);

      // Só filtra por calendar_id se foi informado
      if (calendarId) {
        query = query.eq('calendar_id', calendarId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setProfessionals(data || []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [calendarId]);

  return { professionals, loading, error, refetch: fetchProfessionals };
};
