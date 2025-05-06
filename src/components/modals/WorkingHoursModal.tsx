import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface WorkingHour {
  id: string;
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
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
];

const WorkingHoursModal = ({
  professionalId,
  professionalName,
  onClose,
  onSuccess,
}: WorkingHoursModalProps) => {
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

  useEffect(() => {
    const initializeWorkingHours = async () => {
      try {
        // Buscar horários existentes
        const { data: existingHours, error } = await supabase
          .from('working_hours')
          .select('*')
          .eq('professional_id', professionalId)
          .order('day_of_week');

        if (error) throw error;

        // Criar estrutura padrão para todos os dias
        const defaultHours = Array.from({ length: 7 }, (_, dayOfWeek) => ({
          day_of_week: dayOfWeek,
          start_time: null,
          end_time: null,
          is_working_day: false,
          professional_id: professionalId,
        }));

        // Mesclar dados existentes com padrão
        const mergedHours = defaultHours.map(defaultDay => {
          const existingDay = existingHours?.find(
            h => h.day_of_week === defaultDay.day_of_week
          );
          return existingDay || defaultDay;
        });

        setWorkingHours(mergedHours);
      } catch (err) {
        console.error('Error initializing working hours:', err);
        toast.error('Falha ao carregar horários');
      } finally {
        setLoading(false);
      }
    };

    initializeWorkingHours();
  }, [professionalId]);

  const handleToggleDay = async (dayOfWeek: number) => {
  try {
    const currentDay = workingHours.find(wh => wh.day_of_week === dayOfWeek);
    if (!currentDay) return;

    const newValue = !currentDay.is_working_day;
    const isNewRecord = !currentDay.id; // Verifica se é novo registro

    // Dados para upsert
    const dataToUpsert = {
      ...currentDay,
      is_working_day: newValue,
      start_time: newValue ? '09:00' : null,
      end_time: newValue ? '17:00' : null,
    };

    // Remove ID se for novo registro
    if (isNewRecord) {
      delete dataToUpsert.id;
    }

    const { data, error } = await supabase
      .from('working_hours')
      .upsert([dataToUpsert], { 
        onConflict: 'professional_id,day_of_week',
        returning: 'representation' // Garante retorno dos dados atualizados
      })
      .select()
      .single();

    if (error) throw error;

    // Atualiza estado com dados do servidor
    setWorkingHours(prev =>
      prev.map(wh =>
        wh.day_of_week === dayOfWeek ? { ...wh, ...data } : wh
      )
    );

    toast.success(`${DAYS[dayOfWeek]} ${newValue ? 'ativado' : 'desativado'}`);
  } catch (err) {
    console.error('Error updating working day:', err);
    toast.error('Falha ao atualizar dia');
  }
};

  const handleTimeChange = async (
    dayOfWeek: number,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    try {
      const currentDay = workingHours.find(wh => wh.day_of_week === dayOfWeek);
      if (!currentDay || !currentDay.is_working_day) return;

      const { data, error } = await supabase
        .from('working_hours')
        .update({ [field]: value })
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek)
        .select()
        .single();

      if (error) throw error;

      setWorkingHours(prev =>
        prev.map(wh => (wh.day_of_week === dayOfWeek ? { ...wh, ...data } : wh))
      );
    } catch (err) {
      console.error('Error updating time:', err);
      toast.error('Falha ao atualizar horário');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Carregando horários...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>
            Horário de Trabalho - {professionalName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day, index) => {
              const dayHours = workingHours.find(
                wh => wh.day_of_week === index
              )!;

              return (
                <div
                  key={day}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2 border rounded-lg"
                >
                  <div className="flex items-center w-32">
                    <input
                      type="checkbox"
                      checked={dayHours.is_working_day}
                      onChange={() => handleToggleDay(index)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                    />
                    <span
                      className={`${
                        dayHours.is_working_day
                          ? 'text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {day}
                    </span>
                  </div>

                  {dayHours.is_working_day && (
                    <div className="flex flex-1 items-center gap-2">
                      <Input
                        type="time"
                        value={dayHours.start_time || ''}
                        onChange={e =>
                          handleTimeChange(index, 'start_time', e.target.value)
                        }
                        className="w-32"
                      />
                      <span className="text-gray-500">às</span>
                      <Input
                        type="time"
                        value={dayHours.end_time || ''}
                        onChange={e =>
                          handleTimeChange(index, 'end_time', e.target.value)
                        }
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            <div className="flex justify-end mt-6 gap-2">
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
              <Button onClick={onSuccess}>Salvar Alterações</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkingHoursModal;