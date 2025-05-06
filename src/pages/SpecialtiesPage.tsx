import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Plus, Loader, Edit, Trash2, Clock, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import CreateSpecialtyModal from '../components/modals/CreateSpecialtyModal';
import EditSpecialtyModal from '../components/modals/EditSpecialtyModal';
import { Specialty } from '../types';

const SpecialtiesPage = () => {
  const { user } = useAuth();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);
  const [calendarIds, setCalendarIds] = useState<string[]>([]);

  const fetchCalendarIds = async () => {
    try {
      if (!user) return [];

      const { data, error } = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);

      if (error) throw error;

      if (!data || data.length === 0) {
        throw new Error('No calendar found. Please create a calendar first.');
      }

      return data.map((c) => c.id);
    } catch (err) {
      console.error('Error fetching calendar IDs:', err);
      return [];
    }
  };

  const fetchSpecialties = async () => {
    try {
      setLoading(true);

      if (!user) {
        setSpecialties([]);
        return;
      }

      const ids = await fetchCalendarIds();
      setCalendarIds(ids);

      if (ids.length === 0) {
        setError(new Error('No calendar found. Please create a calendar first.'));
        return;
      }

      const { data, error } = await supabase
        .from('specialties')
        .select('*')
        .in('calendar_id', ids);

      if (error) throw error;
      setSpecialties(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch specialties'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpecialties();
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from('specialties').delete().eq('id', id);
      if (error) throw error;
      fetchSpecialties();
    } catch (error) {
      console.error('Error deleting specialty:', error);
      alert('Failed to delete specialty');
    }
  };

  const handleCreateClick = async () => {
    if (calendarIds.length === 0) {
      alert('Please create a calendar first before adding specialties.');
      return;
    }
    setShowCreateModal(true);
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
        <div className="text-center text-error-500">{error.message}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Specialties</h1>
          <p className="text-gray-600">Manage your service offerings</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={handleCreateClick}>
          Add Specialty
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {specialties.map((specialty) => (
          <Card key={specialty.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{specialty.name}</h3>
                  <div className="flex items-center mt-2 text-gray-600">
                    <Clock size={16} className="mr-1" />
                    <span>{specialty.duration} minutes</span>
                  </div>
                  {specialty.price && (
                    <div className="flex items-center mt-1 text-gray-600">
                      <DollarSign size={16} className="mr-1" />
                      <span>${specialty.price}</span>
                    </div>
                  )}
                  {specialty.description && (
                    <p className="mt-2 text-sm text-gray-600">{specialty.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    className="p-1 text-gray-500 hover:text-gray-700"
                    onClick={() => setEditingSpecialty(specialty)}
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="p-1 text-gray-500 hover:text-error-500"
                    onClick={() => handleDelete(specialty.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {specialties.length === 0 && (
          <div className="col-span-3">
            <Card>
              <CardContent className="p-12 flex flex-col items-center justify-center text-center">
                <Clock className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No specialties found</h3>
                <p className="text-gray-500">Get started by adding your first specialty.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showCreateModal && calendarIds.length > 0 && (
        <CreateSpecialtyModal
          calendarId={calendarIds[0]} // usa o primeiro calendarId para criação
          onClose={() => setShowCreateModal(false)}
          onSuccess={fetchSpecialties}
        />
      )}

      {editingSpecialty && (
        <EditSpecialtyModal
          specialty={editingSpecialty}
          onClose={() => setEditingSpecialty(null)}
          onSuccess={fetchSpecialties}
        />
      )}
    </DashboardLayout>
  );
};

export default SpecialtiesPage;
