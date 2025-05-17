import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { Professional, Specialty } from '../../types';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DateTimeSelectionProps {
  professional?: Professional;
  specialty?: Specialty;
  getTimeSlots: (date: Date) => Promise<{ start: string; end: string }[]>;
  onSelect: (date: Date, timeSlot: { start: string; end: string }) => void;
  onBack: () => void;
}

export const DateTimeSelection = ({
  professional,
  specialty,
  getTimeSlots,
  onSelect,
  onBack,
}: DateTimeSelectionProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);
  const [dateOffset, setDateOffset] = useState(0);

  // Gera os 14 dias disponíveis
  useEffect(() => {
    const dates = [];
    for (let i = 0; i < 14; i++) {
      dates.push(addDays(new Date(), i));
    }
    setAvailableDates(dates);
  }, []);

  // Atualiza os horários disponíveis para a data selecionada
  useEffect(() => {
    const fetchSlots = async () => {
      if (professional && specialty) {
        const slots = await getTimeSlots(selectedDate);
        setTimeSlots(slots);
      }
    };
  
    fetchSlots();
  }, [selectedDate, professional, specialty]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (timeSlot: { start: string; end: string }) => {
    onSelect(selectedDate, timeSlot);
  };

  const handlePrevDates = () => {
    if (dateOffset > 0) {
      setDateOffset(dateOffset - 7);
    }
  };

  const handleNextDates = () => {
    if (dateOffset + 7 < availableDates.length) {
      setDateOffset(dateOffset + 7);
    }
  };

  const formatDisplayTime = (isoString: string) => {
    return format(new Date(isoString), 'h:mm a');
  };

  const visibleDates = availableDates.slice(dateOffset, dateOffset + 7);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft size={16} />}
          onClick={onBack}
          className="mr-2"
        >
          Back
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          Select Date & Time
          {professional && (
            <span className="text-gray-500 text-lg ml-2">
              with {professional.name}
            </span>
          )}
        </h2>
      </div>

      {/* Seletor de datas */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Select Date</h3>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevDates}
                disabled={dateOffset === 0}
              >
                <ChevronLeft size={16} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextDates}
                disabled={dateOffset + 7 >= availableDates.length}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {visibleDates.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const dayName = format(date, 'EEE');
              const dayNumber = format(date, 'd');

              return (
                <button
                  key={date.toISOString()}
                  className={`flex flex-col items-center justify-center p-2 rounded-md focus:outline-none ${
                    isSelected
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => handleDateSelect(date)}
                >
                  <span className="text-xs">{dayName}</span>
                  <span className={`text-sm ${isSelected ? 'font-semibold' : ''}`}>
                    {dayNumber}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Seletor de horários */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-medium mb-3">Select Time</h3>

          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {timeSlots.map((slot) => (
                <button
                  key={slot.start}
                  className="py-2 px-3 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  onClick={() => handleTimeSelect(slot)}
                >
                  {formatDisplayTime(slot.start)}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No available time slots for this date.</p>
              <p className="text-sm text-gray-400 mt-1">Please try another date.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
