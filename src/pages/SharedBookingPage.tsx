import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import BookingSteps from '../components/booking/BookingSteps';
import { supabase } from '../lib/supabase';
import { Loader, MapPin, Calendar, Star, Users, CheckCircle, AlertCircle } from 'lucide-react';

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
        setError('Não foi possível carregar as informações da agenda');
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
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Carregando agenda...</p>
        </div>
      </div>
    );
  }

  if (error || !calendar) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Agenda não encontrada</h2>
            <p className="text-gray-600 mb-6">
              {error || 'A agenda que você está procurando não existe ou foi removida.'}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Tentar novamente
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Agendamento Confirmado! 🎉
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Obrigado por agendar conosco. Você receberá uma confirmação em breve.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                ✅ Seu agendamento foi registrado com sucesso
              </p>
              <p className="text-green-700 text-sm mt-1">
                Verifique seu email para mais detalhes
              </p>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Fazer outro agendamento
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Hero Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto max-w-6xl px-4 py-8 lg:py-12">
          <div className="text-center lg:text-left">
            {/* Logo/Avatar */}
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-lg">
              <span className="text-2xl font-bold text-white">
                {calendar.name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            
            {/* Title and Description */}
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {calendar.name}
            </h1>
            
            {calendar.description && (
              <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto lg:mx-0">
                {calendar.description}
              </p>
            )}
            
            {/* Info Badges */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
              {calendar.specialties?.length > 0 && (
                <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
                  <Star className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {calendar.specialties.length} {calendar.specialties.length === 1 ? 'Especialidade' : 'Especialidades'}
                  </span>
                </div>
              )}
              
              {calendar.professionals?.length > 0 && (
                <div className="flex items-center bg-purple-50 text-purple-700 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">
                    {calendar.professionals.length} {calendar.professionals.length === 1 ? 'Profissional' : 'Profissionais'}
                  </span>
                </div>
              )}
              
              {calendar.location_id && (
                <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">{calendar.location_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8 lg:py-12">
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Left Column - Team Info */}
          <div className="lg:col-span-4 space-y-6">
            {/* Team Preview */}
            {calendar.professionals?.length > 0 && (
              <Card className="shadow-lg border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl text-gray-900">Nossa Equipe</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calendar.professionals.slice(0, 3).map((professional: any) => (
                      <div key={professional.id} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          {professional.avatar ? (
                            <img 
                              src={professional.avatar} 
                              alt={professional.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-medium text-sm">
                              {professional.name?.charAt(0)?.toUpperCase() || 'P'}
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{professional.name}</p>
                          {professional.bio && (
                            <p className="text-sm text-gray-600 truncate">{professional.bio}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {calendar.professionals.length > 3 && (
                      <p className="text-sm text-gray-500 text-center pt-2">
                        +{calendar.professionals.length - 3} outros profissionais
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Form */}
          <div className="lg:col-span-8">
            <Card className="shadow-xl border-0 bg-white">
              <CardHeader className="pb-6 border-b border-gray-100">
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Calendar className="w-6 h-6 mr-3 text-blue-600" />
                  Agendar Horário
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Selecione o serviço e horário de sua preferência
                </p>
              </CardHeader>
              <CardContent className="p-6 lg:p-8">
                <BookingSteps
                  calendarId={calendarId?.replace(':', '') || ''}
                  specialties={calendar.specialties}
                  professionals={calendar.professionals}
                  onComplete={async (appointment) => {
                    try {
                      console.log('📋 Agendamento criado com sucesso:', appointment);
                      
                      if (appointment.id) {
                        setBookingComplete(true);
                        return;
                      }
                      
                      console.error('Agendamento não foi criado no BookingSteps');
                      throw new Error('Appointment was not created properly');
                      
                    } catch (error) {
                      console.error('Error booking appointment:', error);
                      alert('Falha ao agendar. Tente novamente.');
                    }
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 mt-16">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="text-center text-gray-600">
            <p className="text-sm">
              Powered by <span className="font-semibold text-blue-600">Dohoo</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharedBookingPage;
