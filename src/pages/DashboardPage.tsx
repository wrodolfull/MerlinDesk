import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Calendar, Users, Clock, TrendingUp, ArrowUp, ArrowDown, CalendarCheck, MessageSquare, ArrowRight } from 'lucide-react';
import AppointmentCalendar from '../components/calendar/AppointmentCalendar';
import CreateAppointmentModal from '../components/modals/CreateAppointmentModal';
import EditAppointmentModal from '../components/modals/EditAppointmentModal';
import { supabase } from '../lib/supabase';
import { Appointment } from '../types';
import toast, { Toaster } from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { useAppointments } from '../hooks/useAppointments';

const DashboardPage: React.FC = () => {
  const { appointments, loading, error, refetch } = useAppointments();
  
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [initialDate, setInitialDate] = useState<Date | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [userName, setUserName] = useState('');

  // Função para buscar dados adicionais (nome do usuário e estatísticas)
  const fetchAdditionalData = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');
      
      // Buscar nome do usuário
      const { data: userData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();
        
      if (!profileError && userData) {
        setUserName(userData.full_name || 'User');
      }

      const now = new Date();
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);

      // Calcular estatísticas com base nos appointments já carregados
      const todayAppointments = appointments.filter((apt) => {
        const aptDate = apt.startTime;
        return aptDate.toDateString() === now.toDateString();
      }).length;

      const completedThisWeek = appointments.filter((apt) => {
        return apt.status === 'completed' && apt.startTime >= oneWeekAgo;
      }).length;

      const cancellations = appointments.filter((apt) => apt.status === 'canceled').length;

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
      console.error('Error fetching additional data:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to load dashboard data');
    }
  };

  // Configurar subscription para atualizações em tempo real
useEffect(() => {
  console.log('🔄 Configurando subscription para atualizações em tempo real');
  
  const subscription = supabase
    .channel('appointments_changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'appointments' }, 
      (payload) => {
        console.log('📥 Novo agendamento inserido:', payload);
        refetch();
      }
    )
    .on('postgres_changes', 
      { event: 'UPDATE', schema: 'public', table: 'appointments' }, 
      (payload) => {
        console.log('🔄 Agendamento atualizado:', payload);
        refetch();
      }
    )
    .on('postgres_changes', 
      { event: 'DELETE', schema: 'public', table: 'appointments' }, 
      (payload) => {
        console.log('🗑️ Agendamento excluído:', payload);
        refetch();
      }
    )
    .subscribe();

  // Polling como fallback
  const interval = setInterval(() => {
    console.log('🔍 Polling para novos agendamentos');
    refetch();
  }, 30000);

  return () => {
    console.log('❌ Cancelando subscription e polling');
    subscription.unsubscribe();
    clearInterval(interval);
  };
}, [refetch]);

  // Efeito para atualizar estatísticas quando os appointments mudarem
  useEffect(() => {
    if (!loading && appointments.length > 0) {
      fetchAdditionalData();
    }
  }, [loading, appointments]);

  // Configurar subscription para atualizações em tempo real
  useEffect(() => {
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, () => {
        refetch();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

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
      refetch();
    } catch (err) {
      console.error('Error canceling appointment:', err);
      toast.error('Failed to cancel appointment');
    }
  };

  const todayAppointments = appointments
    .filter((appointment) => {
      const aptDate = appointment.startTime;
      const today = new Date();
      return aptDate.toDateString() === today.toDateString();
    })
    .slice(0, 3);

  const upcomingAppointments = appointments
    .filter((appointment) => {
      const aptDate = appointment.startTime;
      const now = new Date();
      return aptDate > now && appointment.status !== 'canceled';
    })
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 3);

  // Definir os cards de estatísticas no estilo do primeiro código
  const statCards = [
    {
      title: 'Total Appointments',
      value: stats.todayAppointments.toString(),
      change: `+${stats.todayAppointmentsChange}%`,
      trend: 'up',
      icon: <CalendarCheck className="h-5 w-5 text-blue-500" />,
    },
    {
      title: 'Total Clients',
      value: stats.totalClients.toString(),
      change: `+${stats.totalClientsChange}%`,
      trend: 'up',
      icon: <Users className="h-5 w-5 text-purple-500" />,
    },
    {
      title: 'Completed This Week',
      value: stats.completedThisWeek.toString(),
      change: `+${stats.completedChange}`,
      trend: 'up',
      icon: <Clock className="h-5 w-5 text-teal-500" />,
    },
    {
      title: 'Cancellations',
      value: stats.cancellations.toString(),
      change: `${stats.cancellationsChange}%`,
      trend: 'down',
      icon: <MessageSquare className="h-5 w-5 text-amber-500" />,
    },
  ];
 
  // Exibir mensagem de carregamento enquanto os dados estão sendo buscados
  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  // Exibir mensagem de erro se houver algum problema
  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center text-red-500 p-4">
          Error loading appointments: {error}
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout>
      <Toaster />
      
      {/* Cabeçalho de boas-vindas estilizado como no primeiro código */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Here's what's happening with your scheduling today.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button asChild variant="outline">
            <Link to="/appointments" className="inline-flex items-center">
              <CalendarCheck className="mr-2 h-4 w-4" />
              View Appointments
            </Link>
          </Button>
          <Button asChild>
            <Link to="/calendars">
              <Clock className="mr-2 h-4 w-4" />
              Manage Calendar
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas estilizados como no primeiro código */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              {stat.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CALENDAR */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Appointments Calendar</h2>
          <Link to="/appointments"><Button variant="outline" size="sm">View All</Button></Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <AppointmentCalendar
              appointments={appointments}
              onEventClick={(appointmentId) => {
                console.log("Clicked appointment ID:", appointmentId);
                const appointment = appointments.find((apt) => apt.id === appointmentId);
                if (appointment) {
                  console.log("Found appointment:", appointment);
                  setEditingAppointment({ ...appointment });
                } else {
                  console.error("Appointment not found with ID:", appointmentId);
                }
              }}
              onDateSelect={(date) => {
                console.log("Selected date:", date);
                setInitialDate(date);
                setShowCreateModal(true);
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments no estilo do primeiro código */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your schedule for the next 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.length > 0 ? (
                upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="flex items-center p-3 rounded-lg border">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3">
                      {appointment.client?.name?.substring(0, 2) || 'CL'}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{appointment.client?.name || 'Client'}</h4>
                      <p className="text-sm text-muted-foreground">
                        {appointment.specialty?.name || 'Appointment'} • {appointment.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleViewAppointment(appointment)}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No upcoming appointments</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/appointments">View All Appointments</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Modais */}
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
            refetch();
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
            refetch();
          }}
        />
      )}
    </DashboardLayout>
  );
};

export default DashboardPage;
