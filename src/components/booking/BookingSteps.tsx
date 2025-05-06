import React, { useState } from 'react';
import { SpecialtySelection } from './SpecialtySelection';
import { ProfessionalSelection } from './ProfessionalSelection';
import { DateTimeSelection } from './DateTimeSelection';
import { ClientInfoForm } from './ClientInfoForm';
import { BookingConfirmation } from './BookingConfirmation';
import { Client, Professional, Specialty } from '../../types';

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
  
  const handleConfirmBooking = () => {
    if (onComplete && bookingData.client && bookingData.professional && bookingData.specialty && bookingData.timeSlot) {
      onComplete({
        clientId: bookingData.client.id,
        professionalId: bookingData.professional.id,
        specialtyId: bookingData.specialty.id,
        startTime: bookingData.timeSlot.start,
        endTime: bookingData.timeSlot.end,
        notes: '',
      });
    }
  };
  
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Filter professionals based on selected specialty
  const availableProfessionals = bookingData.specialty
    ? professionals.filter(p => p.specialty_id === bookingData.specialty?.id)
    : [];

  // Get available time slots based on selected professional and specialty
  const getTimeSlots = async () => {
    if (!bookingData.professional || !bookingData.date || !bookingData.specialty) {
      return [];
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointments/available-slots?` + 
        new URLSearchParams({
          professionalId: bookingData.professional.id,
          date: bookingData.date.toISOString().split('T')[0],
          specialtyId: bookingData.specialty.id,
        }),
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (!response.ok) throw new Error('Failed to fetch time slots');
      
      const data = await response.json();
      return data.slots || [];
    } catch (error) {
      console.error('Error fetching time slots:', error);
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