import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Building, MapPin, Plus, Users, Edit, Trash2, CalendarRange, Loader, Share2, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CreateCalendarModal from '../components/modals/CreateCalendarModal';
import CreateSpecialtyModal from '../components/modals/CreateSpecialtyModal';
import CreateProfessionalModal from '../components/modals/CreateProfessionalModal';
import EditCalendarModal from '../components/modals/EditCalendarModal';
import EditSpecialtyModal from '../components/modals/EditSpecialtyModal';
import EditProfessionalModal from '../components/modals/EditProfessionalModal';
import ShareCalendarModal from '../components/modals/ShareCalendarModal';
import { Calendar, Professional, Specialty } from '../types';
import toast, { Toaster } from 'react-hot-toast';

const CalendarsPage = () => {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const [showCreateCalendar, setShowCreateCalendar] = useState(false);
  const [showCreateSpecialty, setShowCreateSpecialty] = useState(false);
  const [showCreateProfessional, setShowCreateProfessional] = useState(false);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [editingCalendar, setEditingCalendar] = useState<Calendar | null>(null);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [sharingCalendar, setSharingCalendar] = useState<Calendar | null>(null);
  const [showCalendarId, setShowCalendarId] = useState(false);
  const [iframeCalendarId, setIframeCalendarId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      if (!user) {
        setCalendars([]);
        setSpecialties([]);
        setProfessionals([]);
        return;
      }

      const { data: calendarsData, error: calendarsError } = await supabase
        .from('calendars')
        .select('*')
        .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (calendarsError) throw calendarsError;
      setCalendars(
        (calendarsData || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          location_id: c.location_id,
          ownerId: c.owner_id,
          createdAt: new Date(c.created_at),
        }))
      );

      const calendarIds = (calendarsData || []).map((c) => c.id);

      const { data: specialtiesData, error: specialtiesError } = await supabase
        .from('specialties')
        .select('*')
        .in('calendar_id', calendarIds)
        .eq('user_id', user.id);

        if (specialtiesError) throw specialtiesError;
        setSpecialties(
          (specialtiesData || []).map((s) => ({
            ...s,
            calendarId: s.calendar_id,
          }))
        );

        const { data: professionalsData, error: professionalsError } = await supabase
        .from('professionals')
        .select(`
          *,
          specialties:professional_specialties (
            specialties(id, name)
          )
        `)
        .in('calendar_id', calendarIds)
        .eq('user_id', user.id);
  
      if (professionalsError) throw professionalsError;
      const mappedProfessionals: Professional[] = (professionalsData || []).map((p: any) => ({
        ...p,
        calendarId: p.calendar_id,
        avatar: p.avatar || null,
        specialties: (p.specialties || []).map((rel: any) => rel.specialties),
      }));
      setProfessionals(mappedProfessionals);
  
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  const handleDeleteCalendar = async (id: string) => {
    try {
      const { error } = await supabase.from('calendars').delete().eq('id', id);
      if (error) throw error;
      setCalendars(calendars.filter((calendar) => calendar.id !== id));
      toast.success('Calendar deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete calendar';
      console.error(message);
      toast.error(message);
    }
  };

  const handleDeleteSpecialty = async (id: string) => {
    try {
      const { error } = await supabase.from('specialties').delete().eq('id', id);
      if (error) throw error;
      setSpecialties(specialties.filter((specialty) => specialty.id !== id));
      toast.success('Specialty deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete specialty';
      console.error(message);
      toast.error(message);
    }
  };

  const handleDeleteProfessional = async (id: string) => {
    try {
      const { error } = await supabase.from('professionals').delete().eq('id', id);
      if (error) throw error;
      setProfessionals(professionals.filter((professional) => professional.id !== id));
      toast.success('Professional deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete professional';
      console.error(message);
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-error-500">
          Error loading data. Please try again later.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600">Gerencie seus calendários</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreateCalendar(true)}>
          Criar calendário
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-8">
        {calendars.map((calendar) => {
          const calendarSpecialties = specialties.filter((s) => s.calendarId === calendar.id);
          const calendarProfessionals = professionals.filter((p) => p.calendarId === calendar.id);

          return (
            <Card key={calendar.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div className="bg-primary-100 p-2 rounded-full mr-4">
                      <Building className="h-8 w-8 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle>{calendar.name}</CardTitle>
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <MapPin size={14} className="mr-1" />
                        <span>{calendar.location_id || 'Nenhuma localização adicionada'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Share2 size={14} />}
                      onClick={() => setSharingCalendar(calendar)}
                      style={{ borderColor: '#7C45D0', color: '#7C45D0' }}
                    >
                      Compartilhar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit size={14} />}
                      onClick={() => setEditingCalendar(calendar)}
                    >
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-error-500 border-error-500 hover:bg-error-50"
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => handleDeleteCalendar(calendar.id)}
                    >
                      Deletar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Eye size={14} />}
                      onClick={() => {
                        setSelectedCalendarId(calendar.id);
                        setShowCalendarId(true);
                      }}
                    >
                      ID
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Share2 size={14} />}
                      onClick={() => setIframeCalendarId(calendar.id)}
                    >
                      Iframe
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium flex items-center">
                        <CalendarRange size={18} className="mr-2 text-gray-500" /> Especialidades
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => {
                          setSelectedCalendarId(calendar.id);
                          setShowCreateSpecialty(true);
                        }}
                      >
                        Adicionar
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3">
                      {calendarSpecialties.length > 0 ? (
                        <ul className="space-y-2">
                          {calendarSpecialties.map((specialty) => (
                            <li
                              key={specialty.id}
                              className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                            >
                              <div>
                                <p className="font-medium">{specialty.name}</p>
                                <p className="text-sm text-gray-500">
                                  {specialty.duration} min {specialty.price && `• $${specialty.price}`}
                                </p>
                              </div>
                              <div className="flex space-x-1">
                                <button
                                  className="p-1 text-gray-500 hover:text-gray-700"
                                  onClick={() => setEditingSpecialty(specialty)}
                                >
                                  <Edit size={14} />
                                </button>
                                <button
                                  className="p-1 text-gray-500 hover:text-error-500"
                                  onClick={() => handleDeleteSpecialty(specialty.id)}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-center text-gray-500 py-4">Nenhuma especialidade criada</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium flex items-center">
                        <Users size={18} className="mr-2 text-gray-500" /> Profissionais
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        leftIcon={<Plus size={14} />}
                        onClick={() => {
                          setSelectedCalendarId(calendar.id);
                          setShowCreateProfessional(true);
                        }}
                      >
                        Adicionar
                      </Button>
                    </div>
                    <div className="bg-gray-50 rounded-md p-3">
                      {calendarProfessionals.length > 0 ? (
                        <ul className="space-y-2">
                          {calendarProfessionals.map((professional) => {
                            <p className="text-sm text-gray-500">
                            {professional.specialties?.length
                              ? professional.specialties.map((s) => s.name).join(', ')
                              : 'No specialty assigned'}
                          </p>
                            return (
                              <li
                                key={professional.id}
                                className="flex justify-between items-center p-2 bg-white rounded border border-gray-200"
                              >
                                <div className="flex items-center">
                                  
                                  <div>
                                    <p className="font-medium">{professional.name}</p>
                                    <p className="text-sm text-gray-500">
                                      {professional.specialties?.length
                                        ? professional.specialties.map((s) => s.name).join(', ')
                                        : 'No specialty assigned'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex space-x-1">
                                  <button
                                    className="p-1 text-gray-500 hover:text-gray-700"
                                    onClick={() => setEditingProfessional(professional)}
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="p-1 text-gray-500 hover:text-error-500"
                                    onClick={() => handleDeleteProfessional(professional.id)}
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      ) : (
                        <p className="text-center text-gray-500 py-4">Nenhum profissional criado</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showCreateCalendar && (
        <CreateCalendarModal onClose={() => setShowCreateCalendar(false)} onSuccess={fetchData} />
      )}

      {showCreateSpecialty && selectedCalendarId && (
        <CreateSpecialtyModal
          calendarId={selectedCalendarId}
          onClose={() => {
            setShowCreateSpecialty(false);
            setSelectedCalendarId(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {showCreateProfessional && selectedCalendarId && (
        <CreateProfessionalModal
          calendarId={selectedCalendarId}
          specialties={specialties.filter((s) => s.calendarId === selectedCalendarId)}
          onClose={() => {
            setShowCreateProfessional(false);
            setSelectedCalendarId(null);
          }}
          onSuccess={fetchData}
        />
      )}

      {editingCalendar && (
        <EditCalendarModal
          calendar={editingCalendar}
          onClose={() => setEditingCalendar(null)}
          onSuccess={fetchData}
        />
      )}

      {editingSpecialty && (
        <EditSpecialtyModal
          specialty={editingSpecialty}
          onClose={() => setEditingSpecialty(null)}
          onSuccess={fetchData}
        />
      )}

      {editingProfessional && (
        <EditProfessionalModal
          professional={editingProfessional}
          specialties={specialties.filter((s) => s.calendarId === editingProfessional.calendarId)}
          onClose={() => setEditingProfessional(null)}
          onSuccess={fetchData}
        />
      )}

      {sharingCalendar && (
        <ShareCalendarModal calendar={sharingCalendar} onClose={() => setSharingCalendar(null)} />
      )}
      {showCalendarId && selectedCalendarId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">ID do Calendário</h2>
            <p className="text-sm text-gray-600 mb-2">Copie este ID para integrar à API de agendamento:</p>
            <textarea
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
              value={selectedCalendarId}
              rows={3}
              onFocus={(e) => e.target.select()}
            />
            <div className="mt-4 flex justify-end">
              <button
                className="text-sm px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                onClick={() => setShowCalendarId(false)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {iframeCalendarId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">Incorpore este calendário</h2>
            <p className="text-sm text-gray-600 mb-2">Copie e cole o código abaixo no seu site:</p>
            <textarea
              readOnly
              className="w-full p-2 border border-gray-300 rounded bg-gray-50 text-sm font-mono"
              value={`<iframe src="https://merlindesk.com/booking/embed/${iframeCalendarId}" width="100%" height="700" frameborder="0" style="border:none;"></iframe>`}
              rows={4}
              onFocus={(e) => e.target.select()}
            />
            <div className="mt-4 flex justify-between items-center">
              <button
                className="text-sm text-blue-600 underline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<iframe src="https://merlindesk.com/booking/embed/${iframeCalendarId}" width="100%" height="700" frameborder="0" style="border:none;"></iframe>`
                  );
                  toast.success('Código copiado!');
                }}
              >
                Copiar código
              </button>
              <button
                className="text-sm px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
                onClick={() => setIframeCalendarId(null)}
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default CalendarsPage;