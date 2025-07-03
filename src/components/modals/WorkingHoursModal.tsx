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

interface WorkingHourInterval {
  id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  professional_id: string;
}

interface WorkingHoursModalProps {
  professionalId: string;
  professionalName: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Array dos dias seguindo a convenção do banco: 0=Domingo, 1=Segunda, etc.
const DAYS = [
  'Domingo',      // 0
  'Segunda-feira', // 1
  'Terça-feira',   // 2
  'Quarta-feira',  // 3
  'Quinta-feira',  // 4
  'Sexta-feira',   // 5
  'Sábado',        // 6
];

const WorkingHoursModal: React.FC<WorkingHoursModalProps> = ({
  professionalId,
  professionalName,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [intervalsByDay, setIntervalsByDay] = useState<{ [day: number]: WorkingHourInterval[] }>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchIntervals = async () => {
      try {
        const { data, error } = await supabase
          .from('working_hour_intervals')
          .select('*')
          .eq('professional_id', professionalId);
        if (error) throw error;
        // Agrupar por dia
        const grouped: { [day: number]: WorkingHourInterval[] } = {};
        for (let i = 0; i < 7; i++) grouped[i] = [];
        (data || []).forEach((interval: any) => {
          if (interval.start_time && interval.end_time) {
            grouped[interval.day_of_week].push({
              id: interval.id,
              day_of_week: interval.day_of_week,
              start_time: interval.start_time,
              end_time: interval.end_time,
              professional_id: interval.professional_id,
            });
          }
        });
        setIntervalsByDay(grouped);
      } catch (error) {
        toast.error('Erro ao carregar intervalos');
      } finally {
        setLoading(false);
      }
    };
    fetchIntervals();
  }, [professionalId]);

  const handleAddInterval = (day: number) => {
    setIntervalsByDay(prev => ({
      ...prev,
      [day]: [
        ...prev[day],
        {
          day_of_week: day,
          start_time: '09:00',
          end_time: '17:00',
          professional_id: professionalId,
        },
      ],
    }));
  };

  const handleRemoveInterval = (day: number, idx: number) => {
    setIntervalsByDay(prev => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== idx),
    }));
  };

  const handleIntervalChange = (day: number, idx: number, field: 'start_time' | 'end_time', value: string) => {
    setIntervalsByDay(prev => ({
      ...prev,
      [day]: prev[day].map((interval, i) =>
        i === idx ? { ...interval, [field]: value } : interval
      ),
    }));
  };

  const handleSetUnavailable = (day: number) => {
    setIntervalsByDay(prev => ({
      ...prev,
      [day]: [],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Deleta todos os intervalos antigos do profissional
      await supabase.from('working_hour_intervals').delete().eq('professional_id', professionalId);
      // Insere todos os intervalos atuais
      const allIntervals = Object.values(intervalsByDay).flat();
      if (allIntervals.length > 0) {
        const { error } = await supabase.from('working_hour_intervals').insert(allIntervals.map(({ id, ...rest }) => rest));
        if (error) throw error;
      }
      toast.success('Horários salvos com sucesso!');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Erro ao salvar horários');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle>Carregando horários de trabalho...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-lg max-h-[90vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle>
            Horários de Trabalho - {professionalName}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-2">
            {DAYS.map((dayName, dayIdx) => {
              const isAvailable = intervalsByDay[dayIdx] && intervalsByDay[dayIdx].length > 0;
              return (
                <React.Fragment key={dayIdx}>
                  <div className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={e => {
                        if (e.target.checked) {
                          handleAddInterval(dayIdx);
                        } else {
                          handleSetUnavailable(dayIdx);
                        }
                      }}
                      className="mr-2"
                    />
                    <span className="w-32 font-medium mr-2">{dayName}</span>
                    {isAvailable ? (
                      <div className="flex-1 flex flex-row flex-wrap gap-2">
                        {intervalsByDay[dayIdx].map((interval, idx) => (
                          <div key={idx} className="flex items-center gap-3 mb-1">
                            <Input
                              type="time"
                              value={interval.start_time}
                              onChange={e => handleIntervalChange(dayIdx, idx, 'start_time', e.target.value)}
                              className="w-32"
                            />
                            <Input
                              type="time"
                              value={interval.end_time}
                              onChange={e => handleIntervalChange(dayIdx, idx, 'end_time', e.target.value)}
                              className="w-32"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveInterval(dayIdx, idx)}
                              type="button"
                              title="Remover intervalo"
                            >
                              ×
                            </Button>
                            {idx === intervalsByDay[dayIdx].length - 1 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleAddInterval(dayIdx)}
                                type="button"
                                title="Adicionar intervalo"
                              >
                                +
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 ml-2">Indisponível</span>
                    )}
                  </div>
                  {/* Linha divisória sutil entre os dias */}
                  {dayIdx < DAYS.length - 1 && (
                    <div className="border-t border-gray-200 my-2" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </CardContent>
        <Button onClick={handleSave} disabled={saving} className="mt-4">Salvar</Button>
      </Card>
    </div>
  );
};

export default WorkingHoursModal;
