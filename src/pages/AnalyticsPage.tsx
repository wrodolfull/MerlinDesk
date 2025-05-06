import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { BarChart, Calendar, Clock, Users, ArrowUp, ArrowDown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO, isValid } from 'date-fns';
import { Loader } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const AnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAppointments: 0,
    activeClients: 0,
    averageDuration: 0,
    revenue: 0,
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

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      // Get current month's date range
      const now = new Date();
      const monthStart = startOfMonth(now);
      const monthEnd = endOfMonth(now);
      const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

      // Fetch appointments with related data
      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          *,
          specialty:specialties(name, duration, price)
        `)
        .gte('start_time', monthStart.toISOString())
        .lte('start_time', monthEnd.toISOString());

      if (appointmentsError) throw appointmentsError;

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

      // Prepare daily appointments data
      const dailyAppointments = daysInMonth.map(date => {
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
      const serviceStats = validAppointments.reduce((acc, apt) => {
        const serviceName = apt.specialty?.name || 'Unknown';
        if (!acc[serviceName]) {
          acc[serviceName] = { count: 0, revenue: 0 };
        }
        acc[serviceName].count++;
        acc[serviceName].revenue += apt.specialty?.price || 0;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);

      // Update chart data
      setMonthlyData({
        labels: dailyAppointments.map(d => d.date),
        datasets: [
          {
            label: 'Appointments',
            data: dailyAppointments.map(d => d.count),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            tension: 0.4,
          },
          {
            label: 'Revenue ($)',
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
            label: 'Appointments by Service',
            data: Object.values(serviceStats).map(s => s.count),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
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
        appointmentsChange: 12, // Example percentage changes
        clientsChange: 8,
        durationChange: 5,
        revenueChange: 15,
      });

    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
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

  return (
    <DashboardLayout>
      <Toaster />
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Track your business performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Appointments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAppointments}</p>
                <div className="flex items-center mt-1 text-success-500 text-sm">
                  <ArrowUp size={14} className="mr-1" />
                  <span>{stats.appointmentsChange}% from last month</span>
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
                <p className="text-sm font-medium text-gray-500">Active Clients</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.activeClients}</p>
                <div className="flex items-center mt-1 text-success-500 text-sm">
                  <ArrowUp size={14} className="mr-1" />
                  <span>{stats.clientsChange}% from last month</span>
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
                <p className="text-sm font-medium text-gray-500">Average Duration</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.averageDuration}min</p>
                <div className="flex items-center mt-1 text-success-500 text-sm">
                  <ArrowUp size={14} className="mr-1" />
                  <span>{stats.durationChange}% from last month</span>
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
                <p className="text-sm font-medium text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">${stats.revenue}</p>
                <div className="flex items-center mt-1 text-success-500 text-sm">
                  <ArrowUp size={14} className="mr-1" />
                  <span>{stats.revenueChange}% from last month</span>
                </div>
              </div>
              <div className="p-2 bg-secondary-100 rounded-full">
                <BarChart className="h-5 w-5 text-secondary-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
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
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointments by Service</CardTitle>
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
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AnalyticsPage;