// types.ts

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'canceled';
export type UserRole = 'admin' | 'professional' | 'client';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  calendarId: string;
  createdAt: Date;
  ownerId: string;
}

export interface Calendar {
  id: string;
  name: string;
  locationId?: string;
  ownerId: string;
  createdAt: Date;
}

export interface Specialty {
  id: string;
  name: string;
  duration: number; // em minutos
  price?: number;
  description?: string;
  calendarId: string;
  userId: string;
  createdAt: Date;
}

export interface Professional {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  calendarId: string;
  specialties?: Specialty[];
}

export interface Appointment {
  id: string;
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  clientId: string;
  professionalId: string;
  specialtyId: string;
  calendarId: string;
  createdAt: Date;
  client?: Pick<Client, 'id' | 'name' | 'email' | 'phone'>;
  professional?: Pick<Professional, 'id' | 'name' | 'avatar'>;
  specialty?: Pick<Specialty, 'id' | 'name' | 'duration'>;
}

export interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  available: boolean;
  professionalId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

// Tipos auxiliares para operações específicas
export type CreateAppointment = Omit<Appointment, 'id' | 'createdAt' | 'client' | 'professional' | 'specialty'>;
export type UpdateAppointment = Partial<Omit<Appointment, 'id' | 'createdAt'>>;
