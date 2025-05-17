import { supabase } from './supabase';
import type { Appointment, Calendar, Client, Professional, Specialty } from '../types';

// Calendars
export async function getCalendars() {
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getCalendarById(id: string) {
  const { data, error } = await supabase
    .from('calendars')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// Specialties
export async function getSpecialties(calendarId?: string) {
  let query = supabase.from('specialties').select('*');
  
  if (calendarId) {
    query = query.eq('calendar_id', calendarId);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data;
}

// Professionals
export async function getProfessionals(filters?: { calendarId?: string; specialtyId?: string }) {
  let query = supabase.from('professionals').select('*');
  
  if (filters?.calendarId) {
    query = query.eq('calendar_id', filters.calendarId);
  }
  
  if (filters?.specialtyId) {
    query = query.eq('specialty_id', filters.specialtyId);
  }
  
  const { data, error } = await query.order('name');
  
  if (error) throw error;
  return data;
}

// Appointments
export async function getAppointments(filters?: {
  clientId?: string;
  professionalId?: string;
  calendarId?: string;
  startDate?: Date;
  endDate?: Date;
  status?: string[];
}) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      client:clients(*),
      professional:professionals(*),
      specialty:specialties(*)
    `);
  
  if (filters?.clientId) {
    query = query.eq('client_id', filters.clientId);
  }
  
  if (filters?.professionalId) {
    query = query.eq('professional_id', filters.professionalId);
  }
  
  if (filters?.calendarId) {
    query = query.eq('calendar_id', filters.calendarId);
  }
  
  if (filters?.startDate) {
    query = query.gte('start_time', filters.startDate.toISOString());
  }
  
  if (filters?.endDate) {
    query = query.lte('end_time', filters.endDate.toISOString());
  }
  
  if (filters?.status && filters.status.length > 0) {
    query = query.in('status', filters.status);
  }
  
  const { data, error } = await query.order('start_time', { ascending: true });
  
  if (error) throw error;
  return data;
}

export async function createAppointment(appointment: Omit<Appointment, 'id' | 'createdAt'>) {
  const { data, error } = await supabase
    .from('appointments')
    .insert(appointment)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAppointment(id: string, updates: Partial<Appointment>) {
  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelAppointment(id: string) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status: 'canceled' })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Clients
export async function updateClientProfile(id: string, updates: Partial<Client>) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getClientProfile(id: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}