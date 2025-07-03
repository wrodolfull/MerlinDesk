import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Loader, Plus, Edit, Trash2, Clock, Search, 
  Mail, Phone, Calendar, Tag, Users, TrendingUp, AlertCircle, CheckCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EditProfessionalModal from '../components/modals/EditProfessionalModal';
import CreateProfessionalModal from '../components/modals/CreateProfessionalModal';
import WorkingHoursModal from '../components/modals/WorkingHoursModal';
import { useSpecialties } from '../hooks/useSpecialties';
import { useCalendars } from '../hooks/useCalendars';
import Avatar from '../components/ui/Avatar';
import toast, { Toaster } from 'react-hot-toast';
import { Professional } from '../types';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

type ProfessionalWithCreatedAt = Professional & { createdAt: Date };

const ProfessionalsPage: React.FC = () => {
  const { specialties } = useSpecialties();
  const { calendars } = useCalendars();
  const defaultCalendarId = calendars?.[0]?.id;
  const { user } = useAuth();

  const [professionals, setProfessionals] = useState<ProfessionalWithCreatedAt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [managingHours, setManagingHours] = useState<Professional | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'specialties'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Estatísticas
  const stats = useMemo(() => {
    const total = professionals.length;
    const uniqueSpecialties = new Set(professionals.flatMap(p => p.specialties?.map(s => s.name) || []));
    const noSpecialty = professionals.filter(p => !p.specialties || p.specialties.length === 0).length;
    return {
      total,
      uniqueSpecialties: uniqueSpecialties.size,
      noSpecialty
    };
  }, [professionals]);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          professional_specialties(
            specialty_id,
            specialties(
              id,
              name
            )
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const mappedData: ProfessionalWithCreatedAt[] = (data || []).map((pro: any) => {
        const specialties = (pro.professional_specialties || [])
          .map((ps: any) => ps.specialties)
          .filter((s: any) => s);
        
        return {
          ...pro,
          specialties: specialties,
          createdAt: pro.created_at ? new Date(pro.created_at) : new Date(),
        };
      });
      setProfessionals(mappedData);
      setError(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch professionals';
      setError(message);
      console.error('Fetch professionals error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessionals();
  }, [user]);

  const handleDeleteProfessional = async (id: string) => {
    if (!confirm('Tem certeza que quer deletar esse profissional?')) return;
    try {
      const { error } = await supabase.from('professionals').delete().eq('id', id);
      if (error) throw error;
      toast.success('Profissional deletado com sucesso!');
      await fetchProfessionals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao deleter profissional';
      toast.error(message);
      console.error('Delete professional error:', err);
    }
  };

  // Extrair todas as especialidades para o filtro
  const allSpecialties = useMemo(() => {
    return Array.from(new Set(professionals.flatMap(p => p.specialties?.map(s => s.name) || [])));
  }, [professionals]);

  // Filtragem e ordenação
  const filteredProfessionals = useMemo(() => {
    let filtered = professionals.filter(professional => {
      const matchesSearch = 
        professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (professional.email && professional.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSpecialty = !selectedSpecialty || 
        professional.specialties?.some(s => s.name === selectedSpecialty);
      return matchesSearch && matchesSpecialty;
    });
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = a.createdAt?.getTime() || 0;
          bValue = b.createdAt?.getTime() || 0;
          break;
        case 'specialties':
          aValue = a.specialties?.length || 0;
          bValue = b.specialties?.length || 0;
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
  }, [professionals, searchTerm, selectedSpecialty, sortBy, sortOrder]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
            <p className="text-gray-600">Carregando profissionais...</p>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao carregar profissionais</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchProfessionals}>Tentar novamente</Button>
        </div>
      </DashboardLayout>
    );
  }

  if (!defaultCalendarId) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Primeiro, crie um calendário</h3>
            <p className="text-gray-500 mb-4">
              Para criar profissionais, você precisa ter pelo menos um calendário configurado. 
              Os profissionais são vinculados aos seus calendários.
            </p>
            <Button 
              onClick={() => window.location.href = '/calendars'}
              leftIcon={<Calendar size={16} />}
            >
              Criar calendário
            </Button>
          </div>
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
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600 mt-1">Gerencie seu time de profissionais.</p>
        </div>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
          className="w-full lg:w-auto"
        >
          Novo Profissional
        </Button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Users className="w-5 h-5 text-primary-600" />
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
                <Tag className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Especialidades únicas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.uniqueSpecialties}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Sem especialidade</p>
                <p className="text-2xl font-bold text-gray-900">{stats.noSpecialty}</p>
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
                  placeholder="Buscar profissionais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedSpecialty}
                onChange={value => setSelectedSpecialty(String(value))}
                className="w-48"
                options={[
                  { value: '', label: 'Todas as especialidades' },
                  ...allSpecialties.map(s => ({ value: s, label: s }))
                ]}
              />
              <Select
                value={sortBy}
                onChange={value => setSortBy(value as 'name' | 'createdAt' | 'specialties')}
                className="w-40"
                options={[
                  { value: 'name', label: 'Nome' },
                  { value: 'createdAt', label: 'Data' },
                  { value: 'specialties', label: 'Qtd. Especialidades' }
                ]}
              />
              <Button
                variant="outline"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
              {(searchTerm || selectedSpecialty) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSpecialty('');
                  }}
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProfessionals.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                {searchTerm || selectedSpecialty ? (
                  <>
                    <Search className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum profissional encontrado</h3>
                    <p className="text-gray-500 mb-4">Tente ajustar os filtros de busca</p>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedSpecialty('');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </>
                ) : specialties.length === 0 ? (
                  <>
                    <Tag className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Primeiro, crie especialidades</h3>
                    <p className="text-gray-500 mb-4">
                      Para criar profissionais, você precisa ter pelo menos uma especialidade configurada. 
                      Os profissionais são vinculados às especialidades dos seus calendários.
                    </p>
                    <Button 
                      onClick={() => window.location.href = '/specialties'}
                      leftIcon={<Tag size={16} />}
                    >
                      Criar especialidade
                    </Button>
                  </>
                ) : (
                  <>
                    <Users className="h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum profissional encontrado</h3>
                    <p className="text-gray-500 mb-4">
                      Comece criando seu primeiro profissional para gerenciar sua equipe
                    </p>
                    <Button onClick={() => setShowCreateModal(true)}>
                      Criar profissional
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          filteredProfessionals.map((professional) => (
            <Card key={professional.id} className="hover:shadow-lg transition-shadow duration-200 flex flex-col">
              <CardContent className="p-6 flex-grow">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 h-full">
                  <div className="flex gap-4 items-start flex-1">
                    <Avatar
                      src={professional.avatar}
                      alt={professional.name}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{professional.name}</h3>
                      <div className="mt-1 space-y-1 text-sm text-gray-500">
                        {professional.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {professional.email}
                          </div>
                        )}
                        {professional.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {professional.phone}
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4" />
                          <span className="truncate">
                            {professional.specialties?.length
                              ? professional.specialties.map((s) => s.name).join(', ')
                              : 'Sem especialidade'}
                          </span>
                        </div>
                        {professional.bio && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{professional.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                </div>
              </CardContent>
              <div className="border-t p-4 bg-gray-50">
                <div className="flex flex-wrap items-center justify-end gap-2">
                  <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Clock size={14} />}
                      onClick={async () => {
                        const confirmed = confirm(`Fechar agenda de ${professional.name}?`);
                        if (!confirmed) return;

                        const { error } = await supabase.rpc('fechar_agenda_profissional', {
                          prof_id: professional.id
                        });

                        if (error) {
                          toast.error('Erro ao fechar agenda');
                          console.error(error);
                        } else {
                          toast.success('Agenda fechada com sucesso!');
                        }
                      }}
                    >
                      Fechar agenda
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Clock size={14} />}
                      onClick={() => setManagingHours(professional)}
                    >
                      Expediente
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<Edit size={14} />}
                      onClick={() => setEditingProfessional(professional)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      leftIcon={<Trash2 size={14} />}
                      onClick={() => handleDeleteProfessional(professional.id)}
                    >
                      Deletar
                    </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Modais */}
      {showCreateModal && (
        <CreateProfessionalModal
          calendarId={defaultCalendarId}
          specialties={specialties}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            fetchProfessionals();
            setShowCreateModal(false);
          }}
        />
      )}

      {editingProfessional && (
        <EditProfessionalModal
          professional={editingProfessional}
          specialties={specialties}
          onClose={() => setEditingProfessional(null)}
          onSuccess={() => {
            fetchProfessionals();
            setEditingProfessional(null);
          }}
        />
      )}

      {managingHours && (
        <WorkingHoursModal
          professionalId={managingHours.id}
          professionalName={managingHours.name}
          onClose={() => setManagingHours(null)}
          onSuccess={() => {
            setManagingHours(null);
            toast.success('Working hours updated successfully');
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default ProfessionalsPage;
