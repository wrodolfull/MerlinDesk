import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Loader, Edit, Trash2, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import EditProfessionalModal from '../components/modals/EditProfessionalModal';
import CreateProfessionalModal from '../components/modals/CreateProfessionalModal';
import WorkingHoursModal from '../components/modals/WorkingHoursModal';
import { useSpecialties } from '../hooks/useSpecialties';
import { useCalendars } from '../hooks/useCalendars';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';

const ProfessionalsPage = () => {
  const { specialties } = useSpecialties();
  const { calendars } = useCalendars();
  const defaultCalendarId = calendars?.[0]?.id;
  const { user } = useAuth();

  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProfessional, setEditingProfessional] = useState(null);
  const [showCreateProfessional, setShowCreateProfessional] = useState(false);
  const [managingHours, setManagingHours] = useState(null);

  const fetchProfessionals = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('professionals')
        .select(`
          *,
          specialty:specialties(id, name)
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      setProfessionals(data || []);
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfessionals();
  }, [user]);

  const handleDeleteProfessional = async (id) => {
    try {
      const { error } = await supabase.from('professionals').delete().eq('id', id);
      if (error) throw error;
      await fetchProfessionals();
      toast.success('Professional deleted successfully');
    } catch (err) {
      console.error('Error deleting professional:', err);
      toast.error('Failed to delete professional');
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
          Error loading professionals. Please try again later.
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Professionals</h1>
          <p className="text-gray-600">Manage your team of professionals</p>
        </div>
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setShowCreateProfessional(true)}
        >
          Add Professional
        </Button>
      </div>

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
                    {professional.specialty?.name || 'No specialty assigned'}
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

      {showCreateProfessional && (
        <CreateProfessionalModal
          calendarId={defaultCalendarId}
          specialties={specialties}
          onClose={() => setShowCreateProfessional(false)}
          onSuccess={async () => {
            await fetchProfessionals();
            setShowCreateProfessional(false);
          }}
        />
      )}

      {editingProfessional && (
        <EditProfessionalModal
          professional={editingProfessional}
          specialties={specialties}
          onClose={() => setEditingProfessional(null)}
          onSuccess={async () => {
            await fetchProfessionals();
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