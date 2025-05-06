export type AppointmentStatus = 'confirmed' | 'pending' | 'completed' | 'canceled';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email: string;
  calendarId: string;
  createdAt: string;
}

export interface Calendar {
  id: string;
  name: string;
  locationId: string;
  createdAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  calendarId: string;
  duration: number; // in minutes
  price?: number;
  description?: string;
  createdAt: string;
}

export interface Professional {
  id: string;
  name: string;
  specialtyId: string;
  calendarId: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  clientId: string;
  professionalId: string;
  specialtyId: string;
  calendarId: string;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  client?: Client;
  professional?: Professional;
  specialty?: Specialty;
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  available: boolean;
  professionalId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'professional' | 'client';
}