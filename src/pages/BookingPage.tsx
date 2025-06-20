import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import BookingSteps from '../components/booking/BookingSteps';
import { supabase } from '../lib/supabase';
import { Loader, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';

interface Specialty {
  id: string;
  name: string;
  duration: number;
  price?: number;
  description?: string;
  calendarId: string;
  userId: string;
  createdAt: Date;
}

interface Professional {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  specialtyId: string;
  calendarId: string;
  userId: string;
  createdAt: Date;
  specialty?: {
    id: string;
    name: string;
  };
}

interface Calendar {
  id: string;
  name: string;
  location_id?: string;
  specialties: Specialty[];
  professionals: Professional[];
}

const SharedBookingPage = () => {
  const { calendarId } = useParams<{ calendarId: string }>();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        if (!calendarId) {
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
              specialty_id
            )
          `)
          .eq('id', calendarId)
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Calendar not found');

        setCalendar(data);
      } catch (err) {
        console.error('Erro ao carregar a agenda:', err);
        setError('Não foi possível carregar a agenda.');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [calendarId]);

  useEffect(() => {
    if (calendar?.name) {
      document.title = `${calendar.name} | Agendamento`;
    }
  }, [calendar]);

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
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Agenda não encontrada</h2>
            <p className="text-gray-600 mb-4">
              {error || 'O link de agendamento não existe ou foi removido.'}
            </p>
            <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-2 sm:px-4">
      <div className="mx-auto w-full max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <Card className="rounded-2xl shadow-xl border-0">
          <CardHeader className="pb-3 border-b-0 bg-gradient-to-r from-primary-50 to-white rounded-t-2xl">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="flex items-center gap-2 text-2xl font-bold text-primary-700">
                <CalendarIcon className="w-6 h-6 text-primary-500" />
                {calendar.name}
              </span>
              {calendar.location_id && (
                <span className="flex items-center gap-1 text-sm font-normal text-gray-500 mt-1 sm:mt-0">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {calendar.location_id}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 bg-white rounded-b-2xl">
            <div className="p-4 sm:p-6 bg-gray-50 rounded-2xl shadow-inner">
              <BookingSteps 
                calendarId={calendarId ?? ''} 
                specialties={calendar.specialties}
                professionals={calendar.professionals}
                onComplete={async (bookingData) => {
                  try {
                    const response = await fetch(
                      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/appointments/book`,
                      {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        },
                        body: JSON.stringify(bookingData),
                      }
                    );

                    if (!response.ok) throw new Error('Falha ao agendar');

                    toast.success('Agendamento realizado com sucesso!');
                  } catch (error) {
                    console.error('Erro ao agendar:', error);
                    toast.error('Erro ao agendar. Tente novamente.');
                  }
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SharedBookingPage;
