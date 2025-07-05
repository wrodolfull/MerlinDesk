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
  last_message?: string;
  last_message_time?: string;
  unread_count?: number;
  is_pinned?: boolean;
  avatar_url?: string;
}

export interface Calendar {
  id: string;
  name: string;
  location_id?: string;
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
  google_event_id?: string;
  video_conference_link?: string;
  guests?: string[];
  sync_source?: 'merlin' | 'google' | 'manual';
  last_sync_at?: Date;
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

export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
  updatedAt: string;
}

// Tipos auxiliares para Task compatíveis com o banco (snake_case)
export type TaskDB = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: TaskStatus;
  priority: TaskPriority;
  created_at: string;
  updated_at: string;
};

export type CreateTaskDB = Omit<TaskDB, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UpdateTaskDB = Partial<Omit<TaskDB, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;

// Tipos auxiliares para operações específicas
export type CreateAppointment = Omit<Appointment, 'id' | 'createdAt' | 'client' | 'professional' | 'specialty'>;
export type UpdateAppointment = Partial<Omit<Appointment, 'id' | 'createdAt'>>;
