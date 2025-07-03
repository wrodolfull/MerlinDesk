import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { 
  Plus, 
  Loader, 
  Edit, 
  Trash2, 
  Clock, 
  DollarSign, 
  Search, 
  Filter,
  TrendingUp,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle,
  MoreVertical,
  Copy,
  Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useSpecialties } from '../hooks/useSpecialties';
import CreateSpecialtyModal from '../components/modals/CreateSpecialtyModal';
import EditSpecialtyModal from '../components/modals/EditSpecialtyModal';
import { Specialty } from '../types';
import toast, { Toaster } from 'react-hot-toast';

const SpecialtiesPage: React.FC = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'duration' | 'price' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [priceFilter, setPriceFilter] = useState<'all' | 'free' | 'paid'>('all');
  const [calendarIds, setCalendarIds] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    totalDuration: 0,
    totalValue: 0,
    averagePrice: 0
  });

  // Usar o hook existente
  const { specialties, loading, error, refetch } = useSpecialties();

  const fetchCalendarIds = async (): Promise<string[]> => {
    try {
      if (!user) return [];

      const { data, error } = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);

      if (error) throw error;
      return data?.map((c) => c.id) || [];
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch calendar IDs';
      toast.error(message);
      console.error('Error fetching calendar IDs:', err);
      return [];
    }
  };

  // Calcular estatísticas
  useEffect(() => {
    const total = specialties.length;
    const totalDuration = specialties.reduce((sum, spec) => sum + spec.duration, 0);
    const totalValue = specialties.reduce((sum, spec) => sum + (spec.price || 0), 0);
    const averagePrice = total > 0 ? totalValue / total : 0;

    setStats({
      total,
      totalDuration,
      totalValue,
      averagePrice
    });
  }, [specialties]);

  // Buscar calendários na inicialização
  useEffect(() => {
    fetchCalendarIds().then(setCalendarIds);
  }, [user]);

  // Filtrar e ordenar especialidades
  const filteredAndSortedSpecialties = useMemo(() => {
    let filtered = specialties.filter(specialty => {
      const matchesSearch = specialty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           specialty.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPriceFilter = priceFilter === 'all' ||
        (priceFilter === 'free' && !specialty.price) ||
        (priceFilter === 'paid' && specialty.price);

      return matchesSearch && matchesPriceFilter;
    });

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'duration':
          aValue = a.duration;
          bValue = b.duration;
          break;
        case 'price':
          aValue = a.price || 0;
          bValue = b.price || 0;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
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
  }, [specialties, searchTerm, sortBy, sortOrder, priceFilter]);

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja deletar essa especialidade? Esta ação não pode ser desfeita.')) return;
    
    try {
      const { error } = await supabase.from('specialties').delete().eq('id', id);
      if (error) throw error;
      
      toast.success('Especialidade deletada com sucesso!');
      await refetch();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao deletar especialidade';
      toast.error(message);
      console.error('Delete specialty error:', err);
    }
  };

  const handleCreateClick = () => {
    if (calendarIds.length === 0) {
      toast.error('Crie um calendário primeiro antes de adicionar especialidades.');
      return;
    }
    setShowCreateModal(true);
  };

  const formatPrice = (price?: number) => {
    if (!price) return 'Gratuito';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando especialidades...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar especialidades</h3>
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
          <h1 className="text-3xl font-bold text-gray-900">Especialidades</h1>
          <p className="text-gray-600 mt-1">Gerencie seus serviços e especialidades</p>
        </div>
        <Button 
          leftIcon={<Plus size={16} />} 
          onClick={handleCreateClick}
          className="w-full lg:w-auto"
        >
          Nova Especialidade
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
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Tempo Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatDuration(stats.totalDuration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Preço Médio</p>
                <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.averagePrice)}</p>
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
                  placeholder="Buscar especialidades..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={priceFilter}
                onChange={(value) => setPriceFilter(value as 'all' | 'free' | 'paid')}
                className="w-32"
                options={[
                  { value: 'all', label: 'Todos' },
                  { value: 'free', label: 'Gratuitos' },
                  { value: 'paid', label: 'Pagos' }
                ]}
              />

              <Select
                value={sortBy}
                onChange={(value) => setSortBy(value as 'name' | 'duration' | 'price' | 'createdAt')}
                className="w-40"
                options={[
                  { value: 'name', label: 'Nome' },
                  { value: 'duration', label: 'Duração' },
                  { value: 'price', label: 'Preço' },
                  { value: 'createdAt', label: 'Data' }
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

      {/* Lista de Especialidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedSpecialties.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                {searchTerm || priceFilter !== 'all' ? (
                  <>
                    <Search className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma especialidade encontrada</h3>
                    <p className="text-gray-500 mb-4">Tente ajustar os filtros de busca</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setPriceFilter('all');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </>
                ) : calendarIds.length === 0 ? (
                  <>
                    <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Primeiro, crie um calendário</h3>
                    <p className="text-gray-500 mb-4">
                      Para criar especialidades, você precisa ter pelo menos um calendário configurado. 
                      As especialidades são vinculadas aos seus calendários.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/calendars'}
                      leftIcon={<Calendar size={16} />}
                    >
                      Criar calendário
                    </Button>
                  </>
                ) : (
                  <>
                    <Clock className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma especialidade encontrada</h3>
                    <p className="text-gray-500 mb-4">
                      Comece criando sua primeira especialidade para oferecer seus serviços
                    </p>
                    <Button onClick={handleCreateClick}>
                      Criar especialidade
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredAndSortedSpecialties.map((specialty) => (
            <Card key={specialty.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{specialty.name}</h3>
                    {specialty.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{specialty.description}</p>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      onClick={() => setEditingSpecialty(specialty)}
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-500 hover:text-error-500 hover:bg-error-50 rounded-lg transition-colors"
                      onClick={() => handleDelete(specialty.id)}
                      title="Excluir"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600">
                      <Clock size={16} className="mr-2" />
                      <span className="text-sm font-medium">{formatDuration(specialty.duration)}</span>
                    </div>
                    <div className="flex items-center">
                      {specialty.price ? (
                        <span className="text-lg font-bold text-green-600">
                          {formatPrice(specialty.price)}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          Gratuito
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Criado em {specialty.createdAt.toLocaleDateString('pt-BR')}</span>
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
          {filteredAndSortedSpecialties.length} de {specialties.length} especialidades encontradas
        </div>
      )}

      {/* Modais */}
      {showCreateModal && calendarIds.length > 0 && (
        <CreateSpecialtyModal
          calendarId={calendarIds[0]}
          onClose={() => setShowCreateModal(false)}
          onSuccess={refetch}
        />
      )}

      {editingSpecialty && (
        <EditSpecialtyModal
          specialty={editingSpecialty}
          onClose={() => setEditingSpecialty(null)}
          onSuccess={refetch}
        />
      )}
    </DashboardLayout>
  );
};

export default SpecialtiesPage;
