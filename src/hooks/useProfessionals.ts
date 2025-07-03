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
          user_id
        `)
        .eq('user_id', user.id);

      if (calendarId) {
        query = query.eq('calendar_id', calendarId);
      }

      const { data, error } = await query;
      if (error) throw error;

      console.log('🔍 useProfessionals: Dados brutos do Supabase:', data);

      // Buscar especialidades separadamente para cada profissional
      const mappedData: Professional[] = await Promise.all((data || []).map(async (pro: any) => {
        const { data: specialtiesData, error: specError } = await supabase
          .from('professional_specialties')
          .select(`
            specialty_id,
            specialties(
              id,
              name
            )
          `)
          .eq('professional_id', pro.id);

        if (specError) {
          console.error('Erro ao buscar especialidades para profissional:', pro.id, specError);
        }

        const specialties = (specialtiesData || []).map((ps: any) => ({
          id: ps.specialties.id,
          name: ps.specialties.name
        }));

        return {
          id: pro.id,
          name: pro.name,
          email: pro.email,
          phone: pro.phone || undefined,
          bio: pro.bio || undefined,
          calendarId: pro.calendar_id,
          specialties: specialties,
          userId: pro.user_id
        };
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
