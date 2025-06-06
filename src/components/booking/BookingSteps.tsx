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
      if (!bookingData.professional?.id) return setWorkingDays([]);

      const { data, error } = await supabase
        .from('working_hours')
        .select('day_of_week, is_working_day')
        .eq('professional_id', bookingData.professional.id)
        .eq('is_working_day', true);

      if (error) return console.error('Erro:', error);

      setWorkingDays(data.map((d) => d.day_of_week));
    };

    fetchWorkingDays();
  }, [bookingData.professional?.id]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail.professionalId === bookingData.professional?.id) {
        setRefreshWorkingDays((prev) => prev + 1);
      }
    };

    window.addEventListener('workingHoursChanged', handler);
    return () => window.removeEventListener('workingHoursChanged', handler);
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

  const handleClientInfoSubmit = (client: Client) => {
    setBookingData(prev => ({ ...prev, client }));
    setCurrentStep(5);
  };

  const handleConfirmBooking = async () => {
    try {
      const { specialty, professional, client, date, timeSlot } = bookingData;
      if (!specialty || !professional || !client || !date || !timeSlot) return;

      const { data: calendarData, error: calendarError } = await supabase
        .from('calendars')
        .select('owner_id')
        .eq('id', calendarId)
        .single();

      if (calendarError) throw calendarError;
      const owner_id = calendarData.owner_id;

      let clientId;
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', client.email)
        .eq('owner_id', owner_id)
        .maybeSingle();

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        const { data: newClient } = await supabase
          .from('clients')
          .insert({ name: client.name, email: client.email, phone: client.phone, owner_id })
          .select('id')
          .single();

        clientId = newClient.id;
      }

      const appointmentData = {
        client_id: clientId,
        professional_id: professional.id,
        specialty_id: specialty.id,
        calendar_id: calendarId,
        start_time: new Date(timeSlot.start).toISOString(),
        end_time: new Date(timeSlot.end).toISOString(),
        status: 'pending',
        notes: ''
      };

      const { data: createdAppointment } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();

      if (onComplete) onComplete(createdAppointment);

      setTimeout(() => {
        window.open('https://merlindesk.com', '_blank');
      }, 5000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const availableProfessionals = bookingData.specialty
    ? professionals.filter(p =>
        Array.isArray(p.specialties) &&
        p.specialties.some((s: any) => s?.id === bookingData.specialty?.id)
      )
    : [];

  const getTimeSlots = async (date: Date) => {
    if (!bookingData.professional || !bookingData.specialty) return [];

    const dateString = date.toISOString().split('T')[0];

    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        input_professional_id: bookingData.professional.id,
        input_specialty_id: bookingData.specialty.id,
        input_date: dateString,
      });

      if (error || !Array.isArray(data)) return [];

      return data.map((slot) => ({
        start: new Date(slot.start_time).toISOString(),
        end: new Date(slot.end_time).toISOString(),
      }));
    } catch (error) {
      console.error(error);
      return [];
    }
  };

  const steps = [1, 2, 3, 4, 5];

  return (
    <div className="w-full min-h-screen overflow-x-hidden bg-white text-gray-900 px-4 py-6">
      {/* Barra de progresso */}
      <div className="w-full max-w-5xl mx-auto mb-6">
        <div className="relative flex justify-between items-center">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
          <div
            className="absolute top-4 left-0 h-0.5 bg-[#7C45D0] z-10 transition-all duration-500 ease-out"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          ></div>
          {steps.map((step) => (
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
                  <div className={`w-2 h-2 rounded-full ${currentStep === step ? 'bg-[#7C45D0]' : 'bg-gray-400'}`} />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Etapas */}
      <div className="w-full max-w-4xl mx-auto">
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
