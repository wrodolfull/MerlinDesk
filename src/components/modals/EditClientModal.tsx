import React from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { Client } from '../../types';

interface EditClientFormData {
  name: string;
  email: string;
  phone?: string;
}

interface EditClientModalProps {
  client: Client;
  onClose: () => void;
  onSuccess: () => void;
}

const EditClientModal = ({ client, onClose, onSuccess }: EditClientModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditClientFormData>({
    defaultValues: {
      name: client.name,
      email: client.email,
      phone: client.phone,
    },
  });

  const onSubmit = async (data: EditClientFormData) => {
    try {
      const { error } = await supabase
        .from('clients')
        .update({
          name: data.name,
          email: data.email,
          phone: data.phone || null,
          calendar_id: client.calendar_id, // ✅ garante manter o calendar_id
        })
        .eq('id', client.id);

      if (error) throw error;
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating client:', err);
      alert('Failed to update client');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Client</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              {...register('name', { required: 'Name is required' })}
              error={errors.name?.message}
            />
            <Input
              type="email"
              label="Email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              error={errors.email?.message}
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
            />
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

export default EditClientModal;
