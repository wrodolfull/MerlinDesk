import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';
import { useProfessionals } from '../../hooks/useProfessionals';
import { useSpecialties } from '../../hooks/useSpecialties';
import { useClients } from '../../hooks/useClients';
import { addMinutes, format, parseISO } from 'date-fns';
import { Appointment } from '../../types';
import toast, { Toaster } from 'react-hot-toast';
import { Video, ExternalLink } from 'lucide-react';

interface EditAppointmentFormData {
  clientId: string;
  professionalId: string;
  specialtyId: string;
  startTime: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'completed' | 'canceled';
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
        })
        .eq('id', appointment.id);

      if (error) throw error;

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
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Editar agendamento</CardTitle>
        </CardHeader>
        <CardContent>
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
                    onChange={(e) => {
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
                    onChange={(e) => {
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
                    onChange={(e) => {
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
                    onChange={(e) => {
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
