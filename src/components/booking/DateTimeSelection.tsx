import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, isAfter, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Professional, Specialty } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface DateTimeSelectionProps {
  professional?: Professional;
  specialty?: Specialty;
  onSelect: (date: Date, timeSlot: { start: string; end: string }) => void;
  onBack: () => void;
  workingDays: number[];
  selectedDate?: Date;
}

export const DateTimeSelection = ({
  professional,
  specialty,
  onSelect,
  onBack,
  workingDays,
  selectedDate,
}: DateTimeSelectionProps) => {
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(selectedDate || new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);

  const getTimeSlots = async (
    date: Date,
    professionalId: string,
    specialtyId: string
  ): Promise<{ start: string; end: string }[]> => {
    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        input_professional_id: professionalId,
        input_specialty_id: specialtyId,
        input_date: format(date, 'yyyy-MM-dd'),
      });

      if (error) {
        console.error('Erro ao buscar horários:', error);
        return [];
      }

      const now = new Date();
      return (data || [])
        .map((slot: { start_time: string; end_time: string }) => ({
          start: slot.start_time,
          end: slot.end_time,
        }))
        .filter((slot) => {
          const slotDate = new Date(slot.start);
          return isAfter(slotDate, now) || isSameDay(slotDate, now);
        });
    } catch (err) {
      console.error('Erro inesperado:', err);
      return [];
    }
  };

  useEffect(() => {
    if (selectedDate) setInternalSelectedDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    console.log('📅 GERANDO DATAS VÁLIDAS:');
    console.log('  🗓️ Working Days recebidos:', workingDays);
    
    const today = new Date();
    console.log('  📍 Hoje:', format(today, 'yyyy-MM-dd EEEE', { locale: ptBR }));
    console.log('  📍 Hoje (getDay):', today.getDay());
    
    const validDates: Date[] = [];

    for (let i = 0; i < 60; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      console.log(`  📆 ${format(date, 'yyyy-MM-dd EEEE', { locale: ptBR })} - dayOfWeek: ${dayOfWeek}`);
      
      if (workingDays.includes(dayOfWeek)) {
        console.log('    ✅ Incluída como válida');
        validDates.push(date);
      } else {
        console.log('    ❌ Não é dia de trabalho');
      }
    }

    console.log('📋 Total de datas válidas:', validDates.length);
    setAvailableDates(validDates);
  }, [workingDays]);

    useEffect(() => {
      const fetchSlots = async () => {
        if (!professional || !specialty) return;

        const allSlots = await getTimeSlots(
          internalSelectedDate,
          professional.id,
          specialty.id
        );

        const now = new Date();
        const filtered = allSlots.filter((slot) => {
          const slotStart = new Date(slot.start);
          return !isSameDay(slotStart, internalSelectedDate) || isAfter(slotStart, now);
        });

        setTimeSlots(filtered);
      };

      fetchSlots();
    }, [internalSelectedDate, professional, specialty]);

  const handleDateSelect = (date: Date) => {
    console.log('📅 DATA SELECIONADA:', format(date, 'yyyy-MM-dd EEEE', { locale: ptBR }));
    setInternalSelectedDate(date);
  };

  const formatDisplayTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
      hour12: false,
    });
  };

  // CORRIGIDO: Função para gerar calendário corretamente
  const generateCalendarDays = () => {
    const year = internalSelectedDate.getFullYear();
    const month = internalSelectedDate.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    console.log('📅 GERANDO CALENDÁRIO:');
    console.log('  📆 Primeiro dia do mês:', format(firstDay, 'yyyy-MM-dd EEEE', { locale: ptBR }));
    console.log('  📆 getDay() do primeiro dia:', firstDay.getDay());
    console.log('  📆 Último dia do mês:', format(lastDay, 'yyyy-MM-dd EEEE', { locale: ptBR }));
    
    // Quantos dias vazios no início (0 = domingo, 1 = segunda, etc.)
    const startDayOfWeek = firstDay.getDay();
    
    const calendarDays: (Date | null)[] = [];
    
    // Adicionar dias vazios no início
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      calendarDays.push(date);
      
      if (day <= 7) {
        console.log(`  📆 Dia ${day}: ${format(date, 'yyyy-MM-dd EEEE', { locale: ptBR })} - getDay: ${date.getDay()}`);
      }
    }
    
    console.log('  📊 Total de células:', calendarDays.length);
    console.log('  📊 Dias vazios no início:', startDayOfWeek);
    
    return calendarDays;
  };

  const calendarDays = generateCalendarDays();

  // CORRIGIDO: Navegação de mês
  const goToPreviousMonth = () => {
    setInternalSelectedDate(subMonths(internalSelectedDate, 1));
  };

  const goToNextMonth = () => {
    setInternalSelectedDate(addMonths(internalSelectedDate, 1));
  };

  return (
    <div className="animate-fade-in flex flex-col-reverse md:flex-row gap-8">
      {/* DEBUG INFO */}
      <div className="fixed top-0 right-0 bg-black text-white p-2 text-xs z-50 max-w-xs">
        <div><strong>Debug Info:</strong></div>
        <div>Hoje: {format(new Date(), 'yyyy-MM-dd EEEE', { locale: ptBR })}</div>
        <div>Hoje (getDay): {new Date().getDay()}</div>
        <div>Working Days: [{workingDays.join(',')}]</div>
        <div>Mês atual: {format(internalSelectedDate, 'MMMM yyyy', { locale: ptBR })}</div>
        <div>Primeiro dia getDay: {new Date(internalSelectedDate.getFullYear(), internalSelectedDate.getMonth(), 1).getDay()}</div>
      </div>

      {/* CALENDÁRIO */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full md:w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900">
            {format(internalSelectedDate, 'MMMM yyyy', { locale: ptBR })}
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* CABEÇALHO DOS DIAS DA SEMANA */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
            <div key={i} className="text-xs text-gray-500 text-center py-2 font-medium">{d}</div>
          ))}
        </div>

        {/* GRID DO CALENDÁRIO */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            if (!date) {
              return <div key={i} className="text-sm text-center py-2"></div>;
            }

            const isAvailable = availableDates.some((available) => isSameDay(available, date));
            const isCurrent = isSameDay(date, internalSelectedDate);
            const isToday = isSameDay(date, new Date());
            const isPast = date < new Date() && !isSameDay(date, new Date());

            return (
              <div
                key={i}
                onClick={() => isAvailable && !isPast ? handleDateSelect(date) : undefined}
                className={`text-sm text-center py-2 rounded transition-all ${
                  isCurrent && isAvailable
                    ? 'bg-[#6D3FC4] text-white font-bold cursor-pointer'
                    : isToday
                    ? 'bg-blue-100 text-blue-800 font-bold border border-blue-300'
                    : isAvailable && !isPast
                    ? 'bg-[#F6F0FD] text-[#6D3FC4] hover:bg-[#E8DBFA] cursor-pointer'
                    : isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={`${format(date, 'yyyy-MM-dd EEEE', { locale: ptBR })} - Day: ${date.getDay()}`}
              >
                {format(date, 'd')}
              </div>
            );
          })}
        </div>
      </div>

      {/* HORÁRIOS */}
      <div className="w-full md:w-1/2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha um horário</h2>
        <p className="text-gray-600 mb-6">
          {professional ? `com ${professional.name}` : 'Selecione um profissional'}
        </p>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            Horários disponíveis para {format(internalSelectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          
          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={`${slot.start}-${index}`}
                  onClick={() => onSelect(internalSelectedDate, slot)}
                  className="py-2 px-3 rounded border border-gray-200 text-sm hover:border-[#6D3FC4] hover:bg-[#F6F0FD] transition"
                >
                  {formatDisplayTime(slot.start)}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 text-center p-4 rounded text-gray-500 text-sm">
              Nenhum horário disponível nesta data.
            </div>
          )}
        </div>

        <Button variant="ghost" onClick={onBack}>
          ← Voltar
        </Button>
      </div>
    </div>
  );
};
