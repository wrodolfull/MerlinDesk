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
    console.log('Fetching appointments...');
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        console.log('No user ID found, skipping fetch');
        return;
      }

      // Buscar todos os calendários onde o usuário logado é o dono
      const { data: calendars, error: calendarError } = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);

      if (calendarError) throw calendarError;
      if (!calendars || calendars.length === 0) {
        console.log('No calendars found for user', user.id);
        setAppointments([]);
        return;
      }

      const calendarIds = calendars.map((c) => c.id);
      console.log('Found calendars:', calendarIds);

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
          google_event_id,
          video_conference_link,
          guests,
          client:clients(*),
          professional:professionals(*, specialty:specialties(*)),
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
        console.log('No appointments found');
        setAppointments([]);
        return;
      }

      console.log('Fetched appointments:', data.length);
      
      const formattedAppointments = data.map((apt) => {
        console.log('📋 useAppointments: Agendamento bruto:', apt);
        console.log('📧 useAppointments: Convidados do agendamento:', apt.guests);
        
        return {
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
          google_event_id: apt.google_event_id,
          video_conference_link: apt.video_conference_link,
          guests: Array.isArray(apt.guests) ? apt.guests : [],
          client: apt.client,
          professional: apt.professional,
          specialty: apt.specialty,
        };
      });
      
      console.log('Formatted appointments:', formattedAppointments.length);
      setAppointments(formattedAppointments);
    } catch (err: unknown) {
      console.error('Error fetching appointments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [
    user?.id, 
    options?.clientId,
    options?.professionalId,
    options?.calendarId,
    options?.startDate?.toISOString(),
    options?.endDate?.toISOString(),
    options?.status?.join(',')
  ]);

  // Efeito para buscar os dados inicialmente
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Efeito para configurar a subscription em tempo real
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('Setting up realtime subscription for appointments');
    
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'appointments' }, 
        (payload) => {
          console.log('New appointment inserted:', payload);
          fetchAppointments();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'appointments' }, 
        () => {
          console.log('Appointment updated');
          fetchAppointments();
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'appointments' }, 
        () => {
          console.log('Appointment deleted');
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      console.log('Unsubscribing from realtime');
      subscription.unsubscribe();
    };
  }, [user?.id, fetchAppointments]);

  // Polling como fallback
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('Polling for new appointments');
      fetchAppointments();
    }, 300000);
    
    return () => clearInterval(interval);
  }, [fetchAppointments]);

  return {
    appointments,
    loading,
    error,
    refetch: fetchAppointments,
  };
}
