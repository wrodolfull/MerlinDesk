import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Specialty } from '../../types';

interface CreateProfessionalFormData {
  name: string;
  email: string;
  phone?: string;
  specialtyId: string;
  bio?: string;
}

interface CreateProfessionalModalProps {
  calendarId: string;
  specialties: Specialty[];
  onClose: () => void;
  onSuccess: () => void;
}

const CreateProfessionalModal = ({
  calendarId,
  specialties,
  onClose,
  onSuccess,
}: CreateProfessionalModalProps) => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateProfessionalFormData>();

  const onSubmit = async (data: CreateProfessionalFormData) => {
    try {
      if (!user) throw new Error('User not authenticated');
      if (!calendarId) throw new Error('Calendar ID is required');
      if (!data.specialtyId) throw new Error('Specialty is required');

      const { error } = await supabase.from('professionals').insert({
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        specialty_id: data.specialtyId,
        calendar_id: calendarId,
        bio: data.bio || null,
        user_id: user.id,
      });

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating professional:', error);
      alert('Failed to create professional');
    }
  };

  const specialtyOptions = specialties.map((s) => ({
    value: s.id,
    label: s.name || 'Unnamed Specialty',
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add New Professional</CardTitle>
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

            <Input label="Phone" {...register('phone')} />

            <Controller
              name="specialtyId"
              control={control}
              rules={{ required: 'Specialty is required' }}
              render={({ field }) => (
                <Select
                  label="Specialty"
                  options={specialtyOptions}
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  error={errors.specialtyId?.message}
                />
              )}
            />

            <Input label="Bio" {...register('bio')} />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
                Add Professional
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateProfessionalModal;
