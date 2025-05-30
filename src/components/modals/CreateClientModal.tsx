import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface CreateClientFormData {
  name: string;
  email: string;
  phone?: string;
}

interface CreateClientModalProps {
  calendarId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({ calendarId, onClose, onSuccess }) => {
  const { user } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<CreateClientFormData>();

  const onSubmit = async (data: CreateClientFormData) => {
    try {
      if (!user) {
        toast.error('User not authenticated');
        return;
      }

      // Verifica se o email já existe
      const { data: existingClients, error: checkError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', data.email)
        .eq('owner_id', user.id);

      if (checkError) throw checkError;

      if (existingClients?.length) {
        setError('email', { message: 'A client with this email already exists' });
        return;
      }

      // Cria o cliente
      const { error } = await supabase.from('clients').insert({
        ...data,
        phone: data.phone || null,
        calendar_id: calendarId,
        owner_id: user.id,
      });

      if (error) throw error;

      toast.success('Client created successfully');
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create client');
      console.error('Error creating client:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Novo cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
              disabled={isSubmitting}
            />

            <Input
              type="email"
              label="E-mail"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
              disabled={isSubmitting}
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
                Adicionar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClientModal;
