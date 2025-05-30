import React, { useState, useEffect, useRef } from 'react';
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
  
  // Estados para notificações
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previousAppointmentCount, setPreviousAppointmentCount] = useState(0);

  // Função para tocar o som de notificação
  const playNotificationSound = () => {
    try {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error('Erro ao reproduzir áudio:', error);
        });
      }
    } catch (error) {
      console.error('Erro ao tocar notificação sonora:', error);
    }
  };

  // Função para mostrar notificação do navegador
  const showBrowserNotification = (appointment: any) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Novo Agendamento!', {
        body: `${appointment.client?.name || 'Cliente'} agendou para ${new Date(appointment.start_time).toLocaleString()}`,
        icon: '/favicon.ico',
        tag: 'new-appointment'
      });
    }
  };

  // Solicitar permissão para notificações do navegador
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Função para buscar nome do usuário
  const fetchUserName = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('User not authenticated');
  
      // Obter nome diretamente do Supabase Auth
      setUserName(user.user_metadata?.name || user.email || 'User');
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  // Função para calcular estatísticas baseada nos appointments
// Função para calcular estatísticas baseada nos appointments
const calculateStats = async (appointmentsList: Appointment[]) => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error('User not authenticated');

    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    
    // Datas para comparação (mês atual vs mês anterior)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Calcular estatísticas atuais
    const todayAppointments = appointmentsList.filter((apt) => {
      const aptDate = apt.startTime;
      return aptDate.toDateString() === now.toDateString();
    }).length;

    const completedThisWeek = appointmentsList.filter((apt) => {
      return apt.status === 'completed' && apt.startTime >= oneWeekAgo;
    }).length;

    const cancellations = appointmentsList.filter((apt) => apt.status === 'canceled').length;

    // Buscar dados do mês anterior para comparação
    const { data: previousMonthAppointments, error: prevApptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', previousMonthStart.toISOString())
      .lt('start_time', previousMonthEnd.toISOString());

    if (prevApptError) throw prevApptError;

    // Calcular estatísticas do mês anterior
    const previousMonthTotal = previousMonthAppointments?.length || 0;
    const currentMonthTotal = appointmentsList.filter((apt) => 
      apt.startTime >= currentMonthStart
    ).length;

    const previousMonthCompleted = previousMonthAppointments?.filter(
      apt => apt.status === 'completed'
    ).length || 0;
    const currentMonthCompleted = appointmentsList.filter((apt) => 
      apt.status === 'completed' && apt.startTime >= currentMonthStart
    ).length;

    const previousMonthCanceled = previousMonthAppointments?.filter(
      apt => apt.status === 'canceled'
    ).length || 0;
    const currentMonthCanceled = appointmentsList.filter((apt) => 
      apt.status === 'canceled' && apt.startTime >= currentMonthStart
    ).length;

    // Buscar dados de clientes para comparação
    const { count: currentClientsCount, error: clientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    if (clientsError) throw clientsError;

    const { count: previousClientsCount, error: prevClientsError } = await supabase
      .from('clients')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .lt('created_at', currentMonthStart.toISOString());

    if (prevClientsError) throw prevClientsError;

    // Calcular mudanças percentuais
    const calculatePercentageChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const todayAppointmentsChange = calculatePercentageChange(currentMonthTotal, previousMonthTotal);
    const totalClientsChange = calculatePercentageChange(currentClientsCount ?? 0, previousClientsCount ?? 0);
    const completedChange = calculatePercentageChange(currentMonthCompleted, previousMonthCompleted);
    const cancellationsChange = calculatePercentageChange(currentMonthCanceled, previousMonthCanceled);

    // Atualizar estado com dados reais
    setStats(prevStats => ({
      todayAppointments,
      totalClients: currentClientsCount ?? 0,
      completedThisWeek,
      cancellations,
      todayAppointmentsChange,
      totalClientsChange,
      completedChange,
      cancellationsChange,
    }));

  } catch (error) {
    console.error('Error calculating stats:', error);
    toast.error(error instanceof Error ? error.message : 'Failed to load dashboard data');
  }
};


  // Carregar nome do usuário uma vez
  useEffect(() => {
    fetchUserName();
  }, []);

  // Calcular estatísticas sempre que appointments mudarem
  useEffect(() => {
    if (!loading && appointments.length >= 0) {
      calculateStats(appointments);
    }
  }, [appointments, loading]);

  // Configurar subscription para atualizações em tempo real com notificações
  useEffect(() => {
    console.log('🔄 Configurando subscription para atualizações em tempo real');
    
    const subscription = supabase
      .channel('appointments_changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'appointments' }, 
        (payload) => {
          console.log('📥 Novo agendamento inserido:', payload);
          
          // Tocar som de notificação
          playNotificationSound();
          
          // Mostrar toast de notificação
          toast.success('🎉 Novo agendamento recebido!', {
            duration: 5000,
            position: 'top-right',
            style: {
              background: '#10B981',
              color: 'white',
            },
          });

          // Mostrar notificação do navegador
          if (payload.new) {
            showBrowserNotification(payload.new);
          }
          
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
    }, 300000);

    return () => {
      console.log('❌ Cancelando subscription e polling');
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, [refetch]);

  // Efeito para detectar novos agendamentos
  useEffect(() => {
    if (!loading && appointments.length > 0) {
      // Detectar novos agendamentos comparando contagem
      if (previousAppointmentCount > 0 && appointments.length > previousAppointmentCount) {
        const latestAppointment = appointments[appointments.length - 1];
        
        playNotificationSound();
        
        toast.success(
          `🎉 Novo agendamento: ${latestAppointment.client?.name || 'Cliente'}`,
          {
            duration: 5000,
            position: 'top-right',
          }
        );

        showBrowserNotification(latestAppointment);
      }
      
      setPreviousAppointmentCount(appointments.length);
    }
  }, [loading, appointments, previousAppointmentCount]);

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

  // Definir os cards de estatísticas
  const statCards = [
    {
      title: 'Agendamentos do dia',
      value: stats.todayAppointments.toString(),
      change: `+${stats.todayAppointmentsChange}%`,
      trend: 'up',
      icon: <CalendarCheck className="h-5 w-5 text-blue-500" />,
    },
    {
      title: 'Clientes',
      value: stats.totalClients.toString(),
      change: `+${stats.totalClientsChange}%`,
      trend: 'up',
      icon: <Users className="h-5 w-5 text-purple-500" />,
    },
    {
      title: 'Finalizados essa semana',
      value: stats.completedThisWeek.toString(),
      change: `+${stats.completedChange}`,
      trend: 'up',
      icon: <Clock className="h-5 w-5 text-teal-500" />,
    },
    {
      title: 'Cancelamentos',
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
      {/* Elemento de áudio para notificação sonora */}
      <audio
        ref={audioRef}
        preload="auto"
        style={{ display: 'none' }}
      >
        <source src="/assets/notificacao.mp3" type="audio/mpeg" />
        Seu navegador não suporta o elemento de áudio.
      </audio>

      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 5000,
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
        }}
      />
      
      {/* Cabeçalho de boas-vindas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Olá, {userName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground mt-1">Tem compromisso hoje? Vem ver o que te espera!</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button asChild variant="outline">
            <Link to="/appointments" className="inline-flex items-center">
              <CalendarCheck className="mr-2 h-4 w-4" />
              Ver agendamentos
            </Link>
          </Button>
          <Button asChild>
            <Link to="/calendars">
              <Clock className="mr-2 h-4 w-4" />
              Organizar calendário
            </Link>
          </Button>
        </div>
      </div>

      {/* Cards de estatísticas */}
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
                {stat.change} do mês passado
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CALENDAR */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Seus agendamentos</h2>
          <Link to="/appointments"><Button variant="outline" size="sm">Ver todos</Button></Link>
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

      {/* Upcoming Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>O que te espera!</CardTitle>
            <CardDescription>Em breve na sua agenda: próximos 24h!</CardDescription>
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
                  <p>Sem agendamentos futuros</p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link to="/appointments">Ver todos os agendamentos</Link>
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
