import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Specialty } from '../../types';
import toast, { Toaster } from 'react-hot-toast';

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

const EditSpecialtyModal: React.FC<EditSpecialtyModalProps> = ({ specialty, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditSpecialtyFormData>({
    defaultValues: {
      name: specialty.name,
      duration: specialty.duration,
      price: specialty.price,
      description: specialty.description,
    },
  });

  React.useEffect(() => {
    reset({
      name: specialty.name,
      duration: specialty.duration,
      price: specialty.price,
      description: specialty.description,
    });
  }, [specialty, reset]);

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

      toast.success('Specialty updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update specialty');
      console.error('Error updating specialty:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Editar Especialidade</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Especialidade"
              error={errors.name?.message}
              {...register('name', { required: 'Specialty name is required' })}
              disabled={isSubmitting}
            />
            
            <Input
              type="number"
              label="Duração (minutos)"
              error={errors.duration?.message}
              {...register('duration', {
                required: 'Duration is required',
                min: { value: 5, message: 'Duration must be at least 5 minutes' },
              })}
              disabled={isSubmitting}
            />
            
            <Input
              type="number"
              label="Preço"
              step="0.01"
              error={errors.price?.message}
              {...register('price', {
                min: { value: 0, message: 'Price cannot be negative' },
              })}
              disabled={isSubmitting}
            />
            
            <Input
              label="Descrição"
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
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Salvar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditSpecialtyModal;
