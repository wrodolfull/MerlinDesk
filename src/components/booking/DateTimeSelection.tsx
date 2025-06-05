import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay, isAfter, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Professional, Specialty } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface DateTimeSelectionProps {
  professional?: Professional;
  specialty?: Specialty;
  onSelect: (date: Date, timeSlot: { start: string; end: string }) => void;
  onBack: () => void;
  getTimeSlots: (date: Date) => Promise<{ start: string; end: string }[]>;
  selectedDate?: Date;
  workingDays?: number[]; // agora opcional
}

export const DateTimeSelection = ({
  professional,
  specialty,
  onSelect,
  onBack,
  getTimeSlots,
  selectedDate,
  workingDays = []
}: DateTimeSelectionProps) => {
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(selectedDate || new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);

  useEffect(() => {
    if (selectedDate) setInternalSelectedDate(selectedDate);
  }, [selectedDate]);

useEffect(() => {
  const validateAvailableDates = async () => {
    console.log('🔄 Validando datas disponíveis');
    console.log('👤 Professional:', professional?.name);
    console.log('📅 Working days recebidos:', workingDays);

    if (!professional || workingDays.length === 0) {
      console.log('⚠️ Sem profissional ou working days vazios');
      setAvailableDates([]);
      return;
    }

    const today = new Date();
    const validDates: Date[] = [];

    // ⚠️ Validar cada data com slots reais
    for (let i = 0; i < 60; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      if (workingDays.includes(dayOfWeek)) {
        try {
          const slots = await getTimeSlots(date);
          if (slots.length > 0) {
            validDates.push(date);
          }
        } catch (error) {
          console.error('❌ Erro ao verificar slots para', date, error);
        }
      }
    }

    console.log(`📊 Total de datas válidas: ${validDates.length}`);
    setAvailableDates(validDates);
  };

  validateAvailableDates();
}, [workingDays, professional, getTimeSlots]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!professional || !specialty) return;

      try {
        const slots = await getTimeSlots(internalSelectedDate);
        const now = new Date();
        const filtered = slots.filter((slot) => {
          const slotStart = new Date(slot.start);
          return !isSameDay(slotStart, internalSelectedDate) || isAfter(slotStart, now);
        });

        setTimeSlots(filtered);
      } catch (err) {
        console.error('Erro ao carregar slots:', err);
        setTimeSlots([]);
      }
    };

    fetchSlots();
  }, [internalSelectedDate, professional, specialty]);

  const handleDateSelect = (date: Date) => {
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

  const generateCalendarDays = () => {
    const year = internalSelectedDate.getFullYear();
    const month = internalSelectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDay.getDay();

    const calendarDays: (Date | null)[] = [];

    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(null);
    }

    for (let day = 1; day <= lastDay.getDate(); day++) {
      calendarDays.push(new Date(year, month, day));
    }

    return calendarDays;
  };

  const goToPreviousMonth = () => {
    setInternalSelectedDate(subMonths(internalSelectedDate, 1));
  };

  const goToNextMonth = () => {
    setInternalSelectedDate(addMonths(internalSelectedDate, 1));
  };

  const calendarDays = generateCalendarDays();

  return (
    <div className="animate-fade-in flex flex-col-reverse md:flex-row gap-8">
      {/* CALENDÁRIO */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full md:w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900">
            {format(internalSelectedDate, 'MMMM yyyy', { locale: ptBR })}
          </h4>
          <div className="flex space-x-2">
            <button onClick={goToPreviousMonth} className="p-2 hover:bg-gray-100 rounded">
              <ChevronLeft size={16} />
            </button>
            <button onClick={goToNextMonth} className="p-2 hover:bg-gray-100 rounded">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
            <div key={i} className="text-xs text-gray-500 text-center py-2 font-medium">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            if (!date) return <div key={i} className="text-sm text-center py-2" />;

            const isAvailable = availableDates.some((d) => isSameDay(d, date));
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
