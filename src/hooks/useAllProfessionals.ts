import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Professional {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  calendarIds: string[];
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
        console.log('🔍 useAllProfessionals: Usuário não autenticado');
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
          user_id,
          calendar_id,
          professional_specialties(
            specialty_id,
            specialties(
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('🔍 useAllProfessionals: Erro na consulta:', error);
        throw error;
      }

      console.log('🔍 useAllProfessionals: Dados brutos do Supabase:', data);
      console.log('🔍 useAllProfessionals: Número de profissionais encontrados:', data?.length || 0);

      const mappedData: Professional[] = (data || []).map((pro: any) => {
        console.log('🔍 useAllProfessionals: Mapeando profissional:', pro);
        return {
          id: pro.id,
          name: pro.name,
          email: pro.email,
          phone: pro.phone || undefined,
          bio: pro.bio || undefined,
          calendarIds: pro.calendar_id ? [pro.calendar_id] : [],
          specialties: (pro.professional_specialties || []).map((ps: any) => ({
            id: ps.specialties.id,
            name: ps.specialties.name
          })),
          userId: pro.user_id
        };
      });

      console.log('🔍 useAllProfessionals: Dados mapeados:', mappedData);
      console.log('🔍 useAllProfessionals: Profissionais sem calendário:', mappedData.filter(p => p.calendarIds.length === 0));
      
      setProfessionals(mappedData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch professionals');
      console.error('Professionals fetch error:', err);
      setProfessionals([]);
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