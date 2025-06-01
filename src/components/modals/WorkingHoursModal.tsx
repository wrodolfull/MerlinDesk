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

        console.log('🔍 Dados do banco:', data);

        // Criar array ordenado por day_of_week (0-6)
        const orderedHours = Array(7).fill(null).map((_, dayOfWeek) => {
          const existingData = data?.find(d => d.day_of_week === dayOfWeek);
          
          const dayData = {
            day_of_week: dayOfWeek,
            start_time: existingData?.start_time || '09:00',
            end_time: existingData?.end_time || '17:00',
            is_working_day: existingData?.is_working_day || false,
            professional_id: professionalId,
            id: existingData?.id,
          };

          console.log(`📅 ${DAYS[dayOfWeek]} (${dayOfWeek}):`, dayData);
          return dayData;
        });

        setWorkingHours(orderedHours);
      } catch (error) {
        console.error('Error loading working hours:', error);
        toast.error('Erro ao carregar horários de trabalho');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkingHours();
  }, [professionalId]);

  const handleToggleDay = async (dayOfWeek: number) => {
    try {
      setSaving(true);
      
      console.log(`🔄 Alterando ${DAYS[dayOfWeek]} (day_of_week: ${dayOfWeek})`);
  
      // Encontrar o dia específico no estado atual
      const currentDay = workingHours.find(wh => wh.day_of_week === dayOfWeek);
      if (!currentDay) {
        console.error('❌ Dia não encontrado no estado');
        return;
      }

      const newIsWorkingDay = !currentDay.is_working_day;
      console.log(`📝 ${DAYS[dayOfWeek]}: ${currentDay.is_working_day} → ${newIsWorkingDay}`);
      
      // Preparar dados para upsert
      const upsertData = {
        professional_id: professionalId,
        day_of_week: dayOfWeek,
        start_time: newIsWorkingDay ? (currentDay.start_time || '08:00') : null,
        end_time: newIsWorkingDay ? (currentDay.end_time || '17:00') : null,
        is_working_day: newIsWorkingDay,
      };

      console.log('💾 Dados para salvar:', upsertData);
  
      // Fazer upsert no banco de dados
      const { data, error } = await supabase
        .from('working_hours')
        .upsert(upsertData, { onConflict: 'professional_id,day_of_week' })
        .select()
        .single();
  
      if (error) {
        console.error('❌ Erro no banco:', error);
        throw error;
      }

      console.log('✅ Dados salvos:', data);
  
      // Atualizar o estado local
      setWorkingHours(prev =>
        prev.map(wh => (wh.day_of_week === dayOfWeek ? { ...wh, ...data } : wh))
      );
      
      toast.success(`${DAYS[dayOfWeek]} ${newIsWorkingDay ? 'habilitado' : 'desabilitado'}`);
    } catch (error: any) {
      console.error('Error updating day:', error);
      toast.error(error.message || 'Erro ao atualizar dia de trabalho');
    } finally {
      setSaving(false);
    }
  };
  
  const handleTimeChange = async (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    try {
      setSaving(true);
      
      // Atualizar estado local primeiro
      const updatedHours = workingHours.map(wh => 
        wh.day_of_week === dayOfWeek ? { ...wh, [field]: value } : wh
      );
      setWorkingHours(updatedHours);

      const day = updatedHours.find(wh => wh.day_of_week === dayOfWeek);
      if (!day?.is_working_day) return;

      // Validar horários antes de salvar
      if (field === 'end_time' && day.start_time) {
        if (!validateTimeRange(day.start_time, value)) {
          toast.error('Horário de fim deve ser posterior ao horário de início');
          return;
        }
      }
      if (field === 'start_time' && day.end_time) {
        if (!validateTimeRange(value, day.end_time)) {
          toast.error('Horário de início deve ser anterior ao horário de fim');
          return;
        }
      }

      const { error } = await supabase
        .from('working_hours')
        .update({ [field]: value })
        .eq('professional_id', professionalId)
        .eq('day_of_week', dayOfWeek);

      if (error) throw error;
      toast.success(`Horários de ${DAYS[dayOfWeek]} atualizados`);
    } catch (error) {
      console.error('Error updating time:', error);
      toast.error('Erro ao atualizar horários');
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
            <CardTitle>Carregando horários de trabalho...</CardTitle>
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
            Horários de Trabalho - {professionalName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
          {workingHours.map((dayData) => {
            const dayOfWeek = dayData.day_of_week;
            const dayName = DAYS[dayOfWeek];

            const isValid = dayData.is_working_day 
              ? validateTimeRange(dayData.start_time || '', dayData.end_time || '')
              : true;

            return (
              <div
                key={`day-${dayOfWeek}`}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-2 border rounded-lg"
              >
                <div className="flex items-center w-40">
                  <input
                    type="checkbox"
                    checked={dayData.is_working_day}
                    onChange={() => handleToggleDay(dayOfWeek)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mr-2"
                    disabled={saving}
                  />
                  <span className={dayData.is_working_day ? 'font-medium' : 'text-gray-400'}>
                    {dayName}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">({dayOfWeek})</span>
                </div>

                {dayData.is_working_day && (
                  <div className="flex flex-1 items-center gap-2">
                    <Input
                      type="time"
                      value={dayData.start_time || ''}
                      onChange={(e) => handleTimeChange(dayOfWeek, 'start_time', e.target.value)}
                      className="w-32"
                      disabled={saving}
                    />
                    <span className="text-gray-500">até</span>
                    <Input
                      type="time"
                      value={dayData.end_time || ''}
                      onChange={(e) => handleTimeChange(dayOfWeek, 'end_time', e.target.value)}
                      className="w-32"
                      disabled={saving}
                      error={!isValid ? 'Horário de fim deve ser posterior ao de início' : undefined}
                    />
                  </div>
                )}
              </div>
            );
          })}

          <div className="flex justify-end mt-6 gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Fechar
            </Button>
            <Button onClick={onSuccess} disabled={saving}>
              {saving ? 'Salvando...' : 'Concluído'}
            </Button>
          </div>
        </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkingHoursModal;
