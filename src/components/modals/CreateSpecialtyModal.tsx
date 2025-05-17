import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface CreateSpecialtyFormData {
  name: string;
  duration: number;
  price?: number;
  description?: string;
}

interface CreateSpecialtyModalProps {
  calendarId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateSpecialtyModal: React.FC<CreateSpecialtyModalProps> = ({
  calendarId,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateSpecialtyFormData>();

  const onSubmit = async (data: CreateSpecialtyFormData) => {
    try {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase.from('specialties').insert({
        name: data.name,
        calendar_id: calendarId,
        duration: data.duration,
        price: data.price,
        description: data.description,
        user_id: user.id,
      });

      if (error) throw error;

      toast.success('Specialty added successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create specialty');
      console.error('Error creating specialty:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add New Specialty</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Specialty Name"
              error={errors.name?.message}
              {...register('name', { required: 'Specialty name is required' })}
              disabled={isSubmitting}
            />
            
            <Input
              type="number"
              label="Duration (minutes)"
              error={errors.duration?.message}
              {...register('duration', {
                required: 'Duration is required',
                min: { value: 5, message: 'Duration must be at least 5 minutes' },
              })}
              disabled={isSubmitting}
            />
            
            <Input
              type="number"
              label="Price"
              step="0.01"
              error={errors.price?.message}
              {...register('price', {
                min: { value: 0, message: 'Price cannot be negative' },
              })}
              disabled={isSubmitting}
            />
            
            <Input
              label="Description"
              {...register('description')}
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
                Add Specialty
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSpecialtyModal;
