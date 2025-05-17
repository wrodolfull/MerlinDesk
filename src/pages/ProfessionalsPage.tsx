import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Loader, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EditProfessionalModal from '../components/modals/EditProfessionalModal';
import CreateProfessionalModal from '../components/modals/CreateProfessionalModal';
import WorkingHoursModal from '../components/modals/WorkingHoursModal';
import { useSpecialties } from '../hooks/useSpecialties';
import { useCalendars } from '../hooks/useCalendars';
import Avatar from '../components/ui/Avatar';
import toast, { Toaster } from 'react-hot-toast';
import { Professional } from '../types'; // Certifique-se de criar este tipo ou importar

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
    if (!confirm('Are you sure you want to delete this professional?')) return;
    try {
      const { error } = await supabase.from('professionals').delete().eq('id', id);
      if (error) throw error;
      toast.success('Professional deleted successfully');
      await fetchProfessionals();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete professional';
      toast.error(message);
      console.error('Delete professional error:', err);
    }
  };

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
          <p className="mb-4">Please create a calendar first before adding professionals.</p>
          <Button onClick={() => window.location.href = '/calendars'}>
            Go to Calendars
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professionals</h1>
          <p className="text-gray-600">Manage your team of professionals</p>
        </div>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreateModal(true)}
        >
          Add Professional
        </Button>
      </div>

      {professionals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No professionals found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionals.map((professional) => (
            <Card key={professional.id}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar
                    src={professional.avatar}
                    alt={professional.name}
                    size="lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{professional.name}</h3>
                    <p className="text-sm text-gray-500">{professional.email}</p>
                    {professional.phone && (
                      <p className="text-sm text-gray-500">{professional.phone}</p>
                    )}
                    {professional.bio && (
                      <p className="text-sm text-gray-600 mt-2">{professional.bio}</p>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      {professional.specialties?.length
                        ? professional.specialties.map((s) => s.name).join(', ')
                        : 'No specialty assigned'}
                    </p>
                    <div className="flex space-x-2 mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Clock size={14} />}
                        onClick={() => setManagingHours(professional)}
                      >
                        Hours
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<Edit size={14} />}
                        onClick={() => setEditingProfessional(professional)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-error-500 border-error-500 hover:bg-error-50"
                        leftIcon={<Trash2 size={14} />}
                        onClick={() => handleDeleteProfessional(professional.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
