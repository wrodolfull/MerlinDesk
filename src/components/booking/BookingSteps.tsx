import React, { useState } from 'react';
import { SpecialtySelection } from './SpecialtySelection';
import { ProfessionalSelection } from './ProfessionalSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { ClientInfoForm } from './ClientInfoForm';
import { BookingConfirmation } from './BookingConfirmation';
import { Client, Professional, Specialty } from '../../types';
import { supabase } from '../../lib/supabase';

interface BookingStepsProps {
  calendarId: string;
  specialties?: Specialty[];
  professionals?: Professional[];
  onComplete?: (data: any) => void;
}

const BookingSteps = ({ calendarId, specialties = [], professionals = [], onComplete }: BookingStepsProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<{
    specialty?: Specialty;
    professional?: Professional;
    date?: Date;
    timeSlot?: { start: string; end: string };
    client?: Client;
  }>({});
  
  const handleSpecialtySelect = (specialty: Specialty) => {
    console.log('Selected specialty:', specialty);
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
      console.log('📋 bookingData recebido:', bookingData);
      
      if (!bookingData.client || !bookingData.professional || !bookingData.specialty || !bookingData.timeSlot || !bookingData.date) {
        console.error('Dados de agendamento incompletos');
        return;
      }
      
      // Obter o owner_id do calendário
      const { data: calendarData, error: calendarError } = await supabase
        .from('calendars')
        .select('owner_id')
        .eq('id', calendarId)
        .single();
        
      if (calendarError) throw calendarError;
      
      const owner_id = calendarData.owner_id;
      
      if (!owner_id) {
        throw new Error('Não foi possível determinar o proprietário do calendário');
      }
      
      // Verificar se o cliente já existe pelo email
      let clientId;
      
      // Primeiro, verificar se o cliente já existe pelo email
      const { data: existingClient, error: clientCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', bookingData.client.email)
        .maybeSingle(); // Use maybeSingle em vez de single para evitar erros
        
      if (clientCheckError && clientCheckError.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar cliente: ${clientCheckError.message}`);
      }
      
      if (existingClient) {
        // Cliente já existe, usar o ID existente
        console.log('Cliente já existe, usando ID existente:', existingClient.id);
        clientId = existingClient.id;
      } else {
        // Cliente não existe, criar novo
        console.log('Criando novo cliente com email:', bookingData.client.email);
        const { data: newClient, error: createClientError } = await supabase
          .from('clients')
          .insert({
            name: bookingData.client.name,
            email: bookingData.client.email,
            phone: bookingData.client.phone,
            owner_id: owner_id
          })
          .select('id')
          .single();
          
        if (createClientError) {
          throw new Error(`Erro ao criar cliente: ${createClientError.message}`);
        }
        
        clientId = newClient.id;
        console.log('Novo cliente criado com ID:', clientId);
      }
      
      // Preparar os dados do agendamento no formato correto
      const startTime = new Date(bookingData.timeSlot.start);
      const endTime = new Date(bookingData.timeSlot.end);
      
      const appointmentData = {
        client_id: clientId,
        professional_id: bookingData.professional.id,
        specialty_id: bookingData.specialty.id,
        calendar_id: calendarId,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        notes: ''
      };
      
      console.log('📦 Dados sendo enviados ao Supabase:', appointmentData);
      
      // Salvar o agendamento
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
        
      if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`);
      
      console.log('✅ Agendamento criado com sucesso:', appointment);
      
      // Chamar o callback onComplete com os dados completos
      if (onComplete) {
        onComplete(appointment);
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      throw error; // Propagar o erro para que possa ser tratado pelo chamador
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Filter professionals based on selected specialty
  const availableProfessionals = bookingData.specialty
    ? professionals.filter((p) => {
        return Array.isArray(p.specialties) &&
          p.specialties.some((s: any) => s?.id === bookingData.specialty?.id);
      })
    : [];

  // Get available time slots based on selected professional and specialty
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
  
  

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                  currentStep >= step
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'border-gray-300 text-gray-400'
                }`}
              >
                  {currentStep > step ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <span className="text-sm">{step}</span>
                  )}
                </div>
                <div className="text-xs mt-1 text-center">
                  {step === 1 && 'Specialty'}
                  {step === 2 && 'Professional'}
                  {step === 3 && 'Date & Time'}
                  {step === 4 && 'Your Info'}
                  {step === 5 && 'Confirm'}
                </div>
              </div>
              
              {step < 5 && (
                <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep > step ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <div className="animate-fade-in">
        {currentStep === 1 && (
          <SpecialtySelection
            specialties={specialties}
            onSelect={handleSpecialtySelect}
          />
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
            getTimeSlots={getTimeSlots}
            onSelect={handleDateTimeSelect}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 4 && (
          <ClientInfoForm
            onSubmit={handleClientInfoSubmit}
            onBack={handleBack}
          />
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