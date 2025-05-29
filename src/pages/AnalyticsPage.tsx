import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { 
  BarChart, Calendar, Clock, Users, ArrowUp, ArrowDown, Download, Mail, Filter, 
  RefreshCw, ChevronDown, Printer, FileText, Share2, Sliders, PieChart, TrendingUp,
  DollarSign, UserCheck, CalendarCheck, ChevronLeft, ChevronRight
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isValid, subMonths, addMonths, startOfYear, endOfYear, subYears } from 'date-fns';
import { Loader } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Tipos para os filtros
interface DateRange {
  startDate: Date;
  endDate: Date;
}

interface AnalyticsFilters {
  dateRange: DateRange;
  professionals: string[];
  specialties: string[];
  clients: string[];
  status: string[];
}

const AnalyticsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentView, setCurrentView] = useState<'month' | 'quarter' | 'year'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [professionals, setProfessionals] = useState<any[]>([]);
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  
  const chartsRef = useRef<HTMLDivElement>(null);
  
  const [filters, setFilters] = useState<AnalyticsFilters>({
    dateRange: {
      startDate: startOfMonth(new Date()),
      endDate: endOfMonth(new Date())
    },
    professionals: [],
    specialties: [],
    clients: [],
    status: ['pending', 'confirmed', 'completed', 'canceled']
  });

  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeClients: 0,
    averageDuration: 0,
    revenue: 0,
    completionRate: 0,
    cancellationRate: 0,
    appointmentsChange: 0,
    clientsChange: 0,
    durationChange: 0,
    revenueChange: 0,
  });

  const [monthlyData, setMonthlyData] = useState<ChartData<'line'>>({
    labels: [],
    datasets: [],
  });

  const [serviceData, setServiceData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });
  
  const [statusData, setStatusData] = useState<ChartData<'doughnut'>>({
    labels: [],
    datasets: [],
  });
  
  const [clientsData, setClientsData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });
  
  const [professionalData, setProfessionalData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });
  
  const [hourlyData, setHourlyData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: [],
  });

  // Função para atualizar os filtros
  const updateFilters = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  };

  // Função para navegar entre períodos
  const navigatePeriod = (direction: 'prev' | 'next') => {
    let newDate;
    
    if (currentView === 'month') {
      newDate = direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
    } else if (currentView === 'quarter') {
      newDate = direction === 'prev' ? subMonths(currentDate, 3) : addMonths(currentDate, 3);
    } else {
      newDate = direction === 'prev' ? subYears(currentDate, 1) : addMonths(currentDate, 12);
    }
    
    setCurrentDate(newDate);
    
    const startDate = currentView === 'month' 
      ? startOfMonth(newDate)
      : currentView === 'quarter'
        ? subMonths(startOfMonth(newDate), 2)
        : startOfYear(newDate);
        
    const endDate = currentView === 'month'
      ? endOfMonth(newDate)
      : currentView === 'quarter'
        ? endOfMonth(newDate)
        : endOfYear(newDate);
        
    updateFilters({
      dateRange: { startDate, endDate }
    });
  };

  // Função para buscar dados de referência (profissionais, especialidades, clientes)
  const fetchReferenceData = async () => {
    try {
      if (!user?.id) return;
      
      // Buscar calendários do usuário
      const { data: calendars, error: calendarError } = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);
        
      if (calendarError) throw calendarError;
      if (!calendars || calendars.length === 0) return;
      
      const calendarIds = calendars.map(c => c.id);
      
      // Buscar profissionais
      const { data: proData, error: proError } = await supabase
        .from('professionals')
        .select('id, name')
        .in('calendar_id', calendarIds);
        
      if (proError) throw proError;
      setProfessionals(proData || []);
      
      // Buscar especialidades
      const { data: specData, error: specError } = await supabase
        .from('specialties')
        .select('id, name')
        .eq('user_id', user.id);
        
      if (specError) throw specError;
      setSpecialties(specData || []);
      
      // Buscar clientes
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .select('id, name')
        .in('calendar_id', calendarIds);
        
      if (clientError) throw clientError;
      setClients(clientData || []);
      
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const fetchAnalytics = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
  
    try {
      setLoading(true);
      
      // Buscar calendários do usuário
      const { data: calendars, error: calendarError } = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);
        
      if (calendarError) throw calendarError;
      if (!calendars || calendars.length === 0) {
        setLoading(false);
        return;
      }
      
      const calendarIds = calendars.map(c => c.id);
      
      // Construir a consulta base
      let query = supabase
        .from('appointments')
        .select(`
          *,
          specialty:specialties(id, name, duration, price),
          professional:professionals(id, name),
          client:clients(id, name)
        `)
        .in('calendar_id', calendarIds)
        .gte('start_time', filters.dateRange.startDate.toISOString())
        .lte('start_time', filters.dateRange.endDate.toISOString());
      
      // Aplicar filtros adicionais
      if (filters.professionals.length > 0) {
        query = query.in('professional_id', filters.professionals);
      }
      
      if (filters.specialties.length > 0) {
        query = query.in('specialty_id', filters.specialties);
      }
      
      if (filters.clients.length > 0) {
        query = query.in('client_id', filters.clients);
      }
      
      if (filters.status.length > 0 && filters.status.length < 4) {
        query = query.in('status', filters.status);
      }
      
      const { data: appointments, error: appointmentsError } = await query;
  
      if (appointmentsError) throw appointmentsError;

      // Buscar dados do período anterior para comparação
      const previousStartDate = subMonths(filters.dateRange.startDate, 1);
      const previousEndDate = subMonths(filters.dateRange.endDate, 1);
      
      let previousQuery = supabase
        .from('appointments')
        .select(`id, specialty:specialties(price)`)
        .in('calendar_id', calendarIds)
        .gte('start_time', previousStartDate.toISOString())
        .lte('start_time', previousEndDate.toISOString());
        
      // Aplicar os mesmos filtros
      if (filters.professionals.length > 0) {
        previousQuery = previousQuery.in('professional_id', filters.professionals);
      }
      
      if (filters.specialties.length > 0) {
        previousQuery = previousQuery.in('specialty_id', filters.specialties);
      }
      
      if (filters.clients.length > 0) {
        previousQuery = previousQuery.in('client_id', filters.clients);
      }
      
      if (filters.status.length > 0 && filters.status.length < 4) {
        previousQuery = previousQuery.in('status', filters.status);
      }
      
      const { data: previousAppointments, error: prevError } = await previousQuery;
      
      if (prevError) throw prevError;

      // Calculate statistics
      const validAppointments = appointments?.filter(apt => 
        apt.start_time && isValid(parseISO(apt.start_time))
      ) || [];

      const totalAppointments = validAppointments.length;
      const uniqueClients = new Set(validAppointments.map(apt => apt.client_id)).size;
      
      const totalDuration = validAppointments.reduce((sum, apt) => 
        sum + (apt.specialty?.duration || 0), 0
      );
      const averageDuration = totalAppointments ? Math.round(totalDuration / totalAppointments) : 0;

      const totalRevenue = validAppointments.reduce((sum, apt) => 
        sum + (apt.specialty?.price || 0), 0
      );
      
      // Calcular taxas de conclusão e cancelamento
      const completedCount = validAppointments.filter(apt => apt.status === 'completed').length;
      const canceledCount = validAppointments.filter(apt => apt.status === 'canceled').length;
      
      const completionRate = totalAppointments ? Math.round((completedCount / totalAppointments) * 100) : 0;
      const cancellationRate = totalAppointments ? Math.round((canceledCount / totalAppointments) * 100) : 0;

      // Calcular mudanças percentuais
      const prevTotalAppointments = previousAppointments?.length || 0;
      const prevRevenue = (previousAppointments || []).reduce((sum, apt) => 
        sum + (apt.specialty?.price || 0), 0
      );
      
      const appointmentsChange = prevTotalAppointments 
        ? Math.round(((totalAppointments - prevTotalAppointments) / prevTotalAppointments) * 100) 
        : 0;
        
      const revenueChange = prevRevenue 
        ? Math.round(((totalRevenue - prevRevenue) / prevRevenue) * 100) 
        : 0;

      // Prepare daily appointments data
      const daysInRange = eachDayOfInterval({ 
        start: filters.dateRange.startDate, 
        end: filters.dateRange.endDate 
      });
      
      const dailyAppointments = daysInRange.map(date => {
        const dayAppointments = validAppointments.filter(apt => 
          format(parseISO(apt.start_time), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        return {
          date: format(date, 'MMM dd'),
          count: dayAppointments.length,
          revenue: dayAppointments.reduce((sum, apt) => sum + (apt.specialty?.price || 0), 0),
        };
      });

      // Prepare service statistics
      const serviceStats: Record<string, { count: number; revenue: number }> =
        validAppointments.reduce((acc, apt) => {
          const serviceName = apt.specialty?.name || 'Unknown';
          if (!acc[serviceName]) {
            acc[serviceName] = { count: 0, revenue: 0 };
          }
          acc[serviceName].count++;
          acc[serviceName].revenue += apt.specialty?.price || 0;
          return acc;
        }, {} as Record<string, { count: number; revenue: number }>);
      
      // Prepare status statistics
      const statusStats = {
        pending: validAppointments.filter(apt => apt.status === 'pending').length,
        confirmed: validAppointments.filter(apt => apt.status === 'confirmed').length,
        completed: validAppointments.filter(apt => apt.status === 'completed').length,
        canceled: validAppointments.filter(apt => apt.status === 'canceled').length,
      };
      
      // Prepare client statistics
      const clientStats: Record<string, { count: number; revenue: number }> =
        validAppointments.reduce((acc, apt) => {
          const clientName = apt.client?.name || 'Unknown';
          if (!acc[clientName]) {
            acc[clientName] = { count: 0, revenue: 0 };
          }
          acc[clientName].count++;
          acc[clientName].revenue += apt.specialty?.price || 0;
          return acc;
        }, {} as Record<string, { count: number; revenue: number }>);
      
      // Limitar a 10 clientes mais frequentes
      const topClients = Object.entries(clientStats)
        .sort(([, a], [, b]) => b.count - a.count)
        .slice(0, 10)
        .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
      
      // Prepare professional statistics
      const professionalStats: Record<string, { count: number; revenue: number }> =
        validAppointments.reduce((acc, apt) => {
          const proName = apt.professional?.name || 'Unknown';
          if (!acc[proName]) {
            acc[proName] = { count: 0, revenue: 0 };
          }
          acc[proName].count++;
          acc[proName].revenue += apt.specialty?.price || 0;
          return acc;
        }, {} as Record<string, { count: number; revenue: number }>);
      
      // Prepare hourly statistics
      const hourlyStats: Record<string, number> = {};
      for (let i = 0; i < 24; i++) {
        hourlyStats[i] = 0;
      }
      
      validAppointments.forEach(apt => {
        const hour = new Date(apt.start_time).getHours();
        hourlyStats[hour]++;
      });

      // Update chart data
      setMonthlyData({
        labels: dailyAppointments.map(d => d.date),
        datasets: [
          {
            label: 'Agendamento',
            data: dailyAppointments.map(d => d.count),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.4,
          },
          {
            label: 'Receita (R$)',
            data: dailyAppointments.map(d => d.revenue),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            tension: 0.4,
            yAxisID: 'revenue',
          },
        ],
      });

      setServiceData({
        labels: Object.keys(serviceStats),
        datasets: [
          {
            label: 'Agendamento',
            data: Object.values(serviceStats).map(s => s.count),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 1,
          },
          {
            label: 'Receita (R$)',
            data: Object.values(serviceStats).map(s => s.revenue),
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 1,
          },
        ],
      });
      
      setStatusData({
        labels: ['Pendente', 'Confirmado', 'Concluído', 'Canceledo'],
        datasets: [
          {
            label: 'Appointment Status',
            data: [statusStats.pending, statusStats.confirmed, statusStats.completed, statusStats.canceled],
            backgroundColor: [
              'rgba(234, 179, 8, 0.5)',   // Pending - Yellow
              'rgba(59, 130, 246, 0.5)',  // Confirmed - Blue
              'rgba(16, 185, 129, 0.5)',  // Completed - Green
              'rgba(239, 68, 68, 0.5)',   // Canceled - Red
            ],
            borderColor: [
              'rgb(234, 179, 8)',
              'rgb(59, 130, 246)',
              'rgb(16, 185, 129)',
              'rgb(239, 68, 68)',
            ],
            borderWidth: 1,
          },
        ],
      });
      
      setClientsData({
        labels: Object.keys(topClients),
        datasets: [
          {
            label: 'Agendamento',
            data: Object.values(topClients).map(c => c.count),
            backgroundColor: 'rgba(124, 58, 237, 0.5)',
            borderColor: 'rgb(124, 58, 237)',
            borderWidth: 1,
          },
          {
            label: 'Receita (R$)',
            data: Object.values(topClients).map(c => c.revenue),
            backgroundColor: 'rgba(236, 72, 153, 0.5)',
            borderColor: 'rgb(236, 72, 153)',
            borderWidth: 1,
          },
        ],
      });
      
      setProfessionalData({
        labels: Object.keys(professionalStats),
        datasets: [
          {
            label: 'Agendamentos',
            data: Object.values(professionalStats).map(p => p.count),
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: 'rgb(245, 158, 11)',
            borderWidth: 1,
          },
          {
            label: 'Receita (R$)',
            data: Object.values(professionalStats).map(p => p.revenue),
            backgroundColor: 'rgba(6, 182, 212, 0.5)',
            borderColor: 'rgb(6, 182, 212)',
            borderWidth: 1,
          },
        ],
      });
      
      setHourlyData({
        labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
        datasets: [
          {
            label: 'Agendamentos por hora',
            data: Object.values(hourlyStats),
            backgroundColor: 'rgba(139, 92, 246, 0.5)',
            borderColor: 'rgb(139, 92, 246)',
            borderWidth: 1,
          },
        ],
      });

      // Update statistics
      setStats({
        totalAppointments,
        activeClients: uniqueClients,
        averageDuration,
        revenue: totalRevenue,
        completionRate,
        cancellationRate,
        appointmentsChange,
        clientsChange: 5, // Exemplo
        durationChange: 2, // Exemplo
        revenueChange,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };
  
  // Exportar para Excel
  const exportToExcel = async () => {
    try {
      setExportLoading(true);
      
      // Buscar dados completos para exportação
      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          id,
          start_time,
          end_time,
          status,
          notes,
          client:clients(name, email, phone),
          professional:professionals(name),
          specialty:specialties(name, duration, price)
        `)
        .gte('start_time', filters.dateRange.startDate.toISOString())
        .lte('start_time', filters.dateRange.endDate.toISOString());
        
      if (error) throw error;
      
      // Formatar dados para Excel
      const formattedData = appointments?.map(apt => ({
        'Appointment ID': apt.id,
        'Date': format(parseISO(apt.start_time), 'PP'),
        'Start Time': format(parseISO(apt.start_time), 'p'),
        'End Time': format(parseISO(apt.end_time), 'p'),
        'Client': apt.client?.name || 'Unknown',
        'Client Email': apt.client?.email || 'N/A',
        'Client Phone': apt.client?.phone || 'N/A',
        'Professional': apt.professional?.name || 'Unknown',
        'Service': apt.specialty?.name || 'Unknown',
        'Duration (min)': apt.specialty?.duration || 0,
        'Price ($)': apt.specialty?.price || 0,
        'Status': apt.status?.charAt(0).toUpperCase() + apt.status?.slice(1) || 'Unknown',
        'Notes': apt.notes || ''
      }));
      
      // Criar planilha
      const worksheet = XLSX.utils.json_to_sheet(formattedData || []);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Appointments');
      
      // Gerar arquivo
      const dateRange = `${format(filters.dateRange.startDate, 'yyyy-MM-dd')}_to_${format(filters.dateRange.endDate, 'yyyy-MM-dd')}`;
      XLSX.writeFile(workbook, `appointments_${dateRange}.xlsx`);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Exportar para PDF
  const exportToPDF = async () => {
    if (!chartsRef.current) return;
    
    try {
      setExportLoading(true);
      
      const canvas = await html2canvas(chartsRef.current);
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Adicionar título
      pdf.setFontSize(18);
      pdf.text('Analytics Report', pdfWidth / 2, 15, { align: 'center' });
      
      // Adicionar período
      pdf.setFontSize(12);
      pdf.text(
        `Period: ${format(filters.dateRange.startDate, 'PP')} to ${format(filters.dateRange.endDate, 'PP')}`,
        pdfWidth / 2, 
        25, 
        { align: 'center' }
      );
      
      // Adicionar estatísticas
      pdf.setFontSize(14);
      pdf.text('Key Metrics:', 20, 35);
      
      pdf.setFontSize(10);
      pdf.text(`Total Appointments: ${stats.totalAppointments}`, 25, 45);
      pdf.text(`Active Clients: ${stats.activeClients}`, 25, 50);
      pdf.text(`Average Duration: ${stats.averageDuration} min`, 25, 55);
      pdf.text(`Revenue: $${stats.revenue}`, 25, 60);
      pdf.text(`Completion Rate: ${stats.completionRate}%`, 25, 65);
      pdf.text(`Cancellation Rate: ${stats.cancellationRate}%`, 25, 70);
      
      // Adicionar gráficos
      pdf.addImage(imgData, 'PNG', 10, 80, pdfWidth - 20, pdfHeight - 100);
      
      // Adicionar rodapé
      pdf.setFontSize(8);
      pdf.text(`Generated on ${format(new Date(), 'PPpp')}`, pdfWidth / 2, pdfHeight - 10, { align: 'center' });
      
      // Salvar PDF
      const dateRange = `${format(filters.dateRange.startDate, 'yyyy-MM-dd')}_to_${format(filters.dateRange.endDate, 'yyyy-MM-dd')}`;
      pdf.save(`analytics_report_${dateRange}.pdf`);
      
      toast.success('PDF report generated successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF report');
    } finally {
      setExportLoading(false);
    }
  };
  
  // Enviar relatório por email
  const sendReportByEmail = async () => {
    try {
      setEmailLoading(true);
      
      // Aqui você implementaria a lógica para enviar o relatório por email
      // Isso geralmente envolve uma função serverless ou uma API
      
      // Exemplo simulado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Report sent to your email');
    } catch (error) {
      console.error('Error sending report:', error);
      toast.error('Failed to send report');
    } finally {
      setEmailLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, [user?.id]);
  
  useEffect(() => {
    fetchAnalytics();
  }, [filters, currentDate, currentView]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="w-8 h-8 animate-spin text-primary-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Relatório</h1>
          <p className="text-gray-600">Acompanhe o desempenho e os insights do seu negócio.</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            leftIcon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtros
          </Button>
          
          <Button 
            variant="outline" 
            leftIcon={<RefreshCw size={16} />}
            onClick={() => fetchAnalytics()}
          >
            Atualizar
          </Button>
          
          <Button 
            variant="outline" 
            leftIcon={<Download size={16} />}
            onClick={exportToExcel}
            isLoading={exportLoading}
          >
            Exportar Excel
          </Button>
          
          <Button 
            variant="outline" 
            leftIcon={<FileText size={16} />}
            onClick={exportToPDF}
            isLoading={exportLoading}
          >
            Exportar PDF
          </Button>
          
          <Button 
            variant="outline" 
            leftIcon={<Mail size={16} />}
            onClick={sendReportByEmail}
            isLoading={emailLoading}
          >
            Enviar para E-mail
          </Button>
        </div>
      </div>
      
      {/* Filtros */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filter Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  View
                </label>
                <div className="flex border rounded-md overflow-hidden">
                  <button 
                    className={`flex-1 py-2 px-3 text-sm ${currentView === 'month' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      setCurrentView('month');
                      updateFilters({
                        dateRange: {
                          startDate: startOfMonth(currentDate),
                          endDate: endOfMonth(currentDate)
                        }
                      });
                    }}
                  >
                    Month
                  </button>
                  <button 
                    className={`flex-1 py-2 px-3 text-sm ${currentView === 'quarter' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      setCurrentView('quarter');
                      updateFilters({
                        dateRange: {
                          startDate: subMonths(startOfMonth(currentDate), 2),
                          endDate: endOfMonth(currentDate)
                        }
                      });
                    }}
                  >
                    Quarter
                  </button>
                  <button 
                    className={`flex-1 py-2 px-3 text-sm ${currentView === 'year' ? 'bg-primary-100 text-primary-700' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                    onClick={() => {
                      setCurrentView('year');
                      updateFilters({
                        dateRange: {
                          startDate: startOfYear(currentDate),
                          endDate: endOfYear(currentDate)
                        }
                      });
                    }}
                  >
                    Year
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <div className="flex items-center">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigatePeriod('prev')}
                  >
                    <ChevronLeft size={16} />
                  </Button>
                  <div className="mx-2 flex-1 text-center">
                    {currentView === 'month' && format(currentDate, 'MMMM yyyy')}
                    {currentView === 'quarter' && `Q${Math.floor(currentDate.getMonth() / 3) + 1} ${currentDate.getFullYear()}`}
                    {currentView === 'year' && format(currentDate, 'yyyy')}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigatePeriod('next')}
                  >
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {['pending', 'confirmed', 'completed', 'canceled'].map(status => (
                    <button
                      key={status}
                      className={`px-3 py-1 text-xs rounded-full ${
                        filters.status.includes(status)
                          ? status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                            status === 'completed' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                      onClick={() => {
                        const newStatus = filters.status.includes(status)
                          ? filters.status.filter(s => s !== status)
                          : [...filters.status, status];
                        updateFilters({ status: newStatus });
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Professionals
                </label>
                <Select
                  placeholder="All professionals"
                  isMulti
                  options={professionals.map(p => ({ value: p.id, label: p.name }))}
                  value={filters.professionals.map(id => {
                    const pro = professionals.find(p => p.id === id);
                    return { value: id, label: pro?.name || id };
                  })}
                  onChange={(selected) => {
                    updateFilters({
                      professionals: selected.map(item => item.value)
                    });
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Services
                </label>
                <Select
                  placeholder="All services"
                  isMulti
                  options={specialties.map(s => ({ value: s.id, label: s.name }))}
                  value={filters.specialties.map(id => {
                    const spec = specialties.find(s => s.id === id);
                    return { value: id, label: spec?.name || id };
                  })}
                  onChange={(selected) => {
                    updateFilters({
                      specialties: selected.map(item => item.value)
                    });
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clients
                </label>
                <Select
                  placeholder="All clients"
                  isMulti
                  options={clients.map(c => ({ value: c.id, label: c.name }))}
                  value={filters.clients.map(id => {
                    const client = clients.find(c => c.id === id);
                    return { value: id, label: client?.name || id };
                  })}
                  onChange={(selected) => {
                    updateFilters({
                      clients: selected.map(item => item.value)
                    });
                  }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2 border-t pt-4">
            <Button 
              variant="outline" 
              onClick={() => {
                setFilters({
                  dateRange: {
                    startDate: startOfMonth(new Date()),
                    endDate: endOfMonth(new Date())
                  },
                  professionals: [],
                  specialties: [],
                  clients: [],
                  status: ['pending', 'confirmed', 'completed', 'canceled']
                });
                setCurrentView('month');
                setCurrentDate(new Date());
              }}
            >
              Reset Filters
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total agendamentos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
                <div className={`flex items-center mt-1 ${stats.appointmentsChange >= 0 ? 'text-success-500' : 'text-error-500'} text-sm`}>
                  {stats.appointmentsChange >= 0 ? (
                    <ArrowUp size={14} className="mr-1" />
                  ) : (
                    <ArrowDown size={14} className="mr-1" />
                  )}
                  <span>{Math.abs(stats.appointmentsChange)}% do período anterior</span>
                </div>
              </div>
              <div className="p-2 bg-primary-100 rounded-full">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Clientes ativos</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeClients}</p>
                <div className={`flex items-center mt-1 ${stats.clientsChange >= 0 ? 'text-success-500' : 'text-error-500'} text-sm`}>
                  {stats.clientsChange >= 0 ? (
                    <ArrowUp size={14} className="mr-1" />
                  ) : (
                    <ArrowDown size={14} className="mr-1" />
                  )}
                  <span>{Math.abs(stats.clientsChange)}% do período anterior</span>
                </div>
              </div>
              <div className="p-2 bg-secondary-100 rounded-full">
                <Users className="h-5 w-5 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Duração média</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageDuration}min</p>
                <div className={`flex items-center mt-1 ${stats.durationChange >= 0 ? 'text-success-500' : 'text-error-500'} text-sm`}>
                  {stats.durationChange >= 0 ? (
                    <ArrowUp size={14} className="mr-1" />
                  ) : (
                    <ArrowDown size={14} className="mr-1" />
                  )}
                  <span>{Math.abs(stats.durationChange)}% do período anterior</span>
                </div>
              </div>
              <div className="p-2 bg-primary-100 rounded-full">
                <Clock className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Receita</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${stats.revenue}</p>
                <div className={`flex items-center mt-1 ${stats.revenueChange >= 0 ? 'text-success-500' : 'text-error-500'} text-sm`}>
                  {stats.revenueChange >= 0 ? (
                    <ArrowUp size={14} className="mr-1" />
                  ) : (
                    <ArrowDown size={14} className="mr-1" />
                  )}
                  <span>{Math.abs(stats.revenueChange)}% do período anterior</span>
                </div>
              </div>
              <div className="p-2 bg-secondary-100 rounded-full">
                <DollarSign className="h-5 w-5 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Taxa de conclusão</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.completionRate}%</p>
                <div className="flex items-center mt-1 text-success-500 text-sm">
                  <CalendarCheck size={14} className="mr-1" />
                  <span>Agendamentos concluídos</span>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Taxa de cancelamento</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.cancellationRate}%</p>
                <div className="flex items-center mt-1 text-error-500 text-sm">
                  <ArrowDown size={14} className="mr-1" />
                  <span>Agendamentos cancelados</span>
                </div>
              </div>
              <div className="p-2 bg-red-100 rounded-full">
                <UserCheck className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div ref={chartsRef} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos e Receita ao Longo do Tempo</CardTitle>
              <CardDescription>
                Acompanhe os agendamentos e as tendências de receita no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line
                  data={monthlyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      revenue: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: {
                          drawOnChartArea: false,
                        },
                      },
                    },
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.y !== null) {
                              label += context.dataset.label === 'Revenue ($)' 
                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y)
                                : context.parsed.y;
                            }
                            return label;
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição do Status dos Agendamentos</CardTitle>
              <CardDescription>
                Visão geral dos status dos agendamentos durante o período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Doughnut
                  data={statusData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'right' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const label = context.label || '';
                            const value = context.raw as number;
                            const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Serviços</CardTitle>
              <CardDescription>
                Agendamentos e receita por serviço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar
                  data={serviceData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.y !== null) {
                              label += context.dataset.label === 'Revenue ($)' 
                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y)
                                : context.parsed.y;
                            }
                            return label;
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Desempenho dos Profissionais</CardTitle>
              <CardDescription>
                Agendamentos e receita por profissional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar
                  data={professionalData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.y !== null) {
                              label += context.dataset.label === 'Revenue ($)' 
                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y)
                                : context.parsed.y;
                            }
                            return label;
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Principais Clientes</CardTitle>
              <CardDescription>
                Agendamentos e receita por cliente (top 10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar
                  data={clientsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y' as const,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                              label += ': ';
                            }
                            if (context.parsed.x !== null) {
                              label += context.dataset.label === 'Revenue ($)' 
                                ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.x)
                                : context.parsed.x;
                            }
                            return label;
                          }
                        }
                      }
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Agendamentos por Horário</CardTitle>
              <CardDescription>
                Distribuição dos agendamentos ao longo do dia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar
                  data={hourlyData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;
