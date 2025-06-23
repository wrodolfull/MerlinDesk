import React, { useState, useEffect } from 'react';
import { SpecialtySelection } from './SpecialtySelection';
import { ProfessionalSelection } from './ProfessionalSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { ClientInfoForm } from './ClientInfoForm';
import { BookingConfirmation } from './BookingConfirmation';
import { Client, Professional, Specialty } from '../../types';
import { supabase } from '../../lib/supabase';
import { Check } from 'lucide-react';
import { sendAppointmentConfirmation } from '../../lib/whatsapp';
import { sendAppointmentConfirmation as sendEmailConfirmation } from '../../lib/emailService';
import { getApiBaseUrl } from '../../lib/utils';
import { checkTimeConflict, formatConflictDetails } from '../../lib/appointmentValidation';
import { toast, Toaster } from 'react-hot-toast';

interface BookingStepsProps {
  calendarId: string;
  specialties?: Specialty[];
  professionals?: Professional[];
  onComplete?: (data: any) => void;
}

const BookingSteps = ({ calendarId, specialties = [], professionals = [], onComplete }: BookingStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [refreshWorkingDays, setRefreshWorkingDays] = useState(0);
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  const [bookingData, setBookingData] = useState<{
    specialty?: Specialty;
    professional?: Professional;
    date?: Date;
    timeSlot?: { start: string; end: string };
    client?: Client;
  }>({});

useEffect(() => {
  const fetchWorkingDays = async () => {
    if (!bookingData.professional?.id) {
      setWorkingDays([]);
      return;
    }

    console.log('🔍 Carregando working_hours para:', bookingData.professional.id);

    const { data, error } = await supabase
      .from('working_hours')
      .select('day_of_week, is_working_day')
      .eq('professional_id', bookingData.professional.id)
      .eq('is_working_day', true); // ⚠️ APENAS dias true

    if (error) {
      console.error('❌ Erro ao buscar working_hours:', error);
      setWorkingDays([]);
      return;
    }

    console.log('🟡 Resultado Supabase:', data);

    const diasValidos = data.map((d) => d.day_of_week);
    console.log('📅 Dias trabalhados filtrados:', diasValidos);
    setWorkingDays(diasValidos);
    console.log('✅ workingDays state setado como:', diasValidos);
  };

  fetchWorkingDays();
}, [bookingData.professional?.id]); // ⚠️ CORRIGIDO: usar .id em vez do objeto completo

  const handleWorkingHoursChange = () => {
    console.log('🔄 Forçando refresh dos workingDays');
    setRefreshWorkingDays(prev => prev + 1);
  };

  useEffect(() => {
  const handleWorkingHoursChanged = (event: any) => {
    if (event.detail.professionalId === bookingData.professional?.id) {
      console.log('🔄 Horários alterados, forçando refresh');
      handleWorkingHoursChange();
    }
  };

  window.addEventListener('workingHoursChanged', handleWorkingHoursChanged);
  
  return () => {
    window.removeEventListener('workingHoursChanged', handleWorkingHoursChanged);
  };
}, [bookingData.professional?.id]);

  const handleSpecialtySelect = (specialty: Specialty) => {
    setBookingData(prev => ({ ...prev, specialty, professional: undefined }));
    setCurrentStep(2);
  };

  const handleProfessionalSelect = (professional: Professional) => {
    setBookingData(prev => ({ ...prev, professional }));
    setCurrentStep(3);
  };

  const handleDateTimeSelect = (date: Date, timeSlot: { start: string; end: string }) => {
    setBookingData(prev => ({ ...prev, date, timeSlot }));
    setCurrentStep(4);
  };

  const handleClientInfoSubmit = (client: Client & { guests?: string[] }) => {
    setBookingData(prev => ({ ...prev, client }));
    setCurrentStep(5);
  };

  const handleConfirmBooking = async () => {
    try {
      if (!bookingData.client || !bookingData.professional || !bookingData.specialty || !bookingData.timeSlot || !bookingData.date) {
        console.error('Dados de agendamento incompletos');
        return;
      }

      const { data: calendarData, error: calendarError } = await supabase
        .from('calendars')
        .select('owner_id')
        .eq('id', calendarId)
        .single();

      if (calendarError) throw calendarError;

      const owner_id = calendarData.owner_id;
      if (!owner_id) throw new Error('Não foi possível determinar o proprietário do calendário');

      let clientId;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', bookingData.client.email)
        .eq('owner_id', owner_id)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient, error: createClientError } = await supabase
          .from('clients')
          .insert({
            name: bookingData.client.name,
            email: bookingData.client.email,
            phone: bookingData.client.phone,
            owner_id
          })
          .select('id')
          .single();

        if (createClientError) throw new Error(`Erro ao criar cliente: ${createClientError.message}`);
        clientId = newClient.id;
      }

      const appointmentData = {
        client_id: clientId,
        professional_id: bookingData.professional.id,
        specialty_id: bookingData.specialty.id,
        calendar_id: calendarId,
        start_time: new Date(bookingData.timeSlot.start).toISOString(),
        end_time: new Date(bookingData.timeSlot.end).toISOString(),
        status: 'pending',
        notes: '',
        user_id: owner_id,
        guests: Array.isArray((bookingData.client as any).guests) ? (bookingData.client as any).guests : []
      };

      // Verificar conflitos de horário
      const startTime = new Date(bookingData.timeSlot.start);
      const endTime = new Date(bookingData.timeSlot.end);
      
      const conflictCheck = await checkTimeConflict(bookingData.professional.id, startTime, endTime);
      
      if (conflictCheck.hasConflict) {
        const conflictingAppointments = conflictCheck.conflictingAppointments || [];
        const conflictDetails = formatConflictDetails(conflictingAppointments);
        
        console.error('❌ Conflito de horário detectado:', conflictDetails);
        throw new Error(`Horário indisponível! O profissional já possui agendamentos neste horário:\n${conflictDetails}`);
      }

    const { data: createdAppointment, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`);

    console.log('📋 Agendamento criado com sucesso:', createdAppointment);

    let videoConferenceLink: string | undefined;

    try {
  const { data: integration } = await supabase
    .from('user_integrations')
    .select('status')
    .eq('user_id', owner_id)
    .eq('integration_type', 'google_calendar')
    .eq('status', 'active')
    .single();

    if (integration) {
      const response = await fetch(`${getApiBaseUrl()}/google/calendar/create-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: createdAppointment.id,
          userId: owner_id
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Evento criado no Google Calendar:', result.eventId);
        if (result.videoConferenceLink) {
          console.log('🔗 Link da videoconferência:', result.videoConferenceLink);
          videoConferenceLink = result.videoConferenceLink;
        }
      }
    }
  } catch (googleError) {
    console.error('⚠️ Erro ao criar evento no Google Calendar:', googleError);
    // Não falha o agendamento se o Google Calendar falhar
  }

    // Enviar email de confirmação
    try {
      const emailResult = await sendEmailConfirmation({
        clientEmail: bookingData.client.email,
        clientName: bookingData.client.name,
        professionalName: bookingData.professional.name,
        specialtyName: bookingData.specialty.name,
        startTime: new Date(bookingData.timeSlot.start),
        duration: bookingData.specialty.duration,
        notes: '',
        guests: Array.isArray((bookingData.client as any).guests) ? (bookingData.client as any).guests : [],
        videoConferenceLink,
      });

      if (emailResult) {
        console.log('✅ E-mail de confirmação enviado com sucesso');
      } else {
        console.warn('⚠️ Erro ao enviar e-mail de confirmação');
      }
    } catch (emailError) {
      console.warn('⚠️ Erro ao enviar e-mail de confirmação:', emailError);
    }

    if (onComplete) {
      onComplete(createdAppointment); // ✅ dado real salvo no Supabase
    }

      setTimeout(() => {
        window.open('https://merlindesk.com', '_blank');
      }, 5000);
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      
      // Exibir mensagem de erro amigável
      if (error instanceof Error) {
        if (error.message.includes('Horário indisponível')) {
          toast.error(error.message, { duration: 8000 });
        } else {
          toast.error('Erro ao criar agendamento. Tente novamente.');
        }
      } else {
        toast.error('Erro ao criar agendamento. Tente novamente.');
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const availableProfessionals = bookingData.specialty
    ? (Array.isArray(professionals) ? professionals : []).filter((p) =>
        Array.isArray(p.specialties) &&
        p.specialties.some((s: any) => s?.id === bookingData.specialty?.id)
      )
    : [];

const getTimeSlots = async (date: Date) => {
  if (!bookingData.professional || !bookingData.specialty) {
    console.log('⚠️ getTimeSlots: Profissional ou especialidade não selecionados');
    return [];
  }

  const dateString = date.toISOString().split('T')[0];
  console.log('🔍 getTimeSlots: Buscando slots para:', dateString);

  try {
    const { data, error } = await supabase.rpc('get_available_slots', {
      input_professional_id: bookingData.professional.id,
      input_specialty_id: bookingData.specialty.id,
      input_date: dateString,
    });

    if (error) {
      console.error('❌ getTimeSlots: Erro na função RPC:', error);
      return [];
    }

    console.log('🟡 getTimeSlots: Resultado RPC para', dateString, ':', data);

    if (!Array.isArray(data)) {
      console.log('⚠️ getTimeSlots: Resultado não é array');
      return [];
    }

    const slots = data.map((slot) => ({
      start: new Date(slot.start_time).toISOString(),
      end: new Date(slot.end_time).toISOString(),
    }));

    console.log(`✅ getTimeSlots: ${slots.length} slots encontrados para ${dateString}`);
    return slots;
  } catch (error) {
    console.error('❌ getTimeSlots: Erro geral:', error);
    return [];
  }
};

const steps = [1, 2, 3, 4, 5];

// Garantir que steps seja sempre um array
const safeSteps = Array.isArray(steps) ? steps : [];

return (
  <div className="w-full min-h-screen overflow-x-hidden bg-white text-gray-900">
    <Toaster />
    {/* Etapas Visuais */}
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#7C45D0] z-10 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (safeSteps.length - 1)) * 100}%` }}
        ></div>
        {safeSteps.map((step) => (
          <div key={step} className="flex flex-col items-center relative z-20">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                currentStep > step
                  ? 'bg-[#7C45D0] border-[#7C45D0] text-white'
                  : currentStep === step
                  ? 'bg-white border-[#7C45D0] text-[#7C45D0] shadow-lg ring-4 ring-[#7C45D0]/20'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {currentStep > step ? (
                <Check className="w-4 h-4" />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentStep === step ? 'bg-[#7C45D0]' : 'bg-gray-400'
                  }`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Conteúdo de cada etapa */}
    <div className="animate-fade-in">
      {currentStep === 1 && (
        <SpecialtySelection specialties={specialties} onSelect={handleSpecialtySelect} />
      )}
      {currentStep === 2 && (
        <ProfessionalSelection
          professionals={availableProfessionals}
          specialty={bookingData.specialty}
          onSelect={handleProfessionalSelect}
          onBack={handleBack}
        />
      )}
      {currentStep === 3 && (
        <DateTimeSelection
          professional={bookingData.professional}
          specialty={bookingData.specialty}
          onSelect={handleDateTimeSelect}
          onBack={handleBack}
          getTimeSlots={getTimeSlots}
          workingDays={workingDays}
        />
      )}
      {currentStep === 4 && (
        <ClientInfoForm onSubmit={handleClientInfoSubmit} onBack={handleBack} />
      )}
      {currentStep === 5 && (
        <BookingConfirmation
          bookingData={bookingData}
          onConfirm={handleConfirmBooking}
          onBack={handleBack}
        />
      )}
    </div>
  </div>
);
};

export default BookingSteps;