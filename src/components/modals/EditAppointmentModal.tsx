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

const EditAppointmentModal = ({
  appointment,
  onClose,
  onSuccess,
}: EditAppointmentModalProps) => {
  const { professionals } = useProfessionals();
  const { specialties } = useSpecialties();
  const { clients } = useClients();
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(appointment.specialtyId);

  const formatStartTime = (dateString: string) => {
    try {
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
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
  } = useForm<EditAppointmentFormData>({
    defaultValues: {
      clientId: appointment.clientId,
      professionalId: appointment.professionalId,
      specialtyId: appointment.specialtyId,
      startTime: formatStartTime(appointment.start_time),
      notes: appointment.notes || '',
      status: appointment.status,
    },
  });

  // Atualiza os campos quando o modal abre com novo appointment
  useEffect(() => {
    reset({
      clientId: appointment.clientId || appointment.client_id,
      professionalId: appointment.professionalId || appointment.professional_id,
      specialtyId: appointment.specialtyId || appointment.specialty_id,
      startTime: formatStartTime(appointment.start_time),
      notes: appointment.notes || '',
      status: appointment.status,
    });
    setSelectedSpecialty(appointment.specialtyId || appointment.specialty_id);
  }, [appointment, reset]);

  const watchSpecialtyId = watch('specialtyId');

  useEffect(() => {
    if (watchSpecialtyId !== undefined) {
      setSelectedSpecialty(watchSpecialtyId);
    }
  }, [watchSpecialtyId]);

  const filteredProfessionals = selectedSpecialty
    ? professionals.filter((p) => p.specialty_id === selectedSpecialty)
    : professionals;

  const onSubmit = async (data: EditAppointmentFormData) => {
    try {
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
          calendar_id: professional.calendar_id,
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          status: data.status,
          notes: data.notes,
        })
        .eq('id', appointment.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Appointment</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              name="clientId"
              control={control}
              rules={{ required: 'Client is required' }}
              render={({ field }) => (
                <Select
                  label="Client"
                  options={clients.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.email})`,
                  }))}
                  value={field.value}
                  onChange={(val) => {
                    const value = typeof val === 'string' ? val : val.target.value;
                    setValue('clientId', value);
                  }}
                  error={errors.clientId?.message}
                />
              )}
            />
            <Controller
              name="specialtyId"
              control={control}
              rules={{ required: 'Specialty is required' }}
              render={({ field }) => (
                <Select
                  label="Service"
                  options={specialties.map((s) => ({
                    value: s.id,
                    label: `${s.name} (${s.duration}min${s.price ? ` - $${s.price}` : ''})`,
                  }))}
                  value={field.value}
                  onChange={(val) => {
                    const value = typeof val === 'string' ? val : val.target.value;
                    setValue('specialtyId', value);
                  }}
                  error={errors.specialtyId?.message}
                />
              )}
            />
            <Controller
              name="professionalId"
              control={control}
              rules={{ required: 'Professional is required' }}
              render={({ field }) => (
                <Select
                  label="Professional"
                  options={filteredProfessionals.map((p) => ({
                    value: p.id,
                    label: `${p.name} (${p.specialty?.name || 'No specialty'})`,
                  }))}
                  value={field.value}
                  onChange={(val) => {
                    const value = typeof val === 'string' ? val : val.target.value;
                    setValue('professionalId', value);
                  }}
                  error={errors.professionalId?.message}
                />
              )}
            />
            <Input
              type="datetime-local"
              label="Start Time"
              {...register('startTime', { required: 'Start time is required' })}
              error={errors.startTime?.message}
            />
            <Controller
              name="status"
              control={control}
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
                  onChange={(val) => {
                    const value = typeof val === 'string' ? val : val.target.value;
                    setValue('status', value as EditAppointmentFormData['status']);
                  }}
                />
              )}
            />
            <Input label="Notes" {...register('notes')} error={errors.notes?.message} />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAppointmentModal;
