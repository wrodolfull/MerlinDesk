import { useEffect, useState } from 'react';
import { Appointment } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UseAppointmentsOptions {
  clientId?: string;
  professionalId?: string;
  calendarId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string[];
}

export function useAppointments(options?: UseAppointmentsOptions) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);

        let query = supabase
          .from('appointments')
          .select(`
            *,
            client:clients(*),
            professional:professionals(*),
            specialty:specialties(*)
          `);

        if (user?.id) {
          query = query.eq('user_id', user.id);
        }

        if (options?.professionalId) {
          query = query.eq('professional_id', options.professionalId);
        }

        if (options?.calendarId) {
          query = query.eq('calendar_id', options.calendarId);
        }

        if (options?.startDate) {
          query = query.gte('start_time', options.startDate.toISOString());
        }

        if (options?.endDate) {
          query = query.lte('end_time', options.endDate.toISOString());
        }

        if (options?.status && options.status.length > 0) {
          query = query.in('status', options.status);
        }

        query = query.order('start_time', { ascending: true });

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Map snake_case → camelCase
        const mappedData = (data || []).map((apt) => ({
          ...apt,
          startTime: apt.start_time,
          endTime: apt.end_time,
        }));

        setAppointments(mappedData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch appointments'));
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [user?.id, options]);

  const refetch = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          specialty:specialties(*)
        `)
        .eq('user_id', user?.id)
        .order('start_time', { ascending: true });

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      // Map snake_case → camelCase
      const mappedData = (data || []).map((apt) => ({
        id: apt.id,
        clientId: apt.client_id,
        professionalId: apt.professional_id,
        specialtyId: apt.specialty_id,
        calendarId: apt.calendar_id,
        start_time: apt.start_time,
        end_time: apt.end_time,
        status: apt.status,
        notes: apt.notes,
        client: apt.client,
        professional: apt.professional,
        specialty: apt.specialty,
        createdAt: apt.created_at || '',
      }));

      setAppointments(mappedData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch appointments'));
    } finally {
      setLoading(false);
    }
  };

  return { appointments, loading, error, refetch };
}
