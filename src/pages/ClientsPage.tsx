import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { 
  Loader, 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  History, 
  Search,
  Users,
  AlertCircle,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';
import CreateClientModal from '../components/modals/CreateClientModal';
import EditClientModal from '../components/modals/EditClientModal';
import ClientHistoryModal from '../components/modals/ClientHistoryModal';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { useClients } from '../hooks/useClients';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ClientsPage: React.FC = () => {
  const { user } = useAuth();
  const { clients, loading, error, refetch } = useClients();
  
  const [clientsWithLastAppointment, setClientsWithLastAppointment] = useState<{[key: string]: string | null}>({});
  const [clientsWithAppointmentCount, setClientsWithAppointmentCount] = useState<{[key: string]: number}>({});
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingHistoryClient, setViewingHistoryClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'lastAppointment' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterBy, setFilterBy] = useState<'all' | 'withAppointments' | 'withoutAppointments'>('all');

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!user?.id) return;
  
      try {
        const { data: calendarsData, error: calendarsError } = await supabase
          .from('calendars')
          .select('id')
          .eq('owner_id', user.id)
          .limit(1);
    
        if (calendarsError) throw calendarsError;
        if (calendarsData && calendarsData.length > 0) {
          setCalendarId(calendarsData[0].id);
        } else {
           console.warn("Nenhum calendário encontrado para o usuário. A criação de clientes pode ser desativada.");
        }
      } catch (e) {
        toast.error("Falha ao buscar calendário.");
        console.error(e);
      }
    };
    
    fetchInitialData();
  }, [user]);

  useEffect(() => {
    const fetchLastAppointments = async () => {
      if (!clients || clients.length === 0) return;

      const clientIds = clients.map(client => client.id);
      
      try {
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('client_id, start_time')
          .in('client_id', clientIds)
          .order('start_time', { ascending: false });
          
        if (appointmentsError) throw appointmentsError;
        
        const lastAppointments: {[key: string]: string | null} = {};
        const appointmentCounts: {[key: string]: number} = {};
        const seenClients = new Set();

        // Contar agendamentos por cliente
        appointmentsData?.forEach(apt => {
          appointmentCounts[apt.client_id] = (appointmentCounts[apt.client_id] || 0) + 1;
          
          if (!seenClients.has(apt.client_id)) {
            lastAppointments[apt.client_id] = apt.start_time;
            seenClients.add(apt.client_id);
          }
        });
        
        setClientsWithLastAppointment(lastAppointments);
        setClientsWithAppointmentCount(appointmentCounts);
      } catch (e) {
        console.error("Falha ao buscar últimos agendamentos", e);
      }
    };

    fetchLastAppointments();
  }, [clients]);

  const sortedAndFilteredClients = useMemo(() => {
    let filtered = clients.filter(client => {
      const matchesSearch = client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone?.includes(searchTerm);

      const matchesFilter = filterBy === 'all' ||
        (filterBy === 'withAppointments' && clientsWithLastAppointment[client.id]) ||
        (filterBy === 'withoutAppointments' && !clientsWithLastAppointment[client.id]);

      return matchesSearch && matchesFilter;
    });
    
    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'lastAppointment':
          aValue = clientsWithLastAppointment[a.id] ? parseISO(clientsWithLastAppointment[a.id]!).getTime() : 0;
          bValue = clientsWithLastAppointment[b.id] ? parseISO(clientsWithLastAppointment[b.id]!).getTime() : 0;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [clients, searchTerm, sortBy, sortOrder, filterBy, clientsWithLastAppointment]);

  const handleCreateClick = () => {
    if (!calendarId) {
      toast.error('Você precisa ter um calendário configurado para adicionar clientes.');
      return;
    }
    setShowCreateModal(true);
  };

  const handleDeleteClient = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja deletar este cliente? Esta ação não pode ser desfeita.')) return;
    
    try {
      const { error: deleteError } = await supabase.from('clients').delete().eq('id', id);
      if (deleteError) throw deleteError;
      
      toast.success('Cliente deletado com sucesso!');
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao deletar cliente.';
      toast.error(message);
      console.error('Delete client error:', err);
    }
  };

  const formatLastAppointment = (dateString: string | null) => {
    if (!dateString) return 'Nunca agendou';
    try {
      return format(parseISO(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return 'Data inválida';
    }
  };
  
  const stats = useMemo(() => {
    const total = clients.length;
    const withAppointments = Object.keys(clientsWithLastAppointment).length;
    const totalAppointments = Object.values(clientsWithAppointmentCount).reduce((sum, count) => sum + count, 0);
    const averageAppointments = total > 0 ? totalAppointments / total : 0;

    return {
      total,
      withAppointments,
      totalAppointments,
      averageAppointments
    };
  }, [clients, clientsWithLastAppointment, clientsWithAppointmentCount]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando clientes...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-error-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar clientes</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={refetch}>Tentar novamente</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
          <p className="text-gray-600 mt-1">Gerencie sua lista de clientes</p>
        </div>
        <Button 
          leftIcon={<Plus size={16} />} 
          onClick={handleCreateClick}
          className="w-full lg:w-auto"
          disabled={!calendarId}
        >
          Novo Cliente
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Com Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.withAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Agendamentos</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Média por Cliente</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageAppointments.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Busca */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar clientes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={filterBy}
                onChange={(value) => setFilterBy(value as 'all' | 'withAppointments' | 'withoutAppointments')}
                className="w-48"
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'withAppointments', label: 'Com agendamentos' },
                  { value: 'withoutAppointments', label: 'Sem agendamentos' }
                ]}
              />

              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value as 'name' | 'email' | 'lastAppointment' | 'createdAt')}
                className="w-40"
                options={[
                  { value: 'name', label: 'Nome' },
                  { value: 'email', label: 'E-mail' },
                  { value: 'lastAppointment', label: 'Último agendamento' },
                  { value: 'createdAt', label: 'Data de criação' }
                ]}
              />

              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedAndFilteredClients.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                {searchTerm || filterBy !== 'all' ? (
                  <>
                    <Search className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                    <p className="text-gray-500 mb-4">Tente ajustar os filtros de busca</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setFilterBy('all');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </>
                ) : (
                  <>
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                    <p className="text-gray-500 mb-4">Comece criando seu primeiro cliente</p>
                    <Button onClick={handleCreateClick} disabled={!calendarId}>
                      Criar cliente
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          sortedAndFilteredClients.map(client => (
            <Card key={client.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{client.name}</h3>
                    <p className="text-sm text-gray-600">
                      Último agendamento: {formatLastAppointment(clientsWithLastAppointment[client.id] || null)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setViewingHistoryClient(client)}
                      title="Ver histórico"
                    >
                      <History size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setEditingClient(client)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                      onClick={() => handleDeleteClient(client.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {client.email && (
                    <div className="flex items-center text-gray-600">
                      <Mail size={16} className="mr-2" />
                      <span className="text-sm">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center text-gray-600">
                      <Phone size={16} className="mr-2" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-4">
                    <span>
                      {clientsWithAppointmentCount[client.id] || 0} agendamento(s)
                    </span>
                    <div className="flex items-center">
                      <CheckCircle size={12} className="mr-1 text-green-500" />
                      <span>Ativo</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resultados da busca */}
      {searchTerm && (
        <div className="mt-6 text-center text-sm text-gray-600">
          {sortedAndFilteredClients.length} de {clients.length} clientes encontrados
        </div>
      )}

      {/* Modais */}
      {showCreateModal && calendarId && (
        <CreateClientModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
            toast.success('Cliente criado com sucesso!');
          }}
          calendarId={calendarId}
        />
      )}

      {editingClient && (
        <EditClientModal
          isOpen={!!editingClient}
          onClose={() => setEditingClient(null)}
          onSuccess={() => {
            setEditingClient(null);
            refetch();
            toast.success('Cliente atualizado com sucesso!');
          }}
          client={editingClient}
        />
      )}

      {viewingHistoryClient && (
        <ClientHistoryModal
          isOpen={!!viewingHistoryClient}
          client={viewingHistoryClient}
          onClose={() => setViewingHistoryClient(null)}
        />
      )}
    </DashboardLayout>
  );
};

export default ClientsPage;
