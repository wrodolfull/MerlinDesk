import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';

interface WorkingHour {
  id?: string;
  day_of_week: number;
  start_time: string | null;
  end_time: string | null;
  is_working_day: boolean;
  professional_id: string;
}

interface WorkingHoursModalProps {
  professionalId: string;
  professionalName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const DAYS = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
];

const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
  professionalId,
  professionalName,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        const { data, error } = await supabase
          .from('working_hours')
          .select('*')
          .eq('professional_id', professionalId)
          .order('day_of_week');

        if (error) throw error;

        const defaultHours = Array(7).fill(null).map((_, dayOfWeek) => ({
          day_of_week: dayOfWeek,
          start_time: '09:00',
          end_time: '17:00',
          is_working_day: false,
          professional_id: professionalId,
          ...data?.find(d => d.day_of_week === dayOfWeek)
        }));

        setWorkingHours(defaultHours);
      } catch (error) {
        console.error('Error loading working hours:', error);
        toast.error('Failed to load working hours');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, [professionalId]);

  const handleToggleDay = async (dayOfWeek: number) => {
    try {
      setSaving(true);
  
      const updatedHours = workingHours.map(wh =>
        wh.day_of_week === dayOfWeek
          ? {
              ...wh,
              is_working_day: !wh.is_working_day,
              start_time: wh.start_time ?? '08:00',
              end_time: wh.end_time ?? '17:00',
            }
          : wh
      );
  
      const day = updatedHours.find(wh => wh.day_of_week === dayOfWeek);
      if (!day) return;
  
      const { data, error } = await supabase
        .from('working_hours')
        .upsert(
          {
            ...day,
            start_time: day.is_working_day ? day.start_time : null,
            end_time: day.is_working_day ? day.end_time : null,
          },
          { onConflict: 'professional_id,day_of_week' }
        )
        .select()
        .single();
  
      if (error) throw error;
  
      setWorkingHours(prev =>
        prev.map(wh => (wh.day_of_week === dayOfWeek ? data : wh))
      );
      toast.success(`${DAYS[dayOfWeek]} ${day.is_working_day ? 'enabled' : 'disabled'}`);
    } catch (error: any) {
      console.error('Error updating day:', error);
      toast.error(error.message || 'Failed to update working day');
    } finally {
      setSaving(false);
    }
  };
  

  const handleTimeChange = async (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    try {
      setSaving(true);
      const updatedHours = workingHours.map(wh => 
        wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh
      );
      setWorkingHours(updatedHours);

      const day = updatedHours.find(wh => wh.day_of_week === dayOfWeek);
      if (!day?.is_working_day) return;

      const { error } = await supabase
        .from('working_hours')
        .update({ [field]: value })
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek);

      if (error) throw error;
      toast.success(`${DAYS[dayOfWeek]} hours updated`);
    } catch (error) {
      console.error('Error updating time:', error);
      toast.error('Failed to update working hours');
    } finally {
      setSaving(false);
    }
  };

  const validateTimeRange = (start: string, end: string) => {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    return endHour > startHour || (endHour === startHour && endMinute > startMinute);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Loading working hours...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            Working Hours - {professionalName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day, index) => {
              const dayData = workingHours[index];
              const isValid = dayData.is_working_day 
                ? validateTimeRange(dayData.start_time || '', dayData.end_time || '')
                : true;

              return (
                <div
                  key={day}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2 border rounded-lg"
                >
                  <div className="flex items-center w-32">
                    <input
                      type="checkbox"
                      checked={dayData.is_working_day}
                      onChange={() => handleToggleDay(index)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                      disabled={saving}
                    />
                    <span className={dayData.is_working_day ? 'font-medium' : 'text-gray-400'}>
                      {day}
                    </span>
                  </div>

                  {dayData.is_working_day && (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        type="time"
                        value={dayData.start_time || ''}
                        onChange={(e) => handleTimeChange(index, 'start_time', e.target.value)}
                        className="w-32"
                        disabled={saving}
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={dayData.end_time || ''}
                        onChange={(e) => handleTimeChange(index, 'end_time', e.target.value)}
                        className="w-32"
                        disabled={saving}
                        error={!isValid ? 'End time must be after start time' : undefined}
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end mt-6 gap-2">
              <Button variant="outline" onClick={onClose} disabled={saving}>
                Close
              </Button>
              <Button onClick={onSuccess} disabled={saving}>
                {saving ? 'Saving...' : 'Done'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkingHoursModal;
