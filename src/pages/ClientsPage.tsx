import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Loader, Plus, Edit, Trash2, Phone, Mail, History, Calendar, Clock, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Client, Appointment } from '../types';
import CreateClientModal from '../components/modals/CreateClientModal';
import EditClientModal from '../components/modals/EditClientModal';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { format, parseISO } from 'date-fns';
import Input from '../components/ui/Input';

// Interface para o modal de histórico
interface ClientHistoryModalProps {
  client: Client;
  onClose: () => void;
}

// Componente do modal de histórico
const ClientHistoryModal: React.FC<ClientHistoryModalProps> = ({ client, onClose }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientHistory = async () => {
      try {
        setLoading(true);
        
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
        
        setAppointments(data || []);
      } catch (err) {
        console.error('Error fetching client history:', err);
        setError('Failed to load appointment history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientHistory();
  }, [client.id]);

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'PPP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), 'p');
    } catch (error) {
      return 'Invalid time';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Appointment History: {client.name}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader className="w-8 h-8 animate-spin text-primary-600" />
            </div>
          ) : error ? (
            <div className="text-center text-error-500 py-8">{error}</div>
          ) : appointments.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No appointment history found for this client.
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="font-medium">{formatDate(appointment.start_time)}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <Clock className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{formatTime(appointment.start_time)} - {formatTime(appointment.end_time)}</span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-medium">
                          {appointment.specialty?.name || 'Unknown service'}
                        </p>
                        <p className="text-sm text-gray-500">
                          with {appointment.professional?.name || 'Unknown professional'}
                        </p>
                      </div>
                      {appointment.notes && (
                        <p className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                      appointment.status === 'canceled' ? 'bg-red-100 text-red-800' :
                      appointment.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status?.charAt(0).toUpperCase() + appointment.status?.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t">
          <Button variant="outline" onClick={onClose} className="w-full">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

const ClientsPage: React.FC = () => {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [clientsWithLastAppointment, setClientsWithLastAppointment] = useState<{[key: string]: string | null}>({});
  const [clientsWithLastAppointmentProfessional, setClientsWithLastAppointmentProfessional] = useState<{[key: string]: string | null}>({});
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingHistoryClient, setViewingHistoryClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchClients = async () => {
    try {
      setLoading(true);
      
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      // Buscar todos os calendários do usuário
      const { data: calendarsData, error: calendarsError } = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);

      if (calendarsError) throw calendarsError;

      if (!calendarsData || calendarsData.length === 0) {
        throw new Error('No calendars found');
      }

      const calendarIds = calendarsData.map(cal => cal.id);
      setCalendarId(calendarIds[0]); // Usar o primeiro calendário para criação de novos clientes

      // Buscar os clientes vinculados a qualquer um dos calendários do usuário
      // OU clientes que foram criados pelo usuário (owner_id = user.id)
      const { data, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .or(`calendar_id.in.(${calendarIds.join(',')}),owner_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;

      setClients(data || []);
      setFilteredClients(data || []);
      
      // Buscar o último agendamento para cada cliente
      if (data && data.length > 0) {
        const clientIds = data.map(client => client.id);
        
        // Buscar todos os agendamentos para esses clientes
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select(`
            client_id, 
            start_time,
            professional:professionals(id, name)
          `)
          .in('client_id', clientIds)
          .order('start_time', { ascending: false });
          
        if (appointmentsError) throw appointmentsError;
        
        // Processar os dados para obter o último agendamento de cada cliente
        const lastAppointments: {[key: string]: string | null} = {};
        const lastAppointmentProfessionals: {[key: string]: string | null} = {};
        
        data.forEach(client => {
          const clientAppointments = appointmentsData?.filter(apt => apt.client_id === client.id) || [];
          if (clientAppointments.length > 0) {
            lastAppointments[client.id] = clientAppointments[0].start_time;
            lastAppointmentProfessionals[client.id] = clientAppointments[0].professional?.name || null;
          } else {
            lastAppointments[client.id] = null;
            lastAppointmentProfessionals[client.id] = null;
          }
        });
        
        setClientsWithLastAppointment(lastAppointments);
        setClientsWithLastAppointmentProfessional(lastAppointmentProfessionals);
      }
      
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch clients';
      setError(message);
      console.error('Fetch clients error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Função para filtrar clientes com base no termo de pesquisa
  const filterClients = (term: string) => {
    if (!term.trim()) {
      setFilteredClients(clients);
      return;
    }
    
    const lowerTerm = term.toLowerCase();
    const filtered = clients.filter(client => 
      client.name?.toLowerCase().includes(lowerTerm) || 
      client.email?.toLowerCase().includes(lowerTerm) || 
      client.phone?.toLowerCase().includes(lowerTerm)
    );
    
    setFilteredClients(filtered);
  };

  // Atualizar os clientes filtrados quando o termo de pesquisa mudar
  useEffect(() => {
    filterClients(searchTerm);
  }, [searchTerm, clients]);

  const formatLastAppointment = (dateString: string | null) => {
    if (!dateString) return 'No appointments';
    try {
      return format(parseISO(dateString), 'PP');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      // Verificar se o cliente tem agendamentos
      const { count, error: countError } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', id);
        
      if (countError) throw countError;
      
      if (count && count > 0) {
        // Perguntar se o usuário quer excluir os agendamentos também
        const deleteAppointments = confirm(
          `This client has ${count} appointments. Delete all appointments as well?`
        );
        
        if (deleteAppointments) {
          // Excluir agendamentos primeiro
          const { error: deleteAptsError } = await supabase
            .from('appointments')
            .delete()
            .eq('client_id', id);
            
          if (deleteAptsError) throw deleteAptsError;
        } else {
          toast.error('Cannot delete client with appointments');
          return;
        }
      }

      // Excluir o cliente
      const { error: deleteError } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
        
      if (deleteError) throw deleteError;

      toast.success('Client deleted successfully');
      await fetchClients();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete client';
      toast.error(message);
      console.error('Delete client error:', err);
    }
  };

  useEffect(() => {
    fetchClients();
    
    // Configurar subscription para atualizações em tempo real
    const subscription = supabase
      .channel('clients_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'clients' }, 
        () => {
          console.log('New client added');
          fetchClients();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'clients' }, 
        () => {
          console.log('Client updated');
          fetchClients();
        }
      )
      .on('postgres_changes', 
        { event: 'DELETE', schema: 'public', table: 'clients' }, 
        () => {
          console.log('Client deleted');
          fetchClients();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-error-500">
          Error loading clients: {error}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-600">View, edit, and manage your clients</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
          Add Client
        </Button>
      </div>

      {/* Campo de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            placeholder="Search clients by name, email or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">
            {searchTerm ? 'No clients found matching your search' : 'No clients found'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">{client.name}</h3>
                {client.email && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Mail className="h-4 w-4 mr-1" />
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-sm text-gray-500 hover:text-primary-600"
                      onClick={() => {
                        const formattedPhone = client.phone?.replace(/\D/g, '');
                        window.open(`https://wa.me/${formattedPhone}`, '_blank');
                      }}
                    >
                      {client.phone}
                    </Button>
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>
                    Last appointment: {formatLastAppointment(clientsWithLastAppointment[client.id])}
                    {clientsWithLastAppointment[client.id] && clientsWithLastAppointmentProfessional[client.id] && (
                      <span className="ml-1">
                        with <span className="font-medium">{clientsWithLastAppointmentProfessional[client.id]}</span>
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<History size={14} />}
                    onClick={() => setViewingHistoryClient(client)}
                  >
                    History
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    leftIcon={<Edit size={14} />}
                    onClick={() => setEditingClient(client)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-error-500 border-error-500 hover:bg-error-50"
                    leftIcon={<Trash2 size={14} />}
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreateModal && calendarId && (
        <CreateClientModal
          calendarId={calendarId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchClients();
            setShowCreateModal(false);
          }}
        />
      )}

      {editingClient && (
        <EditClientModal
          client={editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={() => {
            fetchClients();
            setEditingClient(null);
          }}
        />
      )}

      {viewingHistoryClient && (
        <ClientHistoryModal
          client={viewingHistoryClient}
          onClose={() => setViewingHistoryClient(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ClientsPage;