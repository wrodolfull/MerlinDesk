import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { addMinutes } from 'date-fns';
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
    },
  });

  // Monitorar mudanças nos campos
  const watchClientId = watch('clientId');
  const watchSpecialtyId = watch('specialtyId');
  const watchProfessionalId = watch('professionalId');

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

    const appointment = {
      client_id: data.clientId,
      professional_id: data.professionalId,
      specialty_id: data.specialtyId,
      calendar_id: professional.calendar_id,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: data.status,
      notes: data.notes,
      user_id: calendarOwnerId,
    };

    const { data: insertedAppointment, error } = await supabase
      .from('appointments')
      .insert([appointment])
      .select()
      .single();

    if (error) throw error;

    // Sincronizar com Google Calendar
    const { data: integration } = await supabase
      .from('user_integrations')
      .select('status')
      .eq('user_id', calendarOwnerId)
      .eq('integration_type', 'google_calendar')
      .eq('status', 'active')
      .single();

    if (integration && insertedAppointment) {
      try {
        const response = await fetch('https://merlindesk.com/google/calendar/create-event', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: calendarOwnerId,
            event: {
              summary: `Consulta com profissional`,
              description: data.notes || '',
              start: {
                dateTime: insertedAppointment.start_time,
                timeZone: 'America/Sao_Paulo',
              },
              end: {
                dateTime: insertedAppointment.end_time,
                timeZone: 'America/Sao_Paulo',
              },
              attendees: [
                {
                  email: clientsData.find(c => c.id === data.clientId)?.email || '',
                },
              ],
            },
          }),
        });

        const googleResult = await response.json();
        const googleEventId = googleResult.googleEventId;

        if (googleEventId) {
          const { error: updateError } = await supabase
            .from('appointments')
            .update({ google_event_id: googleEventId })
            .eq('id', insertedAppointment.id);

          if (updateError) {
            console.error('Erro ao salvar google_event_id:', updateError);
          }
        }
      } catch (err) {
        console.warn('Falha ao criar eventos no Google Calendar:', err);
      }
    }

    toast.success('Agendamento criado com sucesso');
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
