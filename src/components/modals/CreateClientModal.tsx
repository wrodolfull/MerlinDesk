import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';

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

const CreateClientModal = ({ calendarId, onClose, onSuccess }: CreateClientModalProps) => {
  const { user } = useAuth();
  const [emailError, setEmailError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClientFormData>();

  const onSubmit = async (data: CreateClientFormData) => {
    try {
      setEmailError('');

      if (!user) {
        setEmailError('User not authenticated');
        return;
      }

      console.log('Authenticated user:', user);

      // Check if email already exists for this user
      const { data: existingClients, error: checkError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', data.email)
        .eq('user_id', user.id)
        .limit(1);

      if (checkError) throw checkError;

      if (existingClients && existingClients.length > 0) {
        setEmailError('A client with this email already exists');
        return;
      }

      const insertPayload = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        calendar_id: calendarId,
        user_id: user.id, // ✅ includes user_id
      };

      console.log('Insert payload:', insertPayload);

      const { error: insertError } = await supabase.from('clients').insert(insertPayload);

      if (insertError) throw insertError;

      console.log('Client created successfully');
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating client:', err);
      if (err instanceof Error) {
        setEmailError(err.message);
      } else {
        setEmailError('Failed to create client');
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>New Client</CardTitle>
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
              error={errors.email?.message || emailError}
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
                Create
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateClientModal;
