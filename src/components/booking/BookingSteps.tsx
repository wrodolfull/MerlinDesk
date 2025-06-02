import React, { useState, useEffect } from 'react';
import { SpecialtySelection } from './SpecialtySelection';
import { ProfessionalSelection } from './ProfessionalSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { ClientInfoForm } from './ClientInfoForm';
import { BookingConfirmation } from './BookingConfirmation';
import { Client, Professional, Specialty } from '../../types';
import { supabase } from '../../lib/supabase';
import { Check } from 'lucide-react';
import { format as formatDate } from 'date-fns';
const [loadingDays, setLoadingDays] = useState(false);

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
    const [workingDays, setWorkingDays] = useState<number[]>([]);

    useEffect(() => {
      const fetchWorkingDays = async () => {
        if (!bookingData.professional) return;

        setLoadingDays(true);

        const { data, error } = await supabase
          .from('working_hours')
          .select('day_of_week')
          .eq('professional_id', bookingData.professional.id)
          .eq('is_working_day', true);

        if (error) {
          console.error('Erro ao buscar dias de trabalho:', error);
          setWorkingDays([]);
        } else {
          setWorkingDays(data.map((d) => d.day_of_week));
        }

        setLoadingDays(false);
      };

      fetchWorkingDays();
    }, [bookingData.professional]);
  
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
      
      const { data: existingClient, error: clientCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', bookingData.client.email)
        .eq('owner_id', owner_id)
        .maybeSingle();
        
      if (clientCheckError && clientCheckError.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar cliente: ${clientCheckError.message}`);
      }
      
      if (existingClient) {
        console.log('Cliente já existe, usando ID existente:', existingClient.id);
        clientId = existingClient.id;
      } else {
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
      
      // Preparar os dados do agendamento
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
      
      if (onComplete) {
        onComplete(appointment);
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      throw error;
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

  // Get available time slots
  const getTimeSlots = async (date: Date) => {
    if (!bookingData.professional || !bookingData.specialty) return [];

    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        input_professional_id: bookingData.professional.id,
        input_specialty_id: bookingData.specialty.id,
        input_date: formatDate(date, 'yyyy-MM-dd'),
      });

      if (error) {
        console.error('Erro ao buscar horários disponíveis:', error);
        return [];
      }

      return Array.isArray(data)
        ? data.map((slot: { start_time: string; end_time: string }) => ({
            start: slot.start_time,
            end: slot.end_time,
          }))
        : [];
    } catch (err) {
      console.error('Erro inesperado ao buscar horários disponíveis:', err);
      return [];
    }
  };

  const steps = [
    { id: 1, title: ''},
    { id: 2, title: ''},
    { id: 3, title: ''},
    { id: 4, title: ''},
    { id: 5, title: ''}
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps - Design Moderno */}
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          {/* Linha de progresso de fundo */}
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
          
          {/* Linha de progresso ativa */}
          <div 
            className="absolute top-4 left-0 h-0.5 bg-blue-600 z-10 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>

          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative z-20">
              {/* Círculo do step */}
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  currentStep > step.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : currentStep === step.id
                    ? 'bg-white border-blue-600 text-blue-600 shadow-lg ring-4 ring-blue-100'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div className={`w-2 h-2 rounded-full ${
                    currentStep === step.id ? 'bg-blue-600' : 'bg-gray-400'
                  }`} />
                )}
              </div>
              
              {/* Título e descrição */}
              <div className="text-center mt-3 max-w-24">
                <div className={`text-sm font-medium transition-colors ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                <div className={`text-xs mt-1 transition-colors ${
                  currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {step.description}
                </div>
              </div>
            </div>
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
          loadingDays ? (
            <div className="text-center text-gray-500 py-10">Carregando dias disponíveis...</div>
          ) : workingDays.length > 0 ? (
            <DateTimeSelection
              professional={bookingData.professional}
              specialty={bookingData.specialty}
              onSelect={handleDateTimeSelect}
              onBack={handleBack}
              workingDays={workingDays}
            />
          ) : (
            <div className="text-center text-red-500 py-10">
              Nenhum horário de trabalho configurado para esse profissional.
            </div>
          )
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