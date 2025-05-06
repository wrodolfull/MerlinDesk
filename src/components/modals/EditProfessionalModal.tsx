import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Professional, Specialty } from '../../types';

interface EditProfessionalFormData {
  name: string;
  email: string;
  phone?: string;
  specialtyId: string;
  bio?: string;
  avatar?: string;
}

interface EditProfessionalModalProps {
  professional: Professional;
  specialties: Specialty[];
  onClose: () => void;
  onSuccess: () => void;
  refetch?: () => void;
}

const EditProfessionalModal = ({
  professional,
  specialties = [],
  onClose,
  onSuccess,
  refetch,
}: EditProfessionalModalProps) => {
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
      phone: professional.phone,
      specialtyId: professional.specialtyId ? String(professional.specialtyId) : '',
      bio: professional.bio,
      avatar: professional.avatar,
    },
  });

  // ✅ Sempre que mudar o professional, resetar os campos
  useEffect(() => {
    reset({
      name: professional.name,
      email: professional.email,
      phone: professional.phone,
      specialtyId: professional.specialty_id ? String(professional.specialty_id) : '',
      bio: professional.bio,
      avatar: professional.avatar,
    });
  }, [professional, reset]);

  const onSubmit = async (data: EditProfessionalFormData) => {
    try {
      const { error } = await supabase
        .from('professionals')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone,
          specialty_id: data.specialtyId && data.specialtyId !== '' ? data.specialtyId : null,
          bio: data.bio,
          avatar: data.avatar,
        })
        .eq('id', professional.id);

      if (error) throw error;

      onSuccess();
      if (typeof refetch === 'function') {
        await refetch();
      }
      onClose();
    } catch (error) {
      console.error('Error updating professional:', error);
      alert('Failed to update professional');
    }
  };

  const specialtyOptions = specialties.length > 0
    ? specialties.map(specialty => ({
        value: String(specialty.id),
        label: specialty.name || 'Unnamed Specialty',
      }))
    : [{ value: '', label: 'No specialties available' }];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
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
            />
            <Input
              label="Phone"
              {...register('phone')}
            />

            <Controller
              name="specialtyId"
              control={control}
              rules={{ required: specialties.length > 0 ? 'Specialty is required' : false }}
              render={({ field }) => (
                <Select
                  label="Specialty"
                  options={specialtyOptions}
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.specialtyId?.message}
                />
              )}
            />

            <Input
              label="Avatar URL"
              {...register('avatar')}
            />
            <Input
              label="Bio"
              {...register('bio')}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
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
