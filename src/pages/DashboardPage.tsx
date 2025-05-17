import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Calendar, Users, Clock, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react';
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';
import AppointmentCard from '../components/appointments/AppointmentCard';
import CreateAppointmentModal from '../components/modals/CreateAppointmentModal';
import EditAppointmentModal from '../components/modals/EditAppointmentModal';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalClients: 0,
    completedThisWeek: 0,
    cancellations: 0,
    todayAppointmentsChange: 0,
    totalClientsChange: 0,
    completedChange: 0,
    cancellationsChange: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');

      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          client:clients(*),
          professional:professionals(*),
          specialty:specialties(*)
        `)
        .order('start_time', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData ?? []);

      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);

      const todayAppointments = appointmentsData?.filter((apt) => {
        const aptDate = new Date(apt.start_time);
        return aptDate.toDateString() === now.toDateString();
      }).length ?? 0;

      const completedThisWeek = appointmentsData?.filter((apt) => {
        const aptDate = new Date(apt.start_time);
        return apt.status === 'completed' && aptDate >= oneWeekAgo;
      }).length ?? 0;

      const cancellations = appointmentsData?.filter((apt) => apt.status === 'canceled').length ?? 0;

      const { count: clientsCount, error: clientsError } = await supabase
        .from('clients')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (clientsError) throw clientsError;

      setStats({
        todayAppointments,
        totalClients: clientsCount ?? 0,
        completedThisWeek,
        cancellations,
        todayAppointmentsChange: 12,
        totalClientsChange: 8,
        completedChange: 4,
        cancellationsChange: -2,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleViewAppointment = (appointment: Appointment) => {
    setEditingAppointment({ ...appointment });
  };

  const handleRescheduleAppointment = (appointment: Appointment) => {
    setEditingAppointment({ ...appointment });
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      if (!confirm('Are you sure you want to cancel this appointment?')) return;

      const { error } = await supabase
        .from('appointments')
        .update({ status: 'canceled' })
        .eq('id', id);

      if (error) throw error;

      toast.success('Appointment canceled successfully');
      fetchData();
    } catch (err) {
      console.error('Error canceling appointment:', err);
      toast.error('Failed to cancel appointment');
    }
  };

  const todayAppointments = appointments
    .filter((appointment) => {
      const aptDate = new Date(appointment.startTime);
      const today = new Date();
      return aptDate.toDateString() === today.toDateString();
    })
    .slice(0, 3);

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, Admin User</p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* ...Cards omitted for brevity... */}
      </div>

      {/* CALENDAR */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Appointments Calendar</h2>
          <Link to="/appointments"><Button variant="outline" size="sm">View All</Button></Link>
        </div>
        <AppointmentCalendar
          appointments={appointments}
          onEventClick={(appointmentId) => {
            const appointment = appointments.find((apt) => apt.id === appointmentId);
            if (appointment) setEditingAppointment({ ...appointment });
          }}
          onDateSelect={(date) => {
            setInitialDate(date);
            setShowCreateModal(true);
          }}
        />
      </div>

      {/* TODAY'S APPOINTMENTS */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Today's Appointments</h2>
          <Link to="/appointments"><Button variant="outline" size="sm">View All</Button></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                onView={() => handleViewAppointment(appointment)}
                onReschedule={() => handleRescheduleAppointment(appointment)}
                onCancel={() => handleCancelAppointment(appointment.id)}
              />
            ))
          ) : (
            <div className="col-span-3">
              <Card><CardContent className="p-6 text-center"><p className="text-gray-500">No appointments scheduled for today.</p></CardContent></Card>
            </div>
          )}
        </div>
      </div>

      {showCreateModal && (
        <CreateAppointmentModal
          initialDate={initialDate ?? undefined}
          onClose={() => {
            setShowCreateModal(false);
            setInitialDate(null);
          }}
          onSuccess={() => {
            toast.success('Appointment created successfully');
            setShowCreateModal(false);
            setInitialDate(null);
            fetchData();
          }}
        />
      )}

      {editingAppointment && (
        <EditAppointmentModal
          appointment={editingAppointment}
          onClose={() => setEditingAppointment(null)}
          onSuccess={() => {
            toast.success('Appointment updated successfully');
            setEditingAppointment(null);
            fetchData();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
