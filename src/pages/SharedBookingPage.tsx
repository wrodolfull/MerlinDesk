import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import BookingSteps from '../components/booking/BookingSteps';
import { supabase } from '../lib/supabase';
import { Loader } from 'lucide-react';

const SharedBookingPage = () => {
  const { calendarId } = useParams();
  const [calendar, setCalendar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        const cleanCalendarId = calendarId?.replace(':', '');

        if (!cleanCalendarId) {
          setError('Calendar ID is required');
          return;
        }

        const { data, error: fetchError } = await supabase
          .from('calendars')
          .select(`
            *,
            specialties (
              id,
              name,
              duration,
              price,
              description
            ),
            professionals (
              id,
              name,
              email,
              phone,
              avatar,
              bio,
              specialties:professional_specialties (
                specialties (
                  id,
                  name
                )
              )
            )
          `)
          .eq('id', cleanCalendarId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Calendar not found');

        const parsedProfessionals = (data.professionals || []).map((p: any) => ({
          ...p,
          specialties: (p.specialties || []).map((ps: any) => ps.specialties).filter(Boolean),
        }));

        setCalendar({
          ...data,
          professionals: parsedProfessionals,
        });
      } catch (err) {
        console.error('Error fetching calendar:', err);
        setError('Failed to load calendar information');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [calendarId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (error || !calendar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Calendar Not Found</h2>
            <p className="text-gray-600">
              {error || 'The calendar you\'re looking for doesn\'t exist or may have been removed.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold text-green-600 mb-2">Appointment Booked Successfully!</h2>
            <p className="text-gray-600">
              Thank you for booking with us. You will receive a confirmation shortly.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="container mx-auto max-w-6xl">
        <Card>
          <CardHeader className="pb-3 border-b">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <span>{calendar.name}</span>
              {calendar.location_id && (
                <span className="text-sm font-normal text-gray-500 mt-1 sm:mt-0">
                  {calendar.location_id}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <BookingSteps
              calendarId={calendarId?.replace(':', '') || ''}
              specialties={calendar.specialties}
              professionals={calendar.professionals}
              onComplete={async (appointment) => {
                try {
                  console.log('📋 Agendamento criado com sucesso:', appointment);
                  
                  // Se o agendamento já foi criado com sucesso no BookingSteps
                  if (appointment.id) {
                    // Não precisamos fazer mais nada, apenas mostrar a confirmação
                    setBookingComplete(true);
                    return;
                  }
                  
                  // Se chegarmos aqui, significa que o BookingSteps não criou o agendamento
                  // e estamos recebendo apenas os dados para criar
                  console.error('Agendamento não foi criado no BookingSteps');
                  throw new Error('Appointment was not created properly');
                  
                } catch (error) {
                  console.error('Error booking appointment:', error);
                  alert('Failed to book appointment. Please try again.');
                }
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedBookingPage;
