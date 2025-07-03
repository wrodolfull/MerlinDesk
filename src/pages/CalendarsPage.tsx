import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Building, MapPin, Plus, Users, Edit, Trash2, CalendarRange, Loader, Share2, Eye, MoreVertical } from 'lucide-react';
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

      // Buscar especialidades - verificar se calendar_id existe primeiro
      let specialtiesData = [];
      if (calendarIds.length > 0) {
        console.log('🔍 CalendarsPage: Buscando especialidades para calendários:', calendarIds);
        
        const { data: specialtiesResult, error: specialtiesError } = await supabase
          .from('specialties')
          .select('*')
          .in('calendar_id', calendarIds)
          .eq('user_id', user.id);

        if (specialtiesError) {
          console.warn('Erro ao buscar especialidades:', specialtiesError);
        } else {
          specialtiesData = specialtiesResult || [];
          console.log('🔍 CalendarsPage: Especialidades encontradas:', specialtiesData);
        }
      } else {
        console.log('🔍 CalendarsPage: Nenhum calendar_id para buscar especialidades');
      }

      setSpecialties(
        specialtiesData.map((s: any) => ({
          ...s,
          calendarId: s.calendar_id,
        }))
      );

      // Buscar profissionais com especialidades - verificar se calendar_id existe primeiro
      let professionalsData = [];
      if (calendarIds.length > 0) {
        console.log('🔍 CalendarsPage: Buscando profissionais para calendários:', calendarIds);
        
        const { data: professionalsResult, error: professionalsError } = await supabase
          .from('professionals')
          .select(`
            *,
            professional_specialties(
              specialty_id,
              specialties(
                id,
                name
              )
            )
          `)
          .in('calendar_id', calendarIds)
          .eq('user_id', user.id);

        if (professionalsError) {
          console.warn('Erro ao buscar profissionais:', professionalsError);
        } else {
          professionalsData = professionalsResult || [];
          console.log('🔍 CalendarsPage: Profissionais encontrados:', professionalsData);
        }
      } else {
        console.log('🔍 CalendarsPage: Nenhum calendar_id para buscar profissionais');
      }

      const mappedProfessionals: Professional[] = professionalsData.map((p: any) => {
        const specialties = (p.professional_specialties || [])
          .map((ps: any) => ps.specialties)
          .filter((s: any) => s);
        
        return {
          ...p,
          calendarId: p.calendar_id,
          avatar: p.avatar || null,
          specialties: specialties,
        };
      });
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
      
      {/* Header Responsivo */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Calendário</h1>
          <p className="text-gray-600">Gerencie seus calendários</p>
        </div>
        <div className="flex-shrink-0">
          <Button 
            leftIcon={<Plus size={16} />} 
            onClick={() => setShowCreateCalendar(true)}
            className="w-full sm:w-auto"
          >
            <span className="hidden sm:inline">Criar calendário</span>
            <span className="sm:hidden">Novo</span>
          </Button>
        </div>
      </div>

      {/* Lista de Calendários */}
      <div className="space-y-6">
        {calendars.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum calendário criado</h3>
              <p className="text-gray-500 mb-4">Crie seu primeiro calendário para começar a gerenciar agendamentos</p>
              <Button onClick={() => setShowCreateCalendar(true)}>
                Criar primeiro calendário
              </Button>
            </CardContent>
          </Card>
        ) : (
          calendars.map((calendar) => {
            const calendarSpecialties = specialties.filter((s) => s.calendarId === calendar.id);
            const calendarProfessionals = professionals.filter((p) => p.calendarId === calendar.id);

            return (
              <Card key={calendar.id} className="overflow-hidden">
                {/* Header do Card */}
                <CardHeader className="pb-4">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    {/* Informações do Calendário */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-primary-100 p-3 rounded-full flex-shrink-0">
                        <Building className="h-6 w-6 text-primary-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-1">{calendar.name}</CardTitle>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin size={14} className="mr-1 flex-shrink-0" />
                          <span className="truncate">
                            {calendar.location_id || 'Nenhuma localização adicionada'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex flex-wrap gap-2 lg:flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Share2 size={14} />}
                        onClick={() => setSharingCalendar(calendar)}
                        className="bg-[#7C45D0] text-white border-[#7C45D0] hover:bg-[#6D3FC4]"
                      >
                        <span className="hidden sm:inline">Compartilhar</span>
                        <span className="sm:hidden">Compartilhar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit size={14} />}
                        onClick={() => setEditingCalendar(calendar)}
                      >
                        <span className="hidden sm:inline">Editar</span>
                        <span className="sm:hidden">Editar</span>
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-error-500 border-error-500 hover:bg-error-50"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => handleDeleteCalendar(calendar.id)}
                      >
                        <span className="hidden sm:inline">Deletar</span>
                        <span className="sm:hidden">Deletar</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Conteúdo do Card */}
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Seção de Especialidades */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium flex items-center text-gray-900">
                          <CalendarRange size={18} className="mr-2 text-gray-500" />
                          <span className="hidden sm:inline">Especialidades</span>
                          <span className="sm:hidden">Especialidades</span>
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Plus size={14} />}
                          onClick={() => {
                            setSelectedCalendarId(calendar.id);
                            setShowCreateSpecialty(true);
                          }}
                          className="text-sm"
                        >
                          <span className="hidden sm:inline">Adicionar</span>
                          <span className="sm:hidden">+</span>
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        {calendarSpecialties.length > 0 ? (
                          <div className="space-y-3">
                            {calendarSpecialties.map((specialty) => (
                              <div
                                key={specialty.id}
                                className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{specialty.name}</p>
                                  <p className="text-sm text-gray-500">
                                    {specialty.duration} min {specialty.price && `• R$ ${specialty.price}`}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                                  <button
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                    onClick={() => setEditingSpecialty(specialty)}
                                    title="Editar especialidade"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded transition-colors"
                                    onClick={() => handleDeleteSpecialty(specialty.id)}
                                    title="Deletar especialidade"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <CalendarRange className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Nenhuma especialidade criada</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Seção de Profissionais */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium flex items-center text-gray-900">
                          <Users size={18} className="mr-2 text-gray-500" />
                          <span className="hidden sm:inline">Profissionais</span>
                          <span className="sm:hidden">Profissionais</span>
                        </h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Plus size={14} />}
                          onClick={() => {
                            setSelectedCalendarId(calendar.id);
                            setShowCreateProfessional(true);
                          }}
                          className="text-sm"
                        >
                          <span className="hidden sm:inline">Adicionar</span>
                          <span className="sm:hidden">+</span>
                        </Button>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg p-4">
                        {calendarProfessionals.length > 0 ? (
                          <div className="space-y-3">
                            {calendarProfessionals.map((professional) => (
                              <div
                                key={professional.id}
                                className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{professional.name}</p>
                                  <p className="text-sm text-gray-500 truncate">
                                    {professional.specialties?.length
                                      ? professional.specialties.map((s) => s.name).join(', ')
                                      : 'Nenhuma especialidade atribuída'}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                                  <button
                                    className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                                    onClick={() => setEditingProfessional(professional)}
                                    title="Editar profissional"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    className="p-1.5 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded transition-colors"
                                    onClick={() => handleDeleteProfessional(professional.id)}
                                    title="Deletar profissional"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                            <p className="text-gray-500 text-sm">Nenhum profissional criado</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modais */}
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

      {/* Modal de ID do Calendário */}
      {showCalendarId && selectedCalendarId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">ID do Calendário</h2>
            <p className="text-sm text-gray-600 mb-2">Copie este ID para integrar à API de agendamento:</p>
            <textarea
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono resize-none"
              value={selectedCalendarId}
              rows={3}
              onFocus={(e) => e.target.select()}
            />
            <div className="mt-4 flex justify-end">
              <Button
                onClick={() => setShowCalendarId(false)}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Iframe */}
      {iframeCalendarId && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg shadow-lg relative">
            <h2 className="text-lg font-semibold mb-4">Incorpore este calendário</h2>
            <p className="text-sm text-gray-600 mb-2">Copie e cole o código abaixo no seu site:</p>
            <textarea
              readOnly
              className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono resize-none"
              value={`<iframe src="https://merlindesk.com/booking/embed/${iframeCalendarId}" width="100%" height="700" frameborder="0" style="border:none;"></iframe>`}
              rows={4}
              onFocus={(e) => e.target.select()}
            />
            <div className="mt-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<iframe src="https://merlindesk.com/booking/embed/${iframeCalendarId}" width="100%" height="700" frameborder="0" style="border:none;"></iframe>`
                  );
                  toast.success('Código copiado!');
                }}
                className="w-full sm:w-auto"
              >
                Copiar código
              </Button>
              <Button
                onClick={() => setIframeCalendarId(null)}
                className="w-full sm:w-auto"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CalendarsPage;