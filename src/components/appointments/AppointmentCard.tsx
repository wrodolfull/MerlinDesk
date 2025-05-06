import React from 'react';
import { format, isValid, parseISO } from 'date-fns';
import { Appointment } from '../../types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Avatar from '../ui/Avatar';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';
import { Calendar, Clock, Info, MessageCircle } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onView?: (id: string) => void;
  onReschedule?: (id: string) => void;
  onCancel?: (id: string) => void;
}

const AppointmentCard = ({
  appointment,
  onView,
  onReschedule,
  onCancel,
}: AppointmentCardProps) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date';
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString?: string) => {
    if (!dateString) return 'No time';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'h:mm a') : 'Invalid time';
    } catch (error) {
      return 'Invalid time';
    }
  };

  const handleWhatsApp = () => {
    if (appointment.client?.phone) {
      const phone = appointment.client.phone.replace(/\D/g, ''); // remove tudo que não for número
      const url = `https://wa.me/${phone}`;
      window.open(url, '_blank');
    } else {
      alert('No phone number available for this client.');
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <Avatar
              src={appointment.professional?.avatar}
              alt={appointment.professional?.name || ''}
              size="sm"
            />
            <div>
              <CardTitle className="text-lg">{appointment.professional?.name}</CardTitle>
              <p className="text-sm text-gray-500">{appointment.specialty?.name}</p>
            </div>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2 text-gray-400" />
            <span>{formatDate(appointment.start_time)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-gray-400" />
            <span>
              {formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}
            </span>
          </div>
          {appointment.client && (
            <div className="flex items-center text-sm text-gray-600 mt-2">
              <span className="font-medium">Client:</span>
              <span className="ml-1">{appointment.client.name}</span>
            </div>
          )}
          {appointment.notes && (
            <div className="flex items-start text-sm text-gray-600 mt-2">
              <Info size={16} className="mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
              <p className="text-sm">{appointment.notes}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex flex-wrap gap-2 w-full">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onView(appointment.id)}
            >
              View
            </Button>
          )}
          {onReschedule && appointment.status !== 'canceled' && appointment.status !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => onReschedule(appointment.id)}
            >
              Reschedule
            </Button>
          )}
          {onCancel && appointment.status !== 'canceled' && appointment.status !== 'completed' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-error-500 border-error-500 hover:bg-error-50"
              onClick={() => onCancel(appointment.id)}
            >
              Cancel
            </Button>
          )}
          {appointment.client?.phone && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-green-600 border-green-600 hover:bg-green-50"
              onClick={handleWhatsApp}
            >
              <MessageCircle size={16} className="mr-1" />
              WhatsApp
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default AppointmentCard;
