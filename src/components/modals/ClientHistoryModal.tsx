import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import Button from '../ui/Button';
import { Loader, Calendar, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Client, Appointment } from '../../types';
import { format, parseISO } from 'date-fns';
import { useTranslation } from 'react-i18next';

interface ClientHistoryModalProps {
  client: Client;
  onClose: () => void;
  isOpen: boolean;
}

const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({ client, onClose, isOpen }) => {
  const { t } = useTranslation();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const fetchClientHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            professional:professionals(name),
            specialty:specialties(name)
          `)
          .eq('client_id', client.id)
          .order('start_time', { ascending: false });
          
        if (error) throw error;
        
        const mappedData = data?.map(apt => ({
            ...apt,
            professional: apt.professional,
            specialty: apt.specialty,
        })) || [];
        
        setAppointments(mappedData as any);

      } catch (err) {
        console.error('Error fetching client history:', err);
        setError(t('clientHistoryModal.loadError'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientHistory();
  }, [client.id, isOpen, t]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return t('clientHistoryModal.invalidDate');
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'p');
    } catch (error) {
      return t('clientHistoryModal.invalidTime');
    }
  };
  
  const getStatusClasses = (status?: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'canceled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-white dark:bg-gray-800 rounded-lg shadow-xl">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('clientHistoryModal.title')}: {client.name}</h2>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
              <span className="text-2xl font-light text-gray-500 dark:text-gray-400">&times;</span>
            </Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader className="w-10 h-10 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-10">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-10">
              <p>{t('clientHistoryModal.noHistory')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center text-gray-700 dark:text-gray-300">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">{formatDate(appointment.start_time)}</span>
                      </div>
                      <div className="flex items-center mt-1 text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                      </div>
                      <div className="mt-3">
                        <p className="text-md font-semibold text-gray-800 dark:text-gray-200">
                          {appointment.specialty?.name || t('clientHistoryModal.unknownService')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {t('clientHistoryModal.with')} {appointment.professional?.name || t('clientHistoryModal.unknownProfessional')}
                        </p>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-100 dark:bg-gray-700/50 p-3 rounded">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                    {appointment.status && (
                       <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusClasses(appointment.status)}`}>
                         {t(`appointmentStatus.${appointment.status}`)}
                       </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onClose} className="w-full">
            {t('clientHistoryModal.close')}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ClientHistoryModal;