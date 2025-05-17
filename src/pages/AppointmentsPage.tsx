import React, { useState } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import AppointmentCard from '../components/appointments/AppointmentCard';
import { Calendar, Filter, Plus, Loader } from 'lucide-react';
import { useAppointments } from '../hooks/useAppointments';
import CreateAppointmentModal from '../components/modals/CreateAppointmentModal';
import EditAppointmentModal from '../components/modals/EditAppointmentModal';
import { Appointment } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const AppointmentsPage = () => {
  const { user } = useAuth();
  const { appointments, loading, error, refetch } = useAppointments();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<{ status: string; timeframe: string }>({
    status: 'all',
    timeframe: 'all',
  });
  const [page, setPage] = useState(1);
  const perPage = 6;

  const handleViewAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      if (!user?.id) {
        toast.error('User not authenticated');
        return;
      }

      if (!confirm('Are you sure you want to cancel this appointment?')) return;

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', id)
        .eq('user_id', user.id); // ✅ fix: added user_id filter correctly chained

      if (error) throw error;

      toast.success('Appointment canceled successfully');
      refetch();
    } catch (err) {
      const errorMessage =
        err && typeof err === 'object' && 'message' in err
          ? (err as Error).message
          : 'Failed to cancel appointment';
      console.error('Error canceling appointment:', err);
      toast.error(errorMessage);
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const now = new Date();
    const appointmentDate = new Date(appointment.startTime);

    const matchSearch =
      appointment.client?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.professional?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.status?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (filter.status !== 'all' && appointment.status !== filter.status) return false;
    if (filter.timeframe === 'today') return appointmentDate.toDateString() === now.toDateString();
    if (filter.timeframe === 'upcoming') return appointmentDate > now;
    if (filter.timeframe === 'past') return appointmentDate < now;

    return true;
  });

  const totalPages = Math.ceil(filteredAppointments.length / perPage);
  const paginatedAppointments = filteredAppointments.slice(
    (page - 1) * perPage,
    page * perPage
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
          Error loading appointments. Please try again later.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600">Manage your scheduled appointments</p>
        </div>
        <Button leftIcon={<Plus size={16} />} onClick={() => setShowCreateModal(true)}>
          New Appointment
        </Button>
      </div>

      <Input
        placeholder="Search by professional or status"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="mb-4"
      />

      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2 flex-grow">
              <Filter size={20} className="text-gray-500" />
              <h3 className="font-medium">Filters</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full sm:w-auto">
              <Select
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'confirmed', label: 'Confirmed' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'completed', label: 'Completed' },
                  { value: 'canceled', label: 'Canceled' },
                ]}
                value={filter.status}
                onChange={(event) => {
                  const value = typeof event === 'string' ? event : event.target.value;
                  setFilter({ ...filter, status: value });
                }}

              />
              <Select
                options={[
                  { value: 'all', label: 'All Time' },
                  { value: 'today', label: 'Today' },
                  { value: 'upcoming', label: 'Upcoming' },
                  { value: 'past', label: 'Past' },
                ]}
                value={filter.timeframe}
                onChange={(event) => {
                  const value = typeof event === 'string' ? event : event.target.value;
                  setFilter({ ...filter, timeframe: value });
                }}

              />
            </div>
          </div>
        </CardContent>
      </Card>

      {paginatedAppointments.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onView={() => handleViewAppointment(appointment)}
                onReschedule={() => handleRescheduleAppointment(appointment)}
                onCancel={() => handleCancelAppointment(appointment.id)}
              />
            ))}
          </div>

          <div className="flex justify-center items-center mt-6 space-x-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="p-12 flex flex-col items-center justify-center text-center">
            <Calendar className="h-12 w-12 text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No appointments found</h3>
            <p className="text-gray-500 mb-4">
              No appointments match your current filters.
            </p>
            <Button onClick={() => setFilter({ status: 'all', timeframe: 'all' })}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      )}

      {showCreateModal && (
        <CreateAppointmentModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            refetch();
            setShowCreateModal(false);
            toast.success('Appointment created successfully');
          }}
        />
      )}

      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSuccess={() => {
            refetch();
            setEditingAppointment(null);
            toast.success('Appointment updated successfully');
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default AppointmentsPage;
