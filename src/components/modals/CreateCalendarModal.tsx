import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface CreateCalendarFormData {
  name: string;
  location: string;
}

interface CreateCalendarModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCalendarModal = ({ onClose, onSuccess }: CreateCalendarModalProps) => {
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateCalendarFormData>();

  const onSubmit = async (data: CreateCalendarFormData) => {
    try {
      setError(null);
      if (!user) throw new Error('User not authenticated');

      const { error: calendarError } = await supabase
        .from('calendars')
        .insert({
          name: data.name,
          location_id: data.location,
          owner_id: user.id, // ✅ salva direto o user_id no calendário
        });

      if (calendarError) throw calendarError;

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating calendar:', error);
      setError(error.message || 'Failed to create calendar. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create New Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}

            <Input
              label="Calendar Name"
              error={errors.name?.message}
              {...register('name', { required: 'Calendar name is required' })}
            />

            <Input
              label="Location"
              error={errors.location?.message}
              {...register('location')}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" isLoading={isSubmitting}>
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
