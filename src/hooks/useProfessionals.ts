import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  calendarId: string;
  specialties: {
    id: string;
    name: string;
  }[];
  userId: string;
}

export const useProfessionals = (calendarId?: string) => {
  const { user } = useAuth();
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        setProfessionals([]);
        return;
      }

      let query = supabase
        .from('professionals')
        .select(`
          id,
          name,
          email,
          phone,
          bio,
          calendar_id,
          user_id,
          professional_specialties:specialties(id, name)
        `)
        .eq('user_id', user.id);

      if (calendarId) {
        query = query.eq('calendar_id', calendarId);
      }

      const { data, error } = await query;
      if (error) throw error;

      console.log('🔍 useProfessionals: Dados brutos do Supabase:', data);

      const mappedData: Professional[] = (data || []).map((pro) => ({
        id: pro.id,
        name: pro.name,
        email: pro.email,
        phone: pro.phone || undefined,
        bio: pro.bio || undefined,
        calendarId: pro.calendar_id,
        specialties: pro.professional_specialties || [],
        userId: pro.user_id
      }));

      console.log('🔍 useProfessionals: Dados mapeados:', mappedData);
      setProfessionals(mappedData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch professionals');
      console.error('Professionals fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id, calendarId]);

  useEffect(() => {
    fetchProfessionals();
  }, [fetchProfessionals]);

  return {
    professionals,
    loading,
    error,
    refetch: fetchProfessionals
  };
};
