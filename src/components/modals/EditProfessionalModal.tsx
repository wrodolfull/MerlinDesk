import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Professional, Specialty } from '../../types';
import toast, { Toaster } from 'react-hot-toast';
import ReactSelect from 'react-select';

interface EditProfessionalFormData {
  name: string;
  email: string;
  phone?: string;
  specialtyIds: string[];
  bio?: string;
  avatar?: string;
}

interface EditProfessionalModalProps {
  professional: Professional;
  specialties: Specialty[];
  onClose: () => void;
  onSuccess: () => void;
  refetch?: () => Promise<void>;
}

const EditProfessionalModal: React.FC<EditProfessionalModalProps> = ({
  professional,
  specialties = [],
  onClose,
  onSuccess,
  refetch,
}) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProfessionalFormData>({
    defaultValues: {
      name: professional.name,
      email: professional.email,
      phone: professional.phone || '',
      specialtyIds: (professional.specialties ?? []).map((s) => s.id),
      bio: professional.bio || '',
      avatar: professional.avatar || '',
    }
  });

  useEffect(() => {
    reset({
      name: professional.name,
      email: professional.email,
      phone: professional.phone || '',
      specialtyIds: (professional.specialties ?? []).map((s) => s.id),
      bio: professional.bio || '',
      avatar: professional.avatar || '',
    });
  }, [professional, reset]);

  const onSubmit = async (data: EditProfessionalFormData) => {
    try {
      // Atualizar profissional
      const { error: updateError } = await supabase
        .from('professionals')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          bio: data.bio || null,
          avatar: data.avatar || null,
        })
        .eq('id', professional.id);

      if (updateError) throw updateError;

      // Atualizar especialidades: remove todas e recria
      await supabase
        .from('professional_specialties')
        .delete()
        .eq('professional_id', professional.id);

      const newRows = data.specialtyIds.map((sid) => ({
        professional_id: professional.id,
        specialty_id: sid,
      }));

      const { error: insertError } = await supabase
        .from('professional_specialties')
        .insert(newRows);

      if (insertError) throw insertError;

      toast.success('Professional updated successfully');
      onSuccess();
      if (refetch) await refetch();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update professional');
      console.error('Error updating professional:', error);
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
          <CardTitle>Edit Professional</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
              disabled={isSubmitting}
            />

            <Input
              type="email"
              label="Email"
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              disabled={isSubmitting}
            />

            <Input
              label="Phone"
              {...register('phone', {
                pattern: {
                  value: /^[0-9\-\+\(\)\s]+$/,
                  message: 'Invalid phone number',
                },
              })}
              error={errors.phone?.message}
              disabled={isSubmitting}
            />

            <Controller
              name="specialtyIds"
              control={control}
              rules={{ required: 'At least one specialty is required' }}
              render={({ field }) => (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialties</label>
                  <ReactSelect
                    isMulti
                    options={specialtyOptions}
                    value={specialtyOptions.filter(option => field.value.includes(option.value))}
                    onChange={(selected) =>
                      field.onChange(Array.isArray(selected) ? selected.map(opt => opt.value) : [])
                    }
                    isDisabled={isSubmitting}
                  />
                  {errors.specialtyIds && (
                    <p className="mt-1 text-sm text-red-600">{errors.specialtyIds.message}</p>
                  )}
                </div>
              )}
            />

            

            <Input
              label="Bio"
              {...register('bio')}
              disabled={isSubmitting}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditProfessionalModal;