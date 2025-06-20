import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { addMinutes, addDays, addWeeks, addMonths } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { usePlanLimits } from '../../hooks/usePlanLimits';

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

interface Specialty {
  id: string;
  name: string;
  duration: number;
  price?: number;
}

interface ProfessionalSpecialty {
  specialty_id: string;
  specialties: {
    id: string;
    name: string;
  };
}

interface Professional {
  id: string;
  name: string;
  calendar_id: string;
  professional_specialties: ProfessionalSpecialty[];
}

interface CreateAppointmentFormData {
  clientId: string;
  professionalId: string;
  specialtyId: string;
  startTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  clientPhone?: string;
  isRecurring: boolean;
  recurrenceType?: 'daily' | 'weekly' | 'monthly';
  recurrenceEndDate?: string;
  recurrenceCount?: number;
}

interface CreateAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: Date;
}

const CreateAppointmentModal: React.FC<CreateAppointmentModalProps> = ({ onClose, onSuccess, initialDate }) => {
  const { user } = useAuth();
  const { limits, loading: limitsLoading } = usePlanLimits();
  const [clientsData, setClientsData] = useState<Client[]>([]);
  const [specialtiesData, setSpecialtiesData] = useState<Specialty[]>([]);
  const [professionalsData, setProfessionalsData] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCalendar, setSelectedCalendar] = useState<{ id: string; hasRecurringSubscription: boolean } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateAppointmentFormData>({
    defaultValues: {
      status: 'pending',
      isRecurring: false,
    },
  });

  // Monitorar mudanças nos campos
  const watchClientId = watch('clientId');
  const watchSpecialtyId = watch('specialtyId');
  const watchProfessionalId = watch('professionalId');
  const watchIsRecurring = watch('isRecurring');

  // Atualizar telefone do cliente quando cliente é selecionado
  useEffect(() => {
    if (watchClientId) {
      const selectedClient = clientsData.find((c) => c.id === watchClientId);
      if (selectedClient) {
        setValue('clientPhone', selectedClient.phone || '');
      }
    }
  }, [watchClientId, clientsData, setValue]);

  // Limpeza automática quando há conflito entre serviço e profissional
  useEffect(() => {
    if (watchSpecialtyId && watchProfessionalId) {
      const selectedProfessional = professionalsData.find(p => p.id === watchProfessionalId);
      
      // Verificar se o profissional oferece o serviço selecionado
      const hasSpecialty = selectedProfessional?.professional_specialties?.some(
        ps => ps.specialty_id === watchSpecialtyId
      );
      
      if (selectedProfessional && !hasSpecialty) {
        setValue('professionalId', '');
      }
    }
  }, [watchSpecialtyId, watchProfessionalId, professionalsData, setValue]);

  useEffect(() => {
    if (watchProfessionalId && watchSpecialtyId) {
      const selectedProfessional = professionalsData.find(p => p.id === watchProfessionalId);
      
      // Verificar se o serviço é oferecido pelo profissional
      const hasSpecialty = selectedProfessional?.professional_specialties?.some(
        ps => ps.specialty_id === watchSpecialtyId
      );
      
      if (selectedProfessional && !hasSpecialty) {
        setValue('specialtyId', '');
      }
    }
  }, [watchProfessionalId, watchSpecialtyId, professionalsData, setValue]);

  // Definir data inicial se fornecida
  useEffect(() => {
    if (initialDate) {
      const iso = initialDate.toISOString().slice(0, 16);
      setValue('startTime', iso);
    }
  }, [initialDate, setValue]);

  // Atualizar informações do calendário quando o profissional é selecionado
  useEffect(() => {
    const fetchCalendarInfo = async () => {
      if (watchProfessionalId) {
        const selectedProfessional = professionalsData.find(p => p.id === watchProfessionalId);
        if (selectedProfessional) {
          const { data: calendar, error } = await supabase
            .from('calendars')
            .select('id, has_recurring_subscription')
            .eq('id', selectedProfessional.calendar_id)
            .single();

          if (calendar) {
            setSelectedCalendar(calendar);
            if (!calendar.has_recurring_subscription) {
              setValue('isRecurring', false);
            }
          }
        }
      }
    };

    fetchCalendarInfo();
  }, [watchProfessionalId, professionalsData, setValue]);

  // Carregar dados do banco
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const { data: calendars, error: calendarsError } = await supabase
          .from('calendars')
          .select('id')
          .eq('owner_id', user.id);
        if (calendarsError) throw calendarsError;
        if (!calendars || calendars.length === 0) {
          toast.error('No calendar found. Please create a calendar first.');
          setLoading(false);
          return;
        }

        const calendarIds = calendars.map((c) => c.id);

        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*')
          .eq('owner_id', user.id);
        if (clientsError) throw clientsError;
        setClientsData(clients || []);

        const { data: specialties, error: specialtiesError } = await supabase
          .from('specialties')
          .select('*')
          .in('calendar_id', calendarIds);
        if (specialtiesError) throw specialtiesError;
        setSpecialtiesData(specialties || []);

        // Query modificada para usar professional_specialties
        const { data: professionals, error: professionalsError } = await supabase
          .from('professionals')
          .select(`
            *,
            professional_specialties!inner(
              specialty_id,
              specialties(id, name)
            )
          `)
          .in('calendar_id', calendarIds);
        if (professionalsError) throw professionalsError;
        setProfessionalsData(professionals || []);
      } catch (err: any) {
        toast.error(err.message || 'Failed to load data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

const onSubmit = async (data: CreateAppointmentFormData) => {
  try {
    if (!user) throw new Error('User not authenticated');

    const professional = professionalsData.find(p => p.id === data.professionalId);
    if (!professional) throw new Error('Professional not found');

    const specialty = specialtiesData.find(s => s.id === data.specialtyId);
    if (!specialty) throw new Error('Specialty not found');

    const { data: calendarData, error: calendarError } = await supabase
      .from('calendars')
      .select('owner_id')
      .eq('id', professional.calendar_id)
      .single();

    if (calendarError) throw calendarError;
    const calendarOwnerId = calendarData.owner_id;

    if (data.clientPhone) {
      const { error: updateError } = await supabase
        .from('clients')
        .update({ phone: data.clientPhone })
        .eq('id', data.clientId);
      if (updateError) throw updateError;
    }

    const startTime = new Date(data.startTime);
    const endTime = addMinutes(startTime, specialty.duration);

    // Criar agendamentos recorrentes
    const appointments = [];
    let currentStartTime = startTime;
    let currentEndTime = endTime;
    let count = 1;

    while (true) {
      appointments.push({
        client_id: data.clientId,
        professional_id: data.professionalId,
        specialty_id: data.specialtyId,
        calendar_id: professional.calendar_id,
        start_time: currentStartTime.toISOString(),
        end_time: currentEndTime.toISOString(),
        status: data.status,
        notes: data.notes,
        user_id: calendarOwnerId,
      });

      if (!data.isRecurring) break;

      // Calcular próxima data baseado no tipo de recorrência
      switch (data.recurrenceType) {
        case 'daily':
          currentStartTime = addDays(currentStartTime, 1);
          currentEndTime = addDays(currentEndTime, 1);
          break;
        case 'weekly':
          currentStartTime = addWeeks(currentStartTime, 1);
          currentEndTime = addWeeks(currentEndTime, 1);
          break;
        case 'monthly':
          currentStartTime = addMonths(currentStartTime, 1);
          currentEndTime = addMonths(currentEndTime, 1);
          break;
        default:
          break;
      }

      // Verificar condições de parada
      if (data.recurrenceEndDate && new Date(data.recurrenceEndDate) < currentStartTime) break;
      if (data.recurrenceCount && count >= data.recurrenceCount) break;

      count++;
    }

    const { data: insertedAppointments, error } = await supabase
      .from('appointments')
      .insert(appointments)
      .select();

    if (error) throw error;

    // Sincronizar com Google Calendar
    const { data: integration } = await supabase
      .from('user_integrations')
      .select('status')
      .eq('user_id', calendarOwnerId)
      .eq('integration_type', 'google_calendar')
      .eq('status', 'active')
      .single();

    if (integration && insertedAppointments) {
      try {
        for (const appointment of insertedAppointments) {
          const response = await fetch('https://merlindesk.com/google/calendar/create-event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              appointmentId: appointment.id,
              userId: calendarOwnerId
            }),
          });

          const googleResult = await response.json();
          
          if (googleResult.success) {
            console.log('✅ Evento criado no Google Calendar:', googleResult.eventId);
            if (googleResult.videoConferenceLink) {
              console.log('🔗 Link da videoconferência:', googleResult.videoConferenceLink);
            }
          } else {
            console.warn('⚠️ Erro ao criar evento no Google Calendar:', googleResult.error);
          }
        }
      } catch (err) {
        console.warn('Falha ao criar eventos no Google Calendar:', err);
      }
    }

    toast.success('Agendamento(s) criado(s) com sucesso');
    reset();
    onSuccess();
    onClose();
  } catch (err: any) {
    toast.error(err.message || 'Erro ao criar agendamento');
    console.error('Erro ao criar agendamento:', err);
  }
};

  // Filtragem bidirecional usando professional_specialties
  const filteredProfessionals = professionalsData.filter((professional) => {
    if (!watchSpecialtyId) return true;
    return professional.professional_specialties?.some(
      ps => ps.specialty_id === watchSpecialtyId
    );
  });

  const filteredSpecialties = specialtiesData.filter((specialty) => {
    if (!watchProfessionalId) return true;
    const selectedProfessional = professionalsData.find(p => p.id === watchProfessionalId);
    return selectedProfessional?.professional_specialties?.some(
      ps => ps.specialty_id === specialty.id
    ) || false;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Novo agendamento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="clientId"
              control={control}
              rules={{ required: 'Client is required' }}
              render={({ field }) => (
                <Select
                  label="Cliente"
                  options={clientsData.map((client) => ({
                    value: client.id,
                    label: `${client.name} (${client.email}${client.phone ? `, 📱 ${client.phone}` : ''})`,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.clientId?.message}
                  disabled={loading || limitsLoading}
                />
              )}
            />

            <Input
              type="text"
              label="Número WhatsApp"
              {...register('clientPhone')}
              placeholder="e.g. +5511999999999"
              disabled={loading || limitsLoading}
            />

            <Controller
              name="specialtyId"
              control={control}
              rules={{ required: 'Specialty is required' }}
              render={({ field }) => (
                <Select
                  label="Especialidade"
                  options={filteredSpecialties.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.duration}min${s.price ? ` - $${s.price}` : ''})`,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.specialtyId?.message}
                  disabled={loading || limitsLoading}
                />
              )}
            />

            <Controller
              name="professionalId"
              control={control}
              rules={{ required: 'Professional is required' }}
              render={({ field }) => (
                <Select
                  label="Profissional"
                  options={filteredProfessionals.map((p) => ({
                    value: p.id,
                    label: p.name,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.professionalId?.message}
                  disabled={loading || limitsLoading}
                />
              )}
            />

            <Input
              type="datetime-local"
              label="Data e Hora"
              {...register('startTime', { required: 'Start time is required' })}
              error={errors.startTime?.message}
              disabled={loading || limitsLoading}
            />

            {selectedCalendar?.hasRecurringSubscription && (
              <div className="space-y-4 border-t pt-4">
                <Controller
                  name="isRecurring"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                        Agendamento Recorrente
                      </label>
                    </div>
                  )}
                />

                {watchIsRecurring && (
                  <>
                    <Controller
                      name="recurrenceType"
                      control={control}
                      rules={{ required: watchIsRecurring ? 'Recurrence type is required' : false }}
                      render={({ field }) => (
                        <Select
                          label="Tipo de Recorrência"
                          options={[
                            { value: 'daily', label: 'Diário' },
                            { value: 'weekly', label: 'Semanal' },
                            { value: 'monthly', label: 'Mensal' },
                          ]}
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.recurrenceType?.message}
                          disabled={loading || limitsLoading}
                        />
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="date"
                        label="Data Final"
                        {...register('recurrenceEndDate')}
                        error={errors.recurrenceEndDate?.message}
                        disabled={loading || limitsLoading}
                      />

                      <Input
                        type="number"
                        label="Número de Ocorrências"
                        {...register('recurrenceCount', { min: 1 })}
                        error={errors.recurrenceCount?.message}
                        disabled={loading || limitsLoading}
                      />
                    </div>
                  </>
                )}
              </div>
            )}

            <Controller
              name="status"
              control={control}
              defaultValue="pending"
              render={({ field }) => (
                <Select
                  label="Status"
                  options={[
                    { value: 'pending', label: 'Pending' },
                    { value: 'confirmed', label: 'Confirmed' },
                    { value: 'completed', label: 'Completed' },
                    { value: 'canceled', label: 'Canceled' },
                  ]}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={loading || limitsLoading}
                />
              )}
            />

            <Input
              label="Observação"
              {...register('notes')}
              error={errors.notes?.message}
              disabled={loading || limitsLoading}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || loading || limitsLoading}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSubmitting || loading || limitsLoading} disabled={loading || limitsLoading}>
                Criar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateAppointmentModal;
