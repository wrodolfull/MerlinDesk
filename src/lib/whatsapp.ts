import { supabase } from './supabase';

// Interface para notificação de agendamento
export interface AppointmentNotification {
  clientName: string;
  clientPhone: string;
  professionalName: string;
  specialtyName: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  notes?: string;
}

// Função para enviar confirmação de agendamento
export const sendAppointmentConfirmation = async (notification: AppointmentNotification) => {
  try {
    const response = await fetch('https://merlindesk.com/whatsapp/send-appointment-confirmation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Confirmação de agendamento enviada com sucesso');
      return { success: true, data: result.data };
    } else {
      console.error('❌ Erro ao enviar confirmação:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('❌ Erro na requisição de confirmação:', error);
    return { success: false, error: error.message };
  }
};

// Função para enviar lembrete de agendamento
export const sendAppointmentReminder = async (notification: AppointmentNotification) => {
  try {
    const response = await fetch('https://merlindesk.com/whatsapp/send-appointment-reminder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Lembrete de agendamento enviado com sucesso');
      return { success: true, data: result.data };
    } else {
      console.error('❌ Erro ao enviar lembrete:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('❌ Erro na requisição de lembrete:', error);
    return { success: false, error: error.message };
  }
};

// Função para enviar cancelamento de agendamento
export const sendAppointmentCancellation = async (notification: AppointmentNotification) => {
  try {
    const response = await fetch('https://merlindesk.com/whatsapp/send-appointment-cancellation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Cancelamento de agendamento enviado com sucesso');
      return { success: true, data: result.data };
    } else {
      console.error('❌ Erro ao enviar cancelamento:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('❌ Erro na requisição de cancelamento:', error);
    return { success: false, error: error.message };
  }
};

// Função para enviar mensagem personalizada
export const sendCustomMessage = async (phoneNumber: string, message: string) => {
  try {
    const response = await fetch('https://merlindesk.com/whatsapp/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phoneNumber, message }),
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Mensagem personalizada enviada com sucesso');
      return { success: true, data: result.data };
    } else {
      console.error('❌ Erro ao enviar mensagem personalizada:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('❌ Erro na requisição de mensagem personalizada:', error);
    return { success: false, error: error.message };
  }
};

// Função para verificar status da integração
export const checkWhatsAppStatus = async () => {
  try {
    const response = await fetch('https://merlindesk.com/whatsapp/status');
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Status do WhatsApp:', result.status);
      return { success: true, status: result.status };
    } else {
      console.error('❌ Erro ao verificar status:', result.error);
      return { success: false, error: result.error };
    }
  } catch (error: any) {
    console.error('❌ Erro na verificação de status:', error);
    return { success: false, error: error.message };
  }
};

// Função para formatar número de telefone para WhatsApp
export const formatPhoneForWhatsApp = (phone: string): string => {
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Se não tem código do país, adiciona +55 (Brasil)
  if (cleanPhone.length === 11) {
    return `55${cleanPhone}`;
  }
  
  // Se já tem código do país
  if (cleanPhone.length === 13 && cleanPhone.startsWith('55')) {
    return cleanPhone;
  }
  
  // Se tem +55 no início, remove o +
  if (phone.startsWith('+55')) {
    return phone.substring(1);
  }
  
  return cleanPhone;
};

// Função para criar notificação a partir de dados do agendamento
export const createAppointmentNotification = async (appointmentId: string): Promise<AppointmentNotification | null> => {
  try {
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        notes,
        clients (
          name,
          phone
        ),
        professionals (
          name
        ),
        specialties (
          name,
          duration
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error || !appointment) {
      console.error('❌ Erro ao buscar agendamento:', error);
      return null;
    }

    const startTime = new Date(appointment.start_time);
    const endTime = new Date(appointment.end_time);
    
    return {
      clientName: appointment.clients.name,
      clientPhone: formatPhoneForWhatsApp(appointment.clients.phone || ''),
      professionalName: appointment.professionals.name,
      specialtyName: appointment.specialties.name,
      appointmentDate: startTime.toISOString().split('T')[0],
      appointmentTime: startTime.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      duration: appointment.specialties.duration,
      notes: appointment.notes || undefined
    };
  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    return null;
  }
}; 