import React from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { Calendar } from '../../types';
import toast, { Toaster } from 'react-hot-toast';

interface EditCalendarFormData {
  name: string;
  location: string;
}

interface EditCalendarModalProps {
  calendar: Calendar;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCalendarModal: React.FC<EditCalendarModalProps> = ({ calendar, onClose, onSuccess }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditCalendarFormData>({
    defaultValues: {
      name: calendar.name,
      location: calendar.location_id || '',
    },
  });

  React.useEffect(() => {
    reset({
      name: calendar.name,
      location: calendar.location_id || '',
    });
  }, [calendar, reset]);

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

      toast.success('Calendar updated successfully');
      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.message || 'Failed to update calendar';
      toast.error(message);
      console.error('Error updating calendar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
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
              disabled={isSubmitting}
            />
            
            <Input
              label="Location"
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
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
