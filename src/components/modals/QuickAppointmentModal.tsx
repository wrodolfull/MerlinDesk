import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import TagInput from '../ui/TagInput';
import { useAuth } from '../../contexts/AuthContext';
import { addMinutes, addDays, addWeeks, addMonths } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { usePlanLimits } from '../../hooks/usePlanLimits';
import { sendAppointmentConfirmation, formatPhoneForWhatsApp } from '../../lib/whatsapp';
import { sendAppointmentConfirmation as sendEmailConfirmation } from '../../lib/emailService';
import { getApiBaseUrl } from '../../lib/utils';
import { checkTimeConflict, formatConflictDetails } from '/root/MerlinDesk/src/lib/appointmentValidation.ts';

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

interface QuickAppointmentFormData {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  professionalId: string;
  specialtyId: string;
  startTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  guests?: string[];
}

interface QuickAppointmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  initialDate?: Date;
}

const QuickAppointmentModal: React.FC<QuickAppointmentModalProps> = ({ onClose, onSuccess, initialDate }) => {
  const { user } = useAuth();
  const { limits, loading: limitsLoading } = usePlanLimits();
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
  } = useForm<QuickAppointmentFormData>({
    defaultValues: {
      status: 'pending',
      startTime: initialDate ? initialDate.toISOString().slice(0, 16) : '',
    },
  });

  // Monitorar mudanças nos campos
  const watchSpecialtyId = watch('specialtyId');
  const watchProfessionalId = watch('professionalId');

  // Carregar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Buscar especialidades
        const { data: specialties, error: specialtiesError } = await supabase
          .from('specialties')
          .select('*')
          .eq('user_id', user?.id);

        if (specialtiesError) throw specialtiesError;
        setSpecialtiesData(specialties || []);

        // Buscar profissionais
        const { data: professionals, error: professionalsError } = await supabase
          .from('professionals')
          .select(`
            id,
            name,
            calendar_id,
            professional_specialties (
              specialty_id,
              specialties (
                id,
                name
              )
            )
          `)
          .eq('user_id', user?.id);

        if (professionalsError) throw professionalsError;
        setProfessionalsData(professionals || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const onSubmit = async (data: QuickAppointmentFormData) => {
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

      // Criar cliente temporário ou buscar cliente existente
      let clientId: string;
      
      // Verificar se já existe um cliente com este email
      const { data: existingClient } = await supabase
        .from('clients')
        .select('id')
        .eq('email', data.clientEmail)
        .eq('owner_id', calendarOwnerId)
        .single();

      if (existingClient) {
        clientId = existingClient.id;
        // Atualizar informações do cliente se necessário
        await supabase
          .from('clients')
          .update({ 
            name: data.clientName,
            phone: data.clientPhone 
          })
          .eq('id', clientId);
      } else {
        // Criar novo cliente
        const { data: newClient, error: clientError } = await supabase
          .from('clients')
          .insert({
            name: data.clientName,
            email: data.clientEmail,
            phone: data.clientPhone,
            owner_id: calendarOwnerId,
          })
          .select()
          .single();

        if (clientError) throw clientError;
        clientId = newClient.id;
      }

      const startTime = new Date(data.startTime);
      const endTime = addMinutes(startTime, specialty.duration);

      // Verificar conflitos de horário
      const conflictCheck = await checkTimeConflict(data.professionalId, startTime, endTime);
      
      if (conflictCheck.hasConflict) {
        const conflictingAppointments = conflictCheck.conflictingAppointments || [];
        const conflictDetails = formatConflictDetails(conflictingAppointments);
        
        toast.error(
          `Horário indisponível! O profissional já possui agendamentos neste horário:\n${conflictDetails}`,
          { duration: 6000 }
        );
        return;
      }

      // Criar agendamento
      const appointment = {
        client_id: clientId,
        professional_id: data.professionalId,
        specialty_id: data.specialtyId,
        calendar_id: professional.calendar_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: data.status,
        notes: data.notes,
        user_id: calendarOwnerId,
        guests: data.guests || [],
      };

      const { data: insertedAppointments, error } = await supabase
        .from('appointments')
        .insert(appointment)
        .select();

      if (error) throw error;

      // Enviar notificação WhatsApp se configurado
      if (data.clientPhone) {
        try {
          const notification = {
            clientName: data.clientName,
            clientPhone: formatPhoneForWhatsApp(data.clientPhone),
            professionalName: professional.name,
            specialtyName: specialty.name,
            appointmentDate: startTime.toISOString().split('T')[0],
            appointmentTime: startTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            }),
            duration: specialty.duration,
            notes: data.notes || undefined
          };

          const whatsappResult = await sendAppointmentConfirmation(notification);
          if (whatsappResult.success) {
            toast.success('Notificação WhatsApp enviada!');
          } else {
            console.log('WhatsApp não configurado ou erro:', whatsappResult.error);
          }
        } catch (whatsappError) {
          console.log('Erro ao enviar WhatsApp:', whatsappError);
        }
      }

      // Sincronizar com Google Calendar
      const { data: integration } = await supabase
        .from('user_integrations')
        .select('status')
        .eq('user_id', calendarOwnerId)
        .eq('integration_type', 'google_calendar')
        .eq('status', 'active')
        .single();

      let videoConferenceLink: string | undefined;

      if (integration && insertedAppointments) {
        try {
          for (const appointment of insertedAppointments) {
            const response = await fetch(`${getApiBaseUrl()}/google/calendar/create-event`, {
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
                videoConferenceLink = googleResult.videoConferenceLink;
              }
            } else {
              console.warn('⚠️ Erro ao criar evento no Google Calendar:', googleResult.error);
            }
          }
        } catch (err) {
          console.warn('Falha ao criar eventos no Google Calendar:', err);
        }
      }

      // Enviar email de confirmação
      try {
        const emailResult = await sendEmailConfirmation({
          clientEmail: data.clientEmail,
          clientName: data.clientName,
          professionalName: professional.name,
          specialtyName: specialty.name,
          startTime: startTime,
          duration: specialty.duration,
          notes: data.notes,
          guests: data.guests || [],
          videoConferenceLink,
        });

        if (emailResult) {
          console.log('✅ E-mail de confirmação enviado com sucesso');
        } else {
          console.warn('⚠️ Erro ao enviar e-mail de confirmação');
        }
      } catch (emailError) {
        console.warn('⚠️ Erro ao enviar e-mail de confirmação:', emailError);
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
      <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Agendamento Rápido</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Informações do Cliente */}
            <div className="space-y-4 border-b pb-4">
              <h3 className="text-sm font-medium text-gray-700">Informações do Cliente</h3>
              
              <Input
                type="text"
                label="Nome do Cliente"
                {...register('clientName', { required: 'Nome é obrigatório' })}
                placeholder="Nome completo"
                error={errors.clientName?.message}
                disabled={loading || limitsLoading}
              />

              <Input
                type="email"
                label="Email"
                {...register('clientEmail', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                placeholder="email@exemplo.com"
                error={errors.clientEmail?.message}
                disabled={loading || limitsLoading}
              />

              <Input
                type="tel"
                label="Telefone/WhatsApp"
                {...register('clientPhone')}
                placeholder="+55 (11) 99999-9999"
                disabled={loading || limitsLoading}
              />
            </div>

            {/* Informações do Agendamento */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Detalhes do Agendamento</h3>

              <Controller
                name="specialtyId"
                control={control}
                rules={{ required: 'Especialidade é obrigatória' }}
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
                rules={{ required: 'Profissional é obrigatório' }}
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
                {...register('startTime', { required: 'Data e hora são obrigatórios' })}
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
                      { value: 'pending', label: 'Pendente' },
                      { value: 'confirmed', label: 'Confirmado' },
                      { value: 'completed', label: 'Concluído' },
                      { value: 'canceled', label: 'Cancelado' },
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={loading || limitsLoading}
                  />
                )}
              />

              <Controller
                name="guests"
                control={control}
                defaultValue={[]}
                render={({ field }) => (
                  <TagInput
                    label="Convidados (emails)"
                    value={field.value || []}
                    onChange={(value: string[]) => field.onChange(value)}
                    placeholder="Digite o email e pressione Enter"
                    disabled={loading || limitsLoading}
                  />
                )}
              />

              <Input
                label="Observações"
                {...register('notes')}
                placeholder="Observações adicionais..."
                disabled={loading || limitsLoading}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || loading || limitsLoading}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSubmitting || loading || limitsLoading} disabled={loading || limitsLoading}>
                Criar Agendamento
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickAppointmentModal; 