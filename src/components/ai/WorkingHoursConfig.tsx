import React from 'react';
import { Card, CardContent } from '../ui/Card';
import Input from '../ui/Input';
import { Clock } from 'lucide-react';

interface WorkingHoursConfigProps {
  value: {
    is24h: boolean;
    schedule: {
      [key: string]: {
        isEnabled: boolean;
        startTime?: string;
        endTime?: string;
      };
    };
  };
  onChange: (value: WorkingHoursConfigProps['value']) => void;
}

const DAYS = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

const WorkingHoursConfig = ({ value, onChange }: WorkingHoursConfigProps) => {
  const handleIs24hChange = () => {
    onChange({
      ...value,
      is24h: !value.is24h,
    });
  };

  const handleDayToggle = (dayId: string) => {
    onChange({
      ...value,
      schedule: {
        ...value.schedule,
        [dayId]: {
          ...value.schedule[dayId],
          isEnabled: !value.schedule[dayId].isEnabled,
        },
      },
    });
  };

  const handleTimeChange = (dayId: string, field: 'startTime' | 'endTime', time: string) => {
    onChange({
      ...value,
      schedule: {
        ...value.schedule,
        [dayId]: {
          ...value.schedule[dayId],
          [field]: time,
        },
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <Clock size={16} />
          <span>Working Hours</span>
        </label>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={value.is24h}
            onChange={handleIs24hChange}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-600">24/7 Service</span>
        </label>
      </div>

      {!value.is24h && (
        <div className="space-y-2">
          {DAYS.map((day) => (
            <div key={day.id} className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 w-32">
                <input
                  type="checkbox"
                  checked={value.schedule[day.id].isEnabled}
                  onChange={() => handleDayToggle(day.id)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">{day.label}</span>
              </label>
              {value.schedule[day.id].isEnabled && (
                <div className="flex items-center space-x-2 flex-1">
                  <Input
                    type="time"
                    value={value.schedule[day.id].startTime}
                    onChange={(e) => handleTimeChange(day.id, 'startTime', e.target.value)}
                    className="w-32"
                  />
                  <span className="text-gray-500">to</span>
                  <Input
                    type="time"
                    value={value.schedule[day.id].endTime}
                    onChange={(e) => handleTimeChange(day.id, 'endTime', e.target.value)}
                    className="w-32"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkingHoursConfig;