import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Appointment, Client, Professional, Specialty } from '../types';

interface UseAppointmentsOptions {
  clientId?: string;
  professionalId?: string;
  calendarId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string[];
}

interface AppointmentJoin extends Appointment {
  client: Client;
  professional: Professional;
  specialty: Specialty;
}

export function useAppointments(options?: UseAppointmentsOptions) {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentJoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) return;

      // Buscar todos os calendários onde o usuário logado é o dono
      const { data: calendars, error: calendarError } = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);

      if (calendarError) throw calendarError;
      if (!calendars || calendars.length === 0) {
        setAppointments([]);
        return;
      }

      const calendarIds = calendars.map((c) => c.id);

      // Buscar os agendamentos vinculados a esses calendários
      let query = supabase
        .from('appointments')
        .select(`
          id,
          client_id,
          professional_id,
          specialty_id,
          calendar_id,
          start_time,
          end_time,
          status,
          notes,
          created_at,
          client:clients(*),
          professional:professionals(*),
          specialty:specialties(*)
        `)
        .in('calendar_id', calendarIds)
        .order('start_time', { ascending: true });

      // Aplicar filtros opcionais
      if (options?.clientId) query = query.eq('client_id', options.clientId);
      if (options?.professionalId) query = query.eq('professional_id', options.professionalId);
      if (options?.calendarId) query = query.eq('calendar_id', options.calendarId);
      if (options?.startDate) query = query.gte('start_time', options.startDate.toISOString());
      if (options?.endDate) query = query.lte('end_time', options.endDate.toISOString());
      if (options?.status?.length) query = query.in('status', options.status);

      const { data, error } = await query;

      if (error) throw error;
      if (!data) {
        setAppointments([]);
        return;
      }

      setAppointments(
        data.map((apt) => ({
          ...apt,
          clientId: apt.client_id,
          professionalId: apt.professional_id,
          specialtyId: apt.specialty_id,
          calendarId: apt.calendar_id,
          startTime: new Date(apt.start_time),
          endTime: new Date(apt.end_time),
          createdAt: new Date(apt.created_at),
          status: apt.status,
          notes: apt.notes,
          client: apt.client,
          professional: apt.professional,
          specialty: apt.specialty,
        }))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [user?.id, JSON.stringify(options)]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
}