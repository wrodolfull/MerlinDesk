import { Appointment, Calendar, Client, Professional, Specialty, User } from '../types';
import { addDays, addHours, format, setHours, setMinutes, subDays } from 'date-fns';

// Helper to generate dates
const today = new Date();
const formatDate = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm:ss");

// Calendars
export const calendars: Calendar[] = [
  {
    id: '1',
    name: 'Downtown Barbershop',
    locationId: 'loc1',
    createdAt: formatDate(subDays(today, 100)),
  },
  {
    id: '2',
    name: 'Jardim Clinic',
    locationId: 'loc2',
    createdAt: formatDate(subDays(today, 90)),
  },
];

// Specialties
export const specialties: Specialty[] = [
  {
    id: '1',
    name: "Men's Haircut",
    calendarId: '1',
    duration: 30,
    price: 25,
    description: 'Standard men\'s haircut with styling',
    createdAt: formatDate(subDays(today, 90)),
  },
  {
    id: '2',
    name: 'Beard Trim',
    calendarId: '1',
    duration: 15,
    price: 15,
    description: 'Beard shaping and trimming',
    createdAt: formatDate(subDays(today, 90)),
  },
  {
    id: '3',
    name: 'Skin Cleaning',
    calendarId: '2',
    duration: 60,
    price: 80,
    description: 'Deep facial cleansing treatment',
    createdAt: formatDate(subDays(today, 85)),
  },
  {
    id: '4',
    name: 'Teeth Whitening',
    calendarId: '2',
    duration: 45,
    price: 120,
    description: 'Professional teeth whitening procedure',
    createdAt: formatDate(subDays(today, 80)),
  },
];

// Professionals
export const professionals: Professional[] = [
  {
    id: '1',
    name: 'John Smith',
    specialtyId: '1',
    calendarId: '1',
    email: 'john@barbershop.com',
    phone: '555-123-4567',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: '10 years of experience in men\'s styling',
    createdAt: formatDate(subDays(today, 85)),
  },
  {
    id: '2',
    name: 'Mike Johnson',
    specialtyId: '2',
    calendarId: '1',
    email: 'mike@barbershop.com',
    phone: '555-987-6543',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Beard styling specialist',
    createdAt: formatDate(subDays(today, 80)),
  },
  {
    id: '3',
    name: 'Dr. Sarah Chen',
    specialtyId: '3',
    calendarId: '2',
    email: 'sarah@clinic.com',
    phone: '555-567-8901',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Certified dermatologist with focus on skin care',
    createdAt: formatDate(subDays(today, 75)),
  },
  {
    id: '4',
    name: 'Dr. Robert Williams',
    specialtyId: '4',
    calendarId: '2',
    email: 'robert@clinic.com',
    phone: '555-234-5678',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
    bio: 'Orthodontics specialist with 15 years experience',
    createdAt: formatDate(subDays(today, 70)),
  },
];

// Clients
export const clients: Client[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    phone: '555-111-2222',
    email: 'alex@example.com',
    createdAt: formatDate(subDays(today, 50)),
  },
  {
    id: '2',
    name: 'Maria Garcia',
    phone: '555-333-4444',
    email: 'maria@example.com',
    createdAt: formatDate(subDays(today, 45)),
  },
  {
    id: '3',
    name: 'David Lee',
    phone: '555-555-6666',
    email: 'david@example.com',
    createdAt: formatDate(subDays(today, 40)),
  },
];

// Mock appointments
const createAppointments = () => {
  const appointments: Appointment[] = [];
  const startDate = new Date();
  setHours(startDate, 9);
  setMinutes(startDate, 0);
  
  // Past appointments
  appointments.push(
    {
      id: '1',
      clientId: '1',
      professionalId: '1',
      specialtyId: '1',
      calendarId: '1',
      startTime: formatDate(subDays(startDate, 2)),
      endTime: formatDate(addHours(subDays(startDate, 2), 0.5)),
      status: 'completed',
      notes: 'Regular customer',
      createdAt: formatDate(subDays(today, 10)),
      client: clients.find(c => c.id === '1'),
      professional: professionals.find(p => p.id === '1'),
      specialty: specialties.find(s => s.id === '1'),
    },
    {
      id: '2',
      clientId: '2',
      professionalId: '3',
      specialtyId: '3',
      calendarId: '2',
      startTime: formatDate(subDays(startDate, 1)),
      endTime: formatDate(addHours(subDays(startDate, 1), 1)),
      status: 'completed',
      notes: 'First-time customer',
      createdAt: formatDate(subDays(today, 8)),
      client: clients.find(c => c.id === '2'),
      professional: professionals.find(p => p.id === '3'),
      specialty: specialties.find(s => s.id === '3'),
    }
  );
  
  // Today's appointments
  appointments.push(
    {
      id: '3',
      clientId: '3',
      professionalId: '2',
      specialtyId: '2',
      calendarId: '1',
      startTime: formatDate(setHours(today, 10)),
      endTime: formatDate(setHours(addMinutes(today, 15), 10)),
      status: 'confirmed',
      createdAt: formatDate(subDays(today, 2)),
      client: clients.find(c => c.id === '3'),
      professional: professionals.find(p => p.id === '2'),
      specialty: specialties.find(s => s.id === '2'),
    },
    {
      id: '4',
      clientId: '1',
      professionalId: '4',
      specialtyId: '4',
      calendarId: '2',
      startTime: formatDate(setHours(today, 14)),
      endTime: formatDate(setHours(addMinutes(today, 45), 14)),
      status: 'confirmed',
      notes: 'Follow-up appointment',
      createdAt: formatDate(subDays(today, 5)),
      client: clients.find(c => c.id === '1'),
      professional: professionals.find(p => p.id === '4'),
      specialty: specialties.find(s => s.id === '4'),
    }
  );
  
  // Future appointments
  appointments.push(
    {
      id: '5',
      clientId: '2',
      professionalId: '1',
      specialtyId: '1',
      calendarId: '1',
      startTime: formatDate(setHours(addDays(today, 1), 11)),
      endTime: formatDate(setHours(addMinutes(addDays(today, 1), 30), 11)),
      status: 'pending',
      createdAt: formatDate(subDays(today, 1)),
      client: clients.find(c => c.id === '2'),
      professional: professionals.find(p => p.id === '1'),
      specialty: specialties.find(s => s.id === '1'),
    },
    {
      id: '6',
      clientId: '3',
      professionalId: '3',
      specialtyId: '3',
      calendarId: '2',
      startTime: formatDate(setHours(addDays(today, 3), 15)),
      endTime: formatDate(setHours(addMinutes(addDays(today, 3), 60), 15)),
      status: 'pending',
      createdAt: formatDate(subDays(today, 2)),
      client: clients.find(c => c.id === '3'),
      professional: professionals.find(p => p.id === '3'),
      specialty: specialties.find(s => s.id === '3'),
    }
  );
  
  return appointments;
};

export const appointments = createAppointments();

// Users for authentication
export const users: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@appointease.com',
    role: 'admin',
  },
  {
    id: '2',
    name: 'John Smith',
    email: 'john@barbershop.com',
    role: 'professional',
  },
  {
    id: '3',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'client',
  },
];

// Helper function to get available time slots
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

export const getAvailableTimeSlots = (
  professionalId: string,
  date: Date,
  specialtyId: string
): { start: string; end: string }[] => {
  const specialty = specialties.find(s => s.id === specialtyId);
  if (!specialty) return [];
  
  const duration = specialty.duration;
  const slots = [];
  
  // Business hours: 9 AM to 5 PM
  const startHour = 9;
  const endHour = 17;
  
  // Find existing appointments for this professional on this date
  const existingAppointments = appointments.filter(apt => 
    apt.professionalId === professionalId && 
    new Date(apt.startTime).toDateString() === date.toDateString() &&
    apt.status !== 'canceled'
  );
  
  // Create time slots in 15-minute increments
  const day = new Date(date);
  day.setHours(startHour, 0, 0, 0);
  
  while (day.getHours() < endHour) {
    const slotStart = new Date(day);
    const slotEnd = addMinutes(slotStart, duration);
    
    // Check if slot overlaps with any existing appointment
    const isOverlapping = existingAppointments.some(apt => {
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      return (
        (slotStart >= aptStart && slotStart < aptEnd) ||
        (slotEnd > aptStart && slotEnd <= aptEnd) ||
        (slotStart <= aptStart && slotEnd >= aptEnd)
      );
    });
    
    if (!isOverlapping && slotEnd.getHours() <= endHour) {
      slots.push({
        start: formatDate(slotStart),
        end: formatDate(slotEnd),
      });
    }
    
    // Increment by 15 minutes
    day.setMinutes(day.getMinutes() + 15);
  }
  
  return slots;
};