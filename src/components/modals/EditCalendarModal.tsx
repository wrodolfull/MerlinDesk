import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Calendar } from '../../types';

interface EditCalendarFormData {
  name: string;
  location: string;
}

interface EditCalendarModalProps {
  calendar: Calendar;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCalendarModal = ({ calendar, onClose, onSuccess }: EditCalendarModalProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditCalendarFormData>({
    defaultValues: {
      name: calendar.name,
      location: calendar.location_id || '',
    },
  });

  const onSubmit = async (data: EditCalendarFormData) => {
    try {
      const { error } = await supabase
        .from('calendars')
        .update({
          name: data.name,
          location_id: data.location,
        })
        .eq('id', calendar.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error updating calendar:', error);
      alert('Failed to update calendar');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Calendar Name"
              error={errors.name?.message}
              {...register('name', { required: 'Calendar name is required' })}
            />
            
            <Input
              label="Location"
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
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

export default EditCalendarModal;