import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  calendarId: string | null;
  specialties: {
    id: string;
    name: string;
  }[];
  userId: string;
}

export const useAllProfessionals = () => {
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

      console.log('🔍 useAllProfessionals: Buscando profissionais para usuário:', user.id);

      const { data, error } = await supabase
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

      if (error) throw error;

      console.log('🔍 useAllProfessionals: Dados brutos do Supabase:', data);

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

      console.log('🔍 useAllProfessionals: Dados mapeados:', mappedData);
      console.log('🔍 useAllProfessionals: Profissionais sem calendário:', mappedData.filter(p => !p.calendarId));
      
      setProfessionals(mappedData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch professionals');
      console.error('Professionals fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

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