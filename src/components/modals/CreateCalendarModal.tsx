import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface CreateCalendarFormData {
  name: string;
  location: string;
}

interface CreateCalendarModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCalendarModal: React.FC<CreateCalendarModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCalendarFormData>();

  const onSubmit = async (data: CreateCalendarFormData) => {
  try {
    if (!user) throw new Error('User not authenticated');

    const { data: limitsData, error: limitsError } = await supabase
      .from('user_plan_limits')
      .select('limits')
      .eq('user_id', user.id)
      .single();

    if (limitsError) throw limitsError;

    const calendarLimit = limitsData?.limits?.calendars;

    const { count: currentCalendars, error: countError } = await supabase
      .from('calendars')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    if (countError) throw countError;

    if (currentCalendars === null) {
      throw new Error('Não foi possível obter a quantidade de calendários existentes.');
    }

    if (calendarLimit !== -1 && currentCalendars >= calendarLimit) {
      toast.error('Você atingiu o limite de calendários do seu plano.');
      return;
    }

    const { error: calendarError } = await supabase
      .from('calendars')
      .insert({
        name: data.name,
        location_id: data.location,
        owner_id: user.id,
      });

    if (calendarError) throw calendarError;

    toast.success('Calendário criado com sucesso');
    reset();
    onSuccess();
    onClose();
  } catch (error: any) {
    toast.error(error.message || 'Erro ao criar calendário.');
    console.error('Erro ao criar calendário:', error);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Calendar Name"
              error={errors.name?.message}
              {...register('name', { required: 'Calendar name is required' })}
              disabled={isSubmitting}
            />

            <Input
              label="Location"
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
              disabled={isSubmitting}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                Create Calendar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCalendarModal;
