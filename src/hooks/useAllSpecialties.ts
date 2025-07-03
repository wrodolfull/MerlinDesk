import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Specialty } from '../types';

export function useAllSpecialties() {
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState<(Specialty & { calendarIds: string[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        console.log('🔍 useAllSpecialties: Usuário não autenticado');
        setSpecialties([]);
        return;
      }

      console.log('🔍 useAllSpecialties: Buscando especialidades para usuário:', user.id);

      // Buscar especialidades com calendar_id direto
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('🔍 useAllSpecialties: Erro na consulta:', error);
        throw error;
      }

      console.log('🔍 useAllSpecialties: Dados brutos do Supabase:', data);
      console.log('🔍 useAllSpecialties: Número de especialidades encontradas:', data?.length || 0);

      const mappedData = (data || []).map((spec: any) => ({
        ...spec,
        calendarIds: spec.calendar_id ? [spec.calendar_id] : [],
        createdAt: new Date(spec.created_at),
      }));

      console.log('🔍 useAllSpecialties: Dados mapeados:', mappedData);
      console.log('🔍 useAllSpecialties: Especialidades sem calendário:', mappedData.filter(s => !s.calendarIds.length));

      setSpecialties(mappedData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch specialties');
      console.error('Specialties fetch error:', err);
      setSpecialties([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSpecialties();
  }, [fetchSpecialties]);

  return {
    specialties,
    loading,
    error,
    refetch: fetchSpecialties,
  };
} 