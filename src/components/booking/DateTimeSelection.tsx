import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Professional, Specialty } from '../../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

interface DateTimeSelectionProps {
  professional?: Professional;
  specialty?: Specialty;
  getTimeSlots: (date: Date) => Promise<{ start: string; end: string }[]>;
  onSelect: (date: Date, timeSlot: { start: string; end: string }) => void;
  onBack: () => void;
  workingDays: number[];
}

export const DateTimeSelection = ({
  professional,
  specialty,
  getTimeSlots,
  onSelect,
  onBack,
  workingDays,
}: DateTimeSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);

  useEffect(() => {
  const today = new Date();
  const validDates: Date[] = [];

  for (let i = 0; i < 35; i++) {
    const date = addDays(today, i);
    const dayIndex = date.getDay(); // 0=Dom, 1=Seg, 2=Ter, etc.

    console.log(`Data: ${format(date, 'dd/MM/yyyy')} - Dia: ${dayIndex} - Working Days: ${workingDays}`);

    if (workingDays.includes(dayIndex)) {
      validDates.push(date);
    }
  }

  console.log('Datas válidas encontradas:', validDates.length);
  setAvailableDates(validDates);
}, [workingDays]);


  useEffect(() => {
    const fetchSlots = async () => {
      if (professional && specialty) {
        const slots = await getTimeSlots(selectedDate);
        setTimeSlots(slots);
      }
    };
    fetchSlots();
  }, [selectedDate, professional, specialty]);

  const handleDateSelect = (date: Date) => setSelectedDate(date);
  const formatDisplayTime = (isoString: string) => format(new Date(isoString), 'HH:mm');

  return (
    <div className="animate-fade-in flex flex-col-reverse md:flex-row gap-8">
      {/* CALENDÁRIO */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full md:w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900">
            {format(selectedDate, 'MMMM yyyy')}
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((d, i) => (
            <div key={i} className="text-xs text-gray-500 text-center py-2">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {availableDates.map((date, i) => {
            const isCurrent = isSameDay(date, selectedDate);
            const hasSlots = true;

            return (
              <div
                key={i}
                onClick={() => handleDateSelect(date)}
                className={`text-sm text-center py-2 rounded cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#6D3FC4] text-white font-bold'
                    : hasSlots
                    ? 'bg-[#F6F0FD] text-[#6D3FC4] hover:bg-[#E8DBFA]'
                    : 'text-gray-500 hover:bg-gray-100'
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
          <h3 className="text-sm font-medium text-gray-800 mb-2">Horários disponíveis</h3>
          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.start}
                  onClick={() => onSelect(selectedDate, slot)}
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
