import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Loader, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Client } from '../types';
import CreateClientModal from '../components/modals/CreateClientModal';
import EditClientModal from '../components/modals/EditClientModal';
import toast, { Toaster } from 'react-hot-toast';

const ClientsPage = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [calendarId, setCalendarId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const { data: calendarsData } = await supabase
        .from('calendars')
        .select('id')
        .limit(1);

      const foundCalendarId = calendarsData?.[0]?.id;

      if (!foundCalendarId) {
        throw new Error('No calendar found');
      }

      setCalendarId(foundCalendarId);

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('calendar_id', foundCalendarId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setClients(data || []);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch clients'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client?')) return;
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      if (error) throw error;
      toast.success('Client deleted successfully');
      fetchClients();
    } catch (err) {
      console.error('Error deleting client:', err);
      toast.error('Failed to delete client');
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

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
          Error loading clients. Please try again later.
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

      {clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500">No clients found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card key={client.id}>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold">{client.name}</h3>
                <p className="text-sm text-gray-500">{client.email}</p>
                {client.phone && (
                  <p className="text-sm text-gray-500">{client.phone}</p>
                )}
                <div className="flex space-x-2 mt-4">
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
    </DashboardLayout>
  );
};

export default ClientsPage;
