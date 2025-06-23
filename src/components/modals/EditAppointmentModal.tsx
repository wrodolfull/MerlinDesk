import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import TagInput from '../ui/TagInput';
import { useProfessionals } from '../../hooks/useProfessionals';
import { useSpecialties } from '../../hooks/useSpecialties';
import { useClients } from '../../hooks/useClients';
import { addMinutes, format, parseISO } from 'date-fns';
import { Appointment, Client, Professional, Specialty } from '../../types';
import toast, { Toaster } from 'react-hot-toast';
import { Video, ExternalLink } from 'lucide-react';
import { getApiBaseUrl } from '../../lib/utils';
import { sendAppointmentConfirmation as sendEmailConfirmation } from '../../lib/emailService';
import { checkTimeConflict, formatConflictDetails } from '/root/MerlinDesk/src/lib/appointmentValidation.ts';

interface EditAppointmentFormData {
  clientId: string;
  professionalId: string;
  specialtyId: string;
  startTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
  guests: string[];
}

interface EditAppointmentModalProps {
  appointment: Appointment;
  onClose: () => void;
  onSuccess: () => void;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
  onClose,
  onSuccess,
}) => {
  const { professionals } = useProfessionals();
  const { specialties } = useSpecialties();
  const { clients } = useClients();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    appointment.specialtyId
  );
  const [loading, setLoading] = useState(false);

  const formatStartTime = (dateInput: string | Date) => {
    try {
      const date = typeof dateInput === 'string' ? parseISO(dateInput) : dateInput;
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch {
      return format(new Date(), "yyyy-MM-dd'T'HH:mm");
    }
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditAppointmentFormData>();
  
  useEffect(() => {
    const clientsLoaded = clients.length > 0;
    const specialtiesLoaded = specialties.length > 0;
    const professionalsLoaded = professionals.length > 0;
  
    if (clientsLoaded && specialtiesLoaded && professionalsLoaded && appointment) {
      reset({
        clientId: appointment.clientId,
        professionalId: appointment.professionalId,
        specialtyId: appointment.specialtyId,
        startTime: formatStartTime(appointment.startTime),
        notes: appointment.notes || '',
        status: appointment.status,
        guests: Array.isArray(appointment.guests) ? appointment.guests : [],
      });
      setSelectedSpecialty(appointment.specialtyId);
    }
  }, [clients, specialties, professionals, appointment, reset]);
  
  const watchSpecialtyId = watch('specialtyId');

  useEffect(() => {
    if (watchSpecialtyId !== undefined && watchSpecialtyId !== selectedSpecialty) {
      setSelectedSpecialty(watchSpecialtyId);
      // Removida a verificação que limpa o profissional selecionado
    }
  }, [watchSpecialtyId, selectedSpecialty]);

  // Não filtrar mais os profissionais - mostrar todos
  // const filteredProfessionals = professionals;

  const onSubmit = async (data: EditAppointmentFormData) => {
    try {
      setLoading(true);

      const specialty = specialties.find((s) => s.id === data.specialtyId);
      if (!specialty) throw new Error('Specialty not found');

      const startTime = new Date(data.startTime);
      const endTime = addMinutes(startTime, specialty.duration);

      const professional = professionals.find((p) => p.id === data.professionalId);
      if (!professional) throw new Error('Professional not found');

      // Verificar conflitos de horário (excluindo o próprio agendamento)
      const conflictCheck = await checkTimeConflict(data.professionalId, startTime, endTime, appointment.id);
      
      if (conflictCheck.hasConflict) {
        const conflictingAppointments = conflictCheck.conflictingAppointments || [];
        const conflictDetails = formatConflictDetails(conflictingAppointments);
        
        toast.error(
          `Horário indisponível! O profissional já possui agendamentos neste horário:\n${conflictDetails}`,
          { duration: 6000 }
        );
        return;
      }

      // Buscar dados do cliente para o email
      const client = clients.find((c) => c.id === data.clientId);
      if (!client) throw new Error('Client not found');

      // Buscar dados do dono do calendário
      const { data: calendarData, error: calendarError } = await supabase
        .from('calendars')
        .select('owner_id')
        .eq('id', professional.calendarId)
        .single();

      if (calendarError) throw calendarError;
      const calendarOwnerId = calendarData.owner_id;

      const { error } = await supabase
        .from('appointments')
        .update({
          client_id: data.clientId,
          professional_id: data.professionalId,
          specialty_id: data.specialtyId,
          calendar_id: professional.calendarId,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: data.status,
          notes: data.notes,
          guests: data.guests,
        })
        .eq('id', appointment.id);

      if (error) throw error;

      // Sincronizar com Google Calendar se houver integração
      let videoConferenceLink: string | undefined;
      
      const { data: integration } = await supabase
        .from('user_integrations')
        .select('status')
        .eq('user_id', calendarOwnerId)
        .eq('integration_type', 'google_calendar')
        .eq('status', 'active')
        .single();

      if (integration) {
        try {
          // Se já existe um google_event_id, atualizar o evento
          if (appointment.google_event_id) {
            console.log('🔄 Atualizando evento existente no Google Calendar:', appointment.google_event_id);
            
            const response = await fetch(`${getApiBaseUrl()}/google/calendar/update-event`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appointmentId: appointment.id,
                userId: calendarOwnerId,
                googleEventId: appointment.google_event_id
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Evento atualizado no Google Calendar');
              videoConferenceLink = result.videoConferenceLink;
            } else {
              console.warn('⚠️ Erro ao atualizar evento no Google Calendar');
            }
          } else {
            // Se não existe, criar novo evento
            console.log('🆕 Criando novo evento no Google Calendar');
            
            const response = await fetch(`${getApiBaseUrl()}/google/calendar/create-event`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                appointmentId: appointment.id,
                userId: calendarOwnerId
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log('✅ Novo evento criado no Google Calendar:', result.eventId);
              videoConferenceLink = result.videoConferenceLink;
            } else {
              console.warn('⚠️ Erro ao criar evento no Google Calendar');
            }
          }
        } catch (err) {
          console.warn('Falha ao sincronizar com Google Calendar:', err);
        }
      }

      // Verificar se houve mudanças significativas
      const hasSignificantChanges = 
        data.startTime !== formatStartTime(appointment.startTime) ||
        data.notes !== (appointment.notes || '') ||
        data.status !== appointment.status ||
        JSON.stringify(data.guests || []) !== JSON.stringify(appointment.guests || []);

      console.log('🔍 Verificando mudanças significativas:', {
        hasChanges: hasSignificantChanges,
        oldStartTime: formatStartTime(appointment.startTime),
        newStartTime: data.startTime,
        oldNotes: appointment.notes || '',
        newNotes: data.notes,
        oldStatus: appointment.status,
        newStatus: data.status,
        oldGuests: appointment.guests || [],
        newGuests: data.guests || [],
      });

      // Enviar email de atualização apenas se houver mudanças significativas
      if (hasSignificantChanges) {
        try {
          console.log('📧 Iniciando envio de email de atualização...');
          console.log('📧 Dados do email:', {
            clientEmail: client.email,
            clientName: client.name,
            professionalName: professional.name,
            specialtyName: specialty.name,
            startTime: startTime,
            duration: specialty.duration,
            notes: data.notes,
            guests: data.guests || [],
            videoConferenceLink,
          });

          const emailResult = await sendEmailConfirmation({
            clientEmail: client.email,
            clientName: client.name,
            professionalName: professional.name,
            specialtyName: specialty.name,
            startTime: startTime,
            duration: specialty.duration,
            notes: data.notes,
            guests: data.guests || [],
            videoConferenceLink,
          });

          if (emailResult) {
            console.log('✅ E-mail de atualização enviado com sucesso');
          } else {
            console.warn('⚠️ Erro ao enviar e-mail de atualização');
          }
        } catch (emailError) {
          console.warn('⚠️ Erro ao enviar e-mail de atualização:', emailError);
        }
      } else {
        console.log('ℹ️ Nenhuma mudança significativa detectada - email não enviado');
      }

      toast.success('Appointment updated successfully');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update appointment');
      console.error('Error updating appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Toaster />
      <Card className="w-full max-w-md max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>Editar agendamento</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Controller
                name="clientId"
                control={control}
                defaultValue={appointment.clientId}
                rules={{ required: 'Client is required' }}
                render={({ field }) => (
                  <Select
                    label="Cliente"
                    options={clients.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.email}${c.phone ? `, 📱 ${c.phone}` : ''})`,
                    }))}
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement> | string) => {
                      const selected = typeof e === 'string' ? e : e.target.value;
                      field.onChange(selected);
                    }}
                    name={field.name}
                    ref={field.ref}
                    error={errors.clientId?.message}
                    disabled={loading}
                  />
                )}
              />
 
              <Controller
                name="specialtyId"
                control={control}
                defaultValue={appointment.specialtyId}
                rules={{ required: 'Specialty is required' }}
                render={({ field }) => (
                  <Select
                    label="Serviço"
                    options={specialties.map((s) => ({
                      value: s.id,
                      label: `${s.name} (${s.duration}min${s.price ? ` - $${s.price}` : ''})`,
                    }))}
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement> | string) => {
                      const selected = typeof e === 'string' ? e : e.target.value;
                      field.onChange(selected);
                      setSelectedSpecialty(selected);
                    }}
                    name={field.name}
                    ref={field.ref}
                    error={errors.specialtyId?.message}
                    disabled={loading}
                  />
                )}
              />

              <Controller
                name="professionalId"
                control={control}
                defaultValue={appointment.professionalId}
                rules={{ required: 'Professional is required' }}
                render={({ field }) => (
                  <Select
                    label="Profissional"
                    options={professionals.map((p) => ({
                      value: p.id,
                      label: `${p.name}${p.id === appointment.professionalId ? ' - atual' : ''}`
                    }))}
                    value={field.value}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement> | string) => {
                      const selected = typeof e === 'string' ? e : e.target.value;
                      field.onChange(selected);
                    }}
                    name={field.name}
                    ref={field.ref}
                    error={errors.professionalId?.message}
                    disabled={loading}
                  />
                )}
              />

            <Input
              type="datetime-local"
              label="Data e Hora"
              {...register('startTime', { required: 'Start time is required' })}
              error={errors.startTime?.message}
              disabled={loading}
            />
              <Controller
                name="status"
                control={control}
                defaultValue={appointment.status}
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement> | string) => {
                      const selected = typeof e === 'string' ? e : e.target.value;
                      field.onChange(selected);
                    }}
                    name={field.name}
                    ref={field.ref}
                    error={errors.status?.message}
                    disabled={loading}
                  />
                )}
              />

            <Input
              label="Observação"
              {...register('notes')}
              error={errors.notes?.message}
              disabled={loading}
            />

            <Controller
              name="guests"
              control={control}
              defaultValue={appointment.guests || []}
              render={({ field }) => (
                <TagInput
                  label="Convidados"
                  value={field.value}
                  onChange={(value: string[]) => field.onChange(value)}
                  name={field.name}
                  ref={field.ref}
                  error={errors.guests?.message}
                  disabled={loading}
                />
              )}
            />

            {/* ✅ SEÇÃO DA VIDEOCONFERÊNCIA */}
            {appointment.video_conference_link && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Link da Videoconferência
                </label>
                <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <Video size={16} className="text-blue-600" />
                  <span className="text-sm text-blue-800 flex-1 truncate">
                    {appointment.video_conference_link}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(appointment.video_conference_link, '_blank')}
                    className="text-blue-600 border-blue-600 hover:bg-blue-50"
                  >
                    <ExternalLink size={14} />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || loading}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSubmitting || loading} disabled={loading}>
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAppointmentModal;
