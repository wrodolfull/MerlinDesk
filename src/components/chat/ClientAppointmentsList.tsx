// src/components/chat/ClientAppointmentsList.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, User } from 'lucide-react';
import { Spinner } from '../ui/Spinner';
import Button from '../ui/Button';

interface ClientAppointmentsListProps {
  clientId: string;
}

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  professional_name?: string;
  service_name?: string;
}

const ClientAppointmentsList: React.FC<ClientAppointmentsListProps> = ({ clientId }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            id, 
            start_time, 
            end_time, 
            status,
            professionals:professional_id (name),
            services:service_id (name)
          `)
          .eq('client_id', clientId)
          .order('start_time', { ascending: false })
          .limit(5);
        
        if (error) throw error;
        
        const formattedAppointments = data.map(appointment => ({
          id: appointment.id,
          start_time: appointment.start_time,
          end_time: appointment.end_time,
          status: appointment.status,
          professional_name: appointment.professionals?.name,
          service_name: appointment.services?.name
        }));
        
        setAppointments(formattedAppointments);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Não foi possível carregar os agendamentos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAppointments();
  }, [clientId]);
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'confirmed': return 'Confirmado';
      case 'pending': return 'Pendente';
      case 'canceled': return 'Cancelado';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-6">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-gray-500">
        {error}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <Calendar className="h-10 w-10 mx-auto mb-2 text-gray-400" />
        <p>Este cliente não possui agendamentos</p>
      </div>
    );
  }

  return (
    <div className="max-h-80 overflow-y-auto">
      {appointments.map((appointment) => (
        <div key={appointment.id} className="p-3 border-b hover:bg-gray-50">
          <div className="flex justify-between items-start mb-1">
            <div className="font-medium">{appointment.service_name || 'Consulta'}</div>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(appointment.status)}`}>
              {getStatusText(appointment.status)}
            </span>
          </div>
          <div className="text-sm text-gray-600 flex items-center mb-1">
            <Calendar className="h-3 w-3 mr-1" />
            {format(parseISO(appointment.start_time), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </div>
          <div className="text-sm text-gray-600 flex items-center mb-1">
            <Clock className="h-3 w-3 mr-1" />
            {format(parseISO(appointment.start_time), "HH:mm")} - 
            {format(parseISO(appointment.end_time), "HH:mm")}
          </div>
          {appointment.professional_name && (
            <div className="text-sm text-gray-600 flex items-center">
              <User className="h-3 w-3 mr-1" />
              {appointment.professional_name}
            </div>
          )}
        </div>
      ))}
      <div className="p-3 text-center">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => window.open('/appointments', '_blank')}
        >
          Ver todos os agendamentos
        </Button>
      </div>
    </div>
  );
};

export default ClientAppointmentsList;
