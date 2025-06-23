// Frontend email service - calls Supabase Edge Function
import { supabase } from './supabase';

export const sendAppointmentConfirmation = async (data: {
  clientEmail: string;
  clientName: string;
  professionalName: string;
  specialtyName: string;
  startTime: Date;
  duration: number;
  notes?: string;
  guests?: string[];
  videoConferenceLink?: string;
}) => {
  try {
    console.log('📧 Iniciando envio de email:', {
      clientEmail: data.clientEmail,
      clientName: data.clientName,
      professionalName: data.professionalName,
      specialtyName: data.specialtyName,
      startTime: data.startTime.toISOString(),
      duration: data.duration
    });

    const { data: result, error } = await supabase.functions.invoke('send-email-confirmation', {
      body: {
        clientEmail: data.clientEmail,
        clientName: data.clientName,
        professionalName: data.professionalName,
        specialtyName: data.specialtyName,
        startTime: data.startTime.toISOString(),
        duration: data.duration,
        notes: data.notes,
        guests: data.guests,
        videoConferenceLink: data.videoConferenceLink,
      },
    });

    if (error) {
      console.error('❌ Erro ao chamar função de e-mail:', error);
      return false;
    }

    console.log('📧 Resposta da edge function:', result);

    if (result?.success) {
      console.log('✅ E-mail de confirmação enviado com sucesso');
      return true;
    } else {
      console.error('❌ Erro ao enviar e-mail:', result?.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Erro ao enviar e-mail:', error);
    return false;
  }
}; 