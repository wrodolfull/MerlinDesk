import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Specialty } from '../types';

export function useAllSpecialties() {
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecialties = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        setSpecialties([]);
        return;
      }

      console.log('🔍 useAllSpecialties: Buscando especialidades para usuário:', user.id);

      // Buscar todas as especialidades do usuário
      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('🔍 useAllSpecialties: Dados brutos do Supabase:', data);

      const mappedData: Specialty[] = (data || []).map(spec => ({
        id: spec.id,
        name: spec.name,
        duration: spec.duration,
        price: spec.price || undefined,
        description: spec.description || undefined,
        calendarId: spec.calendar_id,
        userId: spec.user_id || user.id,
        createdAt: new Date(spec.created_at),
      }));

      console.log('🔍 useAllSpecialties: Dados mapeados:', mappedData);
      console.log('🔍 useAllSpecialties: Especialidades sem calendário:', mappedData.filter(s => !s.calendarId));

      setSpecialties(mappedData);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch specialties');
      console.error('Specialties fetch error:', err);
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