import React from 'react';
import { format } from 'date-fns';
import { Client, Professional, Specialty } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { Calendar, Clock, User, DollarSign, Check, ChevronLeft, Phone } from 'lucide-react';

interface BookingConfirmationProps {
  bookingData: {
    specialty?: Specialty;
    professional?: Professional;
    date?: Date;
    timeSlot?: { start: string; end: string };
    client?: Client;
  };
  onConfirm: () => void;
  onBack: () => void;
}

export const BookingConfirmation = ({
  bookingData,
  onConfirm,
  onBack,
}: BookingConfirmationProps) => {
  const { specialty, professional, date, timeSlot, client } = bookingData;
  
  if (!specialty || !professional || !date || !timeSlot || !client) {
    return <div>Missing booking information</div>;
  }
  
  // Format date and time for display
  const formatDate = (date: Date) => format(date, 'EEEE, MMMM d, yyyy');
  const formatTime = (isoString: string) => format(new Date(isoString), 'h:mm a');

  // Format phone number for WhatsApp
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, '');
  };

  const openWhatsApp = () => {
    if (client.phone) {
      const phone = formatPhoneForWhatsApp(client.phone);
      const message = encodeURIComponent(
        `Hi ${client.name}! Your appointment with ${professional.name} is confirmed for ${formatDate(date)} at ${formatTime(timeSlot.start)}.`
      );
      window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
    }
  };

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
          Voltar
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">Confirmar agendamento</h2>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-primary-100 p-2 rounded-full mr-4">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Data</h3>
                <p className="text-gray-600">{formatDate(date)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary-100 p-2 rounded-full mr-4">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Hora</h3>
                <p className="text-gray-600">
                  {formatTime(timeSlot.start)} - {formatTime(timeSlot.end)}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-primary-100 p-2 rounded-full mr-4">
                <User className="h-6 w-6 text-primary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Profissional</h3>
                <p className="text-gray-600">{professional.name}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-secondary-100 p-2 rounded-full mr-4">
                <Check className="h-6 w-6 text-secondary-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Serviço</h3>
                <p className="text-gray-600">{specialty.name}</p>
                <p className="text-gray-500 text-sm">{specialty.duration} minutos</p>
              </div>
            </div>
            
            {specialty.price && (
              <div className="flex items-start">
                <div className="bg-secondary-100 p-2 rounded-full mr-4">
                  <DollarSign className="h-6 w-6 text-secondary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Preço</h3>
                  <p className="text-gray-600">${specialty.price}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Suas Informações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Nome:</span> {client.name}
            </div>
            <div>
              <span className="font-medium">E-mail:</span> {client.email}
            </div>
            <div>
              <span className="font-medium">Telefone:</span> {client.phone}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button onClick={onConfirm}>
              Confirmar Agendamento
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};