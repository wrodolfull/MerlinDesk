import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Specialty } from '../../types';

interface EditSpecialtyFormData {
  name: string;
  duration: number;
  price?: number;
  description?: string;
}

interface EditSpecialtyModalProps {
  specialty: Specialty;
  onClose: () => void;
  onSuccess: () => void;
}

const EditSpecialtyModal = ({ specialty, onClose, onSuccess }: EditSpecialtyModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditSpecialtyFormData>({
    defaultValues: {
      name: specialty.name,
      duration: specialty.duration,
      price: specialty.price,
      description: specialty.description,
    },
  });

  const onSubmit = async (data: EditSpecialtyFormData) => {
    try {
      const { error } = await supabase
        .from('specialties')
        .update({
          name: data.name,
          duration: data.duration,
          price: data.price,
          description: data.description,
        })
        .eq('id', specialty.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating specialty:', error);
      alert('Failed to update specialty');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Specialty</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Specialty Name"
              error={errors.name?.message}
              {...register('name', { required: 'Specialty name is required' })}
            />
            
            <Input
              type="number"
              label="Duration (minutes)"
              error={errors.duration?.message}
              {...register('duration', {
                required: 'Duration is required',
                min: { value: 5, message: 'Duration must be at least 5 minutes' },
              })}
            />
            
            <Input
              type="number"
              label="Price"
              step="0.01"
              {...register('price', {
                min: { value: 0, message: 'Price cannot be negative' },
              })}
            />
            
            <Input
              label="Description"
              {...register('description')}
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

export default EditSpecialtyModal;