import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { 
  Loader, Plus, Edit, Trash2, Clock, Search, 
  Mail, Phone, Calendar, Tag
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

const ProfessionalsPage: React.FC = () => {
  const { specialties } = useSpecialties();
  const { calendars } = useCalendars();
  const defaultCalendarId = calendars?.[0]?.id;
  const { user } = useAuth();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingProfessional, setEditingProfessional] = useState<Professional | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [managingHours, setManagingHours] = useState<Professional | null>(null);
  
  // Novos estados para filtros (removido showInactive)
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          specialties:professional_specialties(
            specialties(id, name)
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const mappedData: Professional[] = (data || []).map((pro: any) => ({
        ...pro,
        specialties: (pro.specialties || []).map((rel: any) => rel.specialties),
      }));
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

  // Filtragem de profissionais (removida a filtragem por status)
  const filteredProfessionals = professionals.filter(professional => {
    const matchesSearch = 
      professional.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (professional.email && professional.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesSpecialty = !selectedSpecialty || 
      professional.specialties?.some(s => s.name === selectedSpecialty);
    
    return matchesSearch && matchesSpecialty;
  });

  // Extrair todas as especialidades para o filtro
  const allSpecialties = Array.from(
    new Set(professionals.flatMap(p => p.specialties?.map(s => s.name) || []))
  );

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
          Error loading professionals: {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!defaultCalendarId) {
    return (
      <DashboardLayout>
        <div className="text-center text-gray-600">
          <p className="mb-4">Por favor, crie um calendário antes de criar profissionais.</p>
          <Button onClick={() => window.location.href = '/calendars'}>
            Vá para Calendário
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profissionais</h1>
          <p className="text-gray-600 mt-1">Gerencie seu time de profissionais.</p>
        </div>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          Criar profissional
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profissionais</CardTitle>
          <CardDescription>
            Visualize e gerencie todos os profissionais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Procure profissionais..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={selectedSpecialty || ''}
                onChange={(e) => setSelectedSpecialty(e.target.value || null)}
              >
                <option value="">Todas as especialidades</option>
                {allSpecialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredProfessionals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500">Nenhum profissional encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProfessionals.map((professional) => (
                <div
                  key={professional.id}
                  className="border rounded-lg p-4 bg-white"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <Avatar
                        src={professional.avatar}
                        alt={professional.name}
                        size="lg"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{professional.name}</h3>
                        </div>
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
                            {professional.specialties?.length
                              ? professional.specialties.map((s) => s.name).join(', ')
                              : 'No specialty assigned'}
                          </div>
                          {professional.bio && (
                            <p className="text-sm text-gray-600 mt-2">{professional.bio}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
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
                        variant="outline"
                        size="sm"
                        className="text-error-500 border-error-500 hover:bg-error-50"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => handleDeleteProfessional(professional.id)}
                      >
                        Deletar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
