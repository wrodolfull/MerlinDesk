import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Specialty } from '../../types';
import toast, { Toaster } from 'react-hot-toast';
import ReactSelect from 'react-select';
import { usePlanLimits } from '../../hooks/usePlanLimits';

interface CreateProfessionalFormData {
  name: string;
  email: string;
  phone?: string;
  specialtyIds: string[];
  bio?: string;
}

interface CreateProfessionalModalProps {
  calendarId: string;
  specialties: Specialty[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProfessionalModal: React.FC<CreateProfessionalModalProps> = ({
  calendarId,
  specialties,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { limits, loading } = usePlanLimits();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateProfessionalFormData>();

  const onSubmit = async (data: CreateProfessionalFormData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!calendarId) throw new Error('Calendar ID is required');
      if (!data.specialtyIds?.length) throw new Error('At least one specialty is required');
      if (!limits) throw new Error('Não foi possível carregar os limites do plano.');

      const professionalLimit = limits.professionals;

      const { count: currentProfessionals, error: countError } = await supabase
        .from('professionals')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      if (currentProfessionals === null) {
        throw new Error('Não foi possível obter a quantidade de profissionais existentes.');
      }

      if (professionalLimit !== -1 && currentProfessionals >= professionalLimit) {
        toast.error('Você atingiu o limite de profissionais do seu plano.');
        return;
      }

      const { data: professional, error: insertError } = await supabase
        .from('professionals')
        .insert({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          calendar_id: calendarId,
          bio: data.bio || null,
          user_id: user.id,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      const specialtyRows = data.specialtyIds.map((specialtyId) => ({
        professional_id: professional.id,
        specialty_id: specialtyId,
      }));

      const { error: relationError } = await supabase
        .from('professional_specialties')
        .insert(specialtyRows);

      if (relationError) throw relationError;

      toast.success('Professional added successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create professional');
      console.error('Error creating professional:', error);
    }
  };

  const specialtyOptions = specialties.map((s) => ({
    value: s.id,
    label: s.name || 'Unnamed Specialty',
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar profissional</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
              disabled={isSubmitting || loading}
            />

            <Input
              type="email"
              label="E-mail"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              disabled={isSubmitting || loading}
            />

            <Input
              label="Telefone"
              {...register('phone', {
                pattern: {
                  value: /^[0-9\-\+\(\)\s]+$/,
                  message: 'Invalid phone number',
                },
              })}
              error={errors.phone?.message}
              disabled={isSubmitting || loading}
            />

            <Controller
              name="specialtyIds"
              control={control}
              rules={{ required: 'At least one specialty is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Especialidades
                  </label>
                  <ReactSelect
                    isMulti
                    options={specialtyOptions}
                    value={specialtyOptions.filter((opt) =>
                      field.value?.includes(opt.value)
                    )}
                    onChange={(selected) => {
                      const values = Array.isArray(selected)
                        ? selected.map((opt) => opt.value)
                        : [];
                      field.onChange(values);
                    }}
                    isDisabled={isSubmitting || loading}
                    classNamePrefix="react-select"
                  />
                  {errors.specialtyIds && (
                    <p className="text-sm text-red-600 mt-1">{errors.specialtyIds.message}</p>
                  )}
                </div>
              )}
            />

            <Input
              label="Bio"
              {...register('bio')}
              disabled={isSubmitting || loading}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || loading}
              >
                Adicionar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfessionalModal;
