import React, { useState, useEffect } from 'react';
import { SpecialtySelection } from './SpecialtySelection';
import { ProfessionalSelection } from './ProfessionalSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { ClientInfoForm } from './ClientInfoForm';
import { BookingConfirmation } from './BookingConfirmation';
import { Client, Professional, Specialty } from '../../types';
import { supabase } from '../../lib/supabase';
import { Check } from 'lucide-react';

interface BookingStepsProps {
  calendarId: string;
  specialties?: Specialty[];
  professionals?: Professional[];
  onComplete?: (data: any) => void;
}

const BookingSteps = ({ calendarId, specialties = [], professionals = [], onComplete }: BookingStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
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
    if (!bookingData.professional?.id) return;

    const { data, error } = await supabase
      .from('working_hours')
      .select('day_of_week, is_working_day')
      .eq('professional_id', bookingData.professional.id)
      .eq('is_working_day', true);

    if (error) {
      console.error('❌ Erro ao buscar working_hours:', error);
      return;
    }

    console.log('🔍 Buscando working_hours para profissional:', bookingData.professional.id);

    console.log('🟡 Resultado Supabase:', data);

    const diasValidos = data.map((d) => d.day_of_week);
    console.log('📅 Dias trabalhados filtrados:', diasValidos);
    setWorkingDays(diasValidos);
    console.log('✅ workingDays state setado como:', diasValidos);
  };

  fetchWorkingDays();
}, [bookingData.professional]);


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

  const handleClientInfoSubmit = (client: Client) => {
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
        notes: ''
      };

    const { data: createdAppointment, error } = await supabase
      .from('appointments')
      .insert(appointmentData)
      .select()
      .single();

    if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`);

    console.log('📋 Agendamento criado com sucesso:', createdAppointment);

    if (onComplete) {
      onComplete(createdAppointment); // ✅ dado real salvo no Supabase
    }

      setTimeout(() => {
        window.open('https://merlindesk.com', '_blank');
      }, 5000);
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const availableProfessionals = bookingData.specialty
    ? professionals.filter((p) =>
        Array.isArray(p.specialties) &&
        p.specialties.some((s: any) => s?.id === bookingData.specialty?.id)
      )
    : [];

  const getTimeSlots = async (date: Date) => {
    if (!bookingData.professional || !bookingData.specialty) return [];

    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        input_professional_id: bookingData.professional.id,
        input_specialty_id: bookingData.specialty.id,
        input_date: date.toISOString().split('T')[0],
      });

      if (error) throw error;

      return Array.isArray(data)
        ? data.map((slot) => ({
            start: new Date(slot.start_time).toISOString(),
            end: new Date(slot.end_time).toISOString(),
          }))
        : [];
    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      return [];
    }
  };

  const steps = [1, 2, 3, 4, 5];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Etapas Visuais */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
          <div
            className="absolute top-4 left-0 h-0.5 bg-blue-600 z-10 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((step) => (
            <div key={step} className="flex flex-col items-center relative z-20">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  currentStep > step
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : currentStep === step
                    ? 'bg-white border-blue-600 text-blue-600 shadow-lg ring-4 ring-blue-100'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > step ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div
                    className={`w-2 h-2 rounded-full ${
                      currentStep === step ? 'bg-blue-600' : 'bg-gray-400'
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
