import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, addDays, isSameDay, isAfter, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { Professional, Specialty, Calendar } from '../types';
import { Check, ArrowLeft, CheckCircle, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
}

const DateTimeSelection = ({
  professional,
  specialty,
  onSelect,
  onBack,
  workingDays,
  selectedDate,
}: {
  professional?: Professional;
  specialty?: Specialty;
  onSelect: (date: Date, timeSlot: { start: string; end: string }) => void;
  onBack: () => void;
  workingDays: number[];
  selectedDate?: Date;
}) => {
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date>(selectedDate || new Date());
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [timeSlots, setTimeSlots] = useState<{ start: string; end: string }[]>([]);
  const [loadingWorkingDays, setLoadingWorkingDays] = useState(false);

  const getTimeSlots = async (
    date: Date,
    professionalId: string,
    specialtyId: string
  ): Promise<{ start: string; end: string }[]> => {
    try {
      const { data, error } = await supabase.rpc('get_available_slots', {
        input_professional_id: professionalId,
        input_specialty_id: specialtyId,
        input_date: format(date, 'yyyy-MM-dd'),
      });

      if (error) {
        console.error('Erro ao buscar horários:', error);
        return [];
      }

      const now = new Date();
      return (data || [])
        .map((slot: { start_time: string; end_time: string }) => ({
          start: slot.start_time,
          end: slot.end_time,
        }))
        .filter((slot) => {
          const slotDate = new Date(slot.start);
          return isAfter(slotDate, now) || isSameDay(slotDate, now);
        });
    } catch (err) {
      console.error('Erro inesperado:', err);
      return [];
    }
  };

  useEffect(() => {
    if (selectedDate) setInternalSelectedDate(selectedDate);
  }, [selectedDate]);

  // CORRIGIDO: Remover duplicação e usar lógica correta
  useEffect(() => {
    console.log('📅 GERANDO DATAS VÁLIDAS:');
    console.log('  🗓️ Working Days recebidos:', workingDays);
    
    const today = new Date();
    console.log('  📍 Hoje:', format(today, 'yyyy-MM-dd EEEE', { locale: ptBR }));
    console.log('  📍 Hoje (getDay):', today.getDay());
    
    const validDates: Date[] = [];

    for (let i = 0; i < 60; i++) {
      const date = addDays(today, i);
      const dayOfWeek = date.getDay();
      
      console.log(`  📆 ${format(date, 'yyyy-MM-dd EEEE', { locale: ptBR })} - dayOfWeek: ${dayOfWeek}`);
      
      if (workingDays.includes(dayOfWeek)) {
        console.log('    ✅ Incluída como válida');
        validDates.push(date);
      } else {
        console.log('    ❌ Não é dia de trabalho');
      }
    }

    console.log('📋 Total de datas válidas:', validDates.length);
    setAvailableDates(validDates);
  }, [workingDays]);

  useEffect(() => {
    const fetchSlots = async () => {
      if (!professional || !specialty) return;

      const allSlots = await getTimeSlots(
        internalSelectedDate,
        professional.id,
        specialty.id
      );

      const now = new Date();
      const filtered = allSlots.filter((slot) => {
        const slotStart = new Date(slot.start);
        return !isSameDay(slotStart, internalSelectedDate) || isAfter(slotStart, now);
      });

      setTimeSlots(filtered);
    };

    fetchSlots();
  }, [internalSelectedDate, professional, specialty]);

  const handleDateSelect = (date: Date) => {
    console.log('📅 DATA SELECIONADA:', format(date, 'yyyy-MM-dd EEEE', { locale: ptBR }));
    setInternalSelectedDate(date);
  };

  const formatDisplayTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo',
      hour12: false,
    });
  };

  // CORRIGIDO: Função para gerar calendário corretamente
  const generateCalendarDays = () => {
    const year = internalSelectedDate.getFullYear();
    const month = internalSelectedDate.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    console.log('📅 GERANDO CALENDÁRIO:');
    console.log('  📆 Primeiro dia do mês:', format(firstDay, 'yyyy-MM-dd EEEE', { locale: ptBR }));
    console.log('  📆 getDay() do primeiro dia:', firstDay.getDay());
    console.log('  📆 Último dia do mês:', format(lastDay, 'yyyy-MM-dd EEEE', { locale: ptBR }));
    
    // Quantos dias vazios no início (0 = domingo, 1 = segunda, etc.)
    const startDayOfWeek = firstDay.getDay();
    
    const calendarDays: (Date | null)[] = [];
    
    // Adicionar dias vazios no início
    for (let i = 0; i < startDayOfWeek; i++) {
      calendarDays.push(null);
    }
    
    // Adicionar todos os dias do mês
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      calendarDays.push(date);
      
      if (day <= 7) {
        console.log(`  📆 Dia ${day}: ${format(date, 'yyyy-MM-dd EEEE', { locale: ptBR })} - getDay: ${date.getDay()}`);
      }
    }
    
    console.log('  📊 Total de células:', calendarDays.length);
    console.log('  📊 Dias vazios no início:', startDayOfWeek);
    
    return calendarDays;
  };

  const calendarDays = generateCalendarDays();

  // CORRIGIDO: Navegação de mês
  const goToPreviousMonth = () => {
    setInternalSelectedDate(subMonths(internalSelectedDate, 1));
  };

  const goToNextMonth = () => {
    setInternalSelectedDate(addMonths(internalSelectedDate, 1));
  };

  return (
    <div className="animate-fade-in flex flex-col-reverse md:flex-row gap-8">
      {/* CALENDÁRIO */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-full md:w-1/2">
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-semibold text-gray-900">
            {format(internalSelectedDate, 'MMMM yyyy', { locale: ptBR })}
          </h4>
          <div className="flex space-x-2">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* CABEÇALHO DOS DIAS DA SEMANA */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((d, i) => (
            <div key={i} className="text-xs text-gray-500 text-center py-2 font-medium">{d}</div>
          ))}
        </div>

        {/* GRID DO CALENDÁRIO */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((date, i) => {
            if (!date) {
              return <div key={i} className="text-sm text-center py-2"></div>;
            }

            const isAvailable = availableDates.some((available) => isSameDay(available, date));
            const isCurrent = isSameDay(date, internalSelectedDate);
            const isToday = isSameDay(date, new Date());
            const isPast = date < new Date() && !isSameDay(date, new Date());

            return (
              <div
                key={i}
                onClick={() => isAvailable && !isPast ? handleDateSelect(date) : undefined}
                className={`text-sm text-center py-2 rounded transition-all ${
                  isCurrent && isAvailable
                    ? 'bg-[#6D3FC4] text-white font-bold cursor-pointer'
                    : isToday
                    ? 'bg-blue-100 text-blue-800 font-bold border border-blue-300'
                    : isAvailable && !isPast
                    ? 'bg-[#F6F0FD] text-[#6D3FC4] hover:bg-[#E8DBFA] cursor-pointer'
                    : isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
                title={`${format(date, 'yyyy-MM-dd EEEE', { locale: ptBR })} - Day: ${date.getDay()}`}
              >
                {format(date, 'd')}
              </div>
            );
          })}
        </div>
      </div>

      {/* HORÁRIOS */}
      <div className="w-full md:w-1/2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Escolha um horário</h2>
        <p className="text-gray-600 mb-6">
          {professional ? `com ${professional.name}` : 'Selecione um profissional'}
        </p>

        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-800 mb-2">
            Horários disponíveis para {format(internalSelectedDate, "dd 'de' MMMM", { locale: ptBR })}
          </h3>
          
          {timeSlots.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {timeSlots.map((slot, index) => (
                <button
                  key={`${slot.start}-${index}`}
                  onClick={() => onSelect(internalSelectedDate, slot)}
                  className="py-2 px-3 rounded border border-gray-200 text-sm hover:border-[#6D3FC4] hover:bg-[#F6F0FD] transition"
                >
                  {formatDisplayTime(slot.start)}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 text-center p-4 rounded text-gray-500 text-sm">
              Nenhum horário disponível nesta data.
            </div>
          )}
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 text-[#6D3FC4] hover:text-[#5a2d9e]"
        >
          ← Voltar
        </button>
      </div>
    </div>
  );
};

const ClientInfoForm = ({
  onSubmit,
  onBack,
}: {
  onSubmit: (data: ClientFormData) => void;
  onBack: () => void;
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, email, phone: phone || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6D3FC4] focus:border-[#6D3FC4]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6D3FC4] focus:border-[#6D3FC4]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Telefone (opcional)</label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#6D3FC4] focus:border-[#6D3FC4]"
        />
      </div>
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 text-[#6D3FC4] hover:text-[#5a2d9e]"
        >
          ← Voltar
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#6D3FC4] text-white rounded hover:bg-[#5a2d9e]"
        >
          Confirmar
        </button>
      </div>
    </form>
  );
};

const SharedBookingEmbedPage: React.FC = () => {
  const { id } = useParams();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [professional, setProfessional] = useState<Professional | undefined>();
  const [specialty, setSpecialty] = useState<Specialty | undefined>();
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  const [selectedTime, setSelectedTime] = useState<{ start: string; end: string } | null>(null);
  const [client, setClient] = useState<ClientFormData | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [loadingWorkingDays, setLoadingWorkingDays] = useState(false);
  
  // Buscar dados do calendário
  useEffect(() => {
    if (!id) return;
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('calendars')
          .select('*')
          .eq('id', id)
          .single();
        if (error) throw error;
        if (data) setCalendar(data);
      } catch (err) {
        setError('Calendário não encontrado');
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, [id]);

  // Buscar profissionais e especialidades
  useEffect(() => {
    if (!calendar?.id) return;
    const fetchCalendarData = async () => {
      try {
        const { data: specialtiesData, error: specError } = await supabase
          .from('specialties')
          .select('*')
          .eq('calendar_id', calendar.id);
        if (specError) throw specError;
        if (specialtiesData && specialtiesData.length > 0) {
          setSpecialties(specialtiesData.map((s: any) => ({
            ...s,
            calendarId: s.calendar_id,
          })));
        }
        const { data: professionalsData, error: profError } = await supabase
          .from('professionals')
          .select(`*, professional_specialties!inner (specialty_id, specialties (id, name, duration, price))`)
          .eq('calendar_id', calendar.id);
        if (profError) throw profError;
        if (professionalsData && professionalsData.length > 0) {
          const mappedProfessionals = professionalsData.map((p: any) => ({
            ...p,
            calendarId: p.calendar_id,
            specialties: p.professional_specialties?.map((ps: any) => ps.specialties) || [],
          }));
          setProfessionals(mappedProfessionals);
        }
      } catch (error) {
        setError('Erro ao carregar dados do calendário');
      }
    };
    fetchCalendarData();
  }, [calendar?.id]);

  // Filtrar profissionais
  useEffect(() => {
    if (!specialty || !professionals.length) {
      setFilteredProfessionals([]);
      return;
    }
    const filtered = professionals.filter(prof => 
      prof.specialties?.some(spec => spec.id === specialty.id)
    );
    setFilteredProfessionals(filtered);
  }, [specialty, professionals]);

  // Buscar dias de trabalho - CORRIGIDO
useEffect(() => {
  const fetchWorkingDays = async () => {
    if (!professional?.id) return;
    
    setLoadingWorkingDays(true);

    console.log('🔍 Buscando working days para professional:', professional.id);
    setLoadingWorkingDays(true);
    
    try {
      const { data, error } = await supabase
        .from('working_hours')
        .select('day_of_week')
        .eq('professional_id', professional.id)
        .eq('is_working_day', true);
        
      if (error) {
        console.error('❌ Erro ao buscar working days:', error);
        setWorkingDays([]);
        return;
      }
      
      const days = data?.map((d) => d.day_of_week) || [];
      console.log('✅ Working days encontrados:', days);
      setWorkingDays(days);
    } catch (error) {
      console.error('❌ Erro inesperado ao buscar dias de trabalho:', error);
      setWorkingDays([]);
    } finally {
      setLoadingWorkingDays(false);
    }
  };
  
  fetchWorkingDays();
}, [professional?.id]);

  // CORRIGIDO: Função de booking
  const handleBooking = async () => {
    if (!client || !selectedDate || !selectedTime || !calendar || !professional || !specialty) {
      console.error('Dados incompletos para o booking');
      return;
    }
    
    try {
      console.log('📋 Iniciando processo de booking...');
      
      // Obter o owner_id do calendário
      const { data: calendarData, error: calendarError } = await supabase
        .from('calendars')
        .select('owner_id')
        .eq('id', calendar.id)
        .single();
        
      if (calendarError) throw calendarError;
      
      const owner_id = calendarData.owner_id;
      
      if (!owner_id) {
        throw new Error('Não foi possível determinar o proprietário do calendário');
      }
      
      // Verificar se o cliente já existe pelo email
      let clientId;
      
      const { data: existingClient, error: clientCheckError } = await supabase
        .from('clients')
        .select('id')
        .eq('email', client.email)
        .eq('owner_id', owner_id)
        .maybeSingle();
        
      if (clientCheckError && clientCheckError.code !== 'PGRST116') {
        throw new Error(`Erro ao verificar cliente: ${clientCheckError.message}`);
      }
      
      if (existingClient) {
        console.log('Cliente já existe, usando ID existente:', existingClient.id);
        clientId = existingClient.id;
      } else {
        console.log('Criando novo cliente com email:', client.email);
        const { data: newClient, error: createClientError } = await supabase
          .from('clients')
          .insert({
            name: client.name,
            email: client.email,
            phone: client.phone,
            owner_id: owner_id
          })
          .select('id')
          .single();
          
        if (createClientError) {
          throw new Error(`Erro ao criar cliente: ${createClientError.message}`);
        }
        
        clientId = newClient.id;
        console.log('Novo cliente criado com ID:', clientId);
      }
      
      // Preparar os dados do agendamento
      const startTime = new Date(selectedTime.start);
      const endTime = new Date(selectedTime.end);
      
      const appointmentData = {
        client_id: clientId,
        professional_id: professional.id,
        specialty_id: specialty.id,
        calendar_id: calendar.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'pending',
        notes: ''
      };
      
      console.log('📦 Dados sendo enviados ao Supabase:', appointmentData);
      
      // Salvar o agendamento
      const { data: appointment, error } = await supabase
        .from('appointments')
        .insert(appointmentData)
        .select()
        .single();
        
      if (error) throw new Error(`Erro ao criar agendamento: ${error.message}`);
      
      console.log('✅ Agendamento criado com sucesso:', appointment);
      setBookingComplete(true);
      
      // Aguarda 5 segundos e abre merlindesk.com em nova aba
      setTimeout(() => {
        window.open('https://merlindesk.com', '_blank');
      }, 5000);
      
    } catch (error) {
      console.error('❌ Erro ao criar agendamento:', error);
      alert('Erro ao confirmar agendamento. Tente novamente.');
    }
  };

  const steps = [
    { id: 1, title: 'Serviço'},
    { id: 2, title: 'Profissional'},
    { id: 3, title: 'Data & Hora'},
    { id: 4, title: 'Seus Dados'},
    { id: 5, title: 'Confirmação'},
  ];

  const ProgressSteps = () => (
    <div className="mb-12">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
        <div
          className="absolute top-4 left-0 h-0.5 bg-[#6D3FC4] z-10 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
        {steps.map((step) => (
          <div key={step.id} className="flex flex-col items-center relative z-20">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                currentStep > step.id
                  ? 'bg-[#6D3FC4] border-[#6D3FC4] text-white'
                  : currentStep === step.id
                  ? 'bg-white border-[#6D3FC4] text-[#6D3FC4] shadow-lg ring-4 ring-[#F6F0FD]'
                  : 'bg-white border-gray-300 text-gray-400'
              }`}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <div
                  className={`w-2 h-2 rounded-full ${
                    currentStep === step.id ? 'bg-[#6D3FC4]' : 'bg-gray-400'
                  }`}
                />
              )}
            </div>
            <div className="text-center mt-3 max-w-24">
              <div
                className={`text-sm font-medium transition-colors ${
                  currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                }`}
              >
                {step.title}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#6D3FC4]" />
          <p className="text-gray-600">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  if (error || !calendar) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Calendário não encontrado'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#6D3FC4] text-white rounded hover:bg-[#5a2d9e]"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Agendamento Confirmado! 🎉</h2>
            <p className="text-gray-600 text-lg mb-6">
              Obrigado por agendar conosco. Você receberá uma confirmação em breve.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 font-medium">
                ✅ Seu agendamento foi registrado com sucesso
              </p>
            </div>
            <div className="bg-[#F6F0FD] border-l-4 border-[#6D3FC4] p-4 rounded-lg shadow-sm mb-6 text-left text-sm text-gray-700">
              <strong className="block font-semibold mb-1">🧙‍♂️ Conheça o Merlin Desk</strong>
              Quer automatizar seus próprios agendamentos e atendimentos no WhatsApp com inteligência artificial?
              <br />
              <a
                href="https://merlindesk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6D3FC4] underline hover:text-[#5a2d9e]"
              >
                Saiba como o Merlin Desk pode ajudar sua empresa →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen bg-white w-full max-w-4xl mx-auto">
      <ProgressSteps />

      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha o serviço</h2>
          {specialties.length > 0 ? (
            <div className="grid gap-3">
              {specialties.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => {
                    setSpecialty(spec);
                    setCurrentStep(2);
                  }}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-[#6D3FC4] hover:bg-[#F6F0FD] transition-all"
                >
                  <div className="font-semibold text-gray-900">{spec.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Duração: {spec.duration} min • Valor: R$ {spec.price}
                  </div>
                  {spec.description && (
                    <div className="text-sm text-gray-500 mt-2">{spec.description}</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Nenhum serviço disponível</p>
            </div>
          )}
        </div>
      )}

      {currentStep === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Escolha o profissional</h2>
          </div>
          {specialty && (
            <div className="bg-[#F6F0FD] p-3 rounded-lg mb-4">
              <p className="text-sm text-[#6D3FC4]">
                <strong>Serviço selecionado:</strong> {specialty.name}
              </p>
            </div>
          )}
          {filteredProfessionals.length > 0 ? (
            <div className="grid gap-3">
              {filteredProfessionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => {
                    setProfessional(prof);
                    setCurrentStep(3);
                  }}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-[#6D3FC4] hover:bg-[#F6F0FD] transition-all"
                >
                  <div className="font-semibold text-gray-900">{prof.name}</div>
                  {prof.title && (
                    <div className="text-sm text-gray-600 mt-1">{prof.title}</div>
                  )}
                  {prof.description && (
                    <div className="text-sm text-gray-500 mt-2">{prof.description}</div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Nenhum profissional disponível para este serviço</p>
            </div>
          )}
        </div>
      )}

      {currentStep === 3 && professional && specialty && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Escolha data e horário</h2>
          </div>
          <div className="bg-[#F6F0FD] p-3 rounded-lg mb-4 space-y-1">
            <p className="text-sm text-[#6D3FC4]">
              <strong>Serviço:</strong> {specialty.name}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>Profissional:</strong> {professional.name}
            </p>
          </div>

          {loadingWorkingDays ? (
            <div className="text-center text-gray-500 py-10">
              <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
              Carregando dias disponíveis...
            </div>
          ) : workingDays.length > 0 ? (
            <DateTimeSelection
              professional={professional}
              specialty={specialty}
              onSelect={(date, timeSlot) => {
                setSelectedDate(date);
                setSelectedTime(timeSlot);
                setCurrentStep(4);
              }}
              onBack={handleBack}
              workingDays={workingDays}
              selectedDate={selectedDate}
            />
          ) : (
            <div className="text-center text-red-500 py-10">
              Nenhum horário de trabalho configurado para esse profissional.
              <br />
              <small className="text-gray-500 mt-2 block">
                Configure os horários de trabalho no painel administrativo.
              </small>
            </div>
          )}
        </div>
      )}

      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Seus dados</h2>
          </div>
          <div className="bg-[#F6F0FD] p-3 rounded-lg mb-4 space-y-1">
            <p className="text-sm text-[#6D3FC4]">
              <strong>Serviço:</strong> {specialty?.name}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>Profissional:</strong> {professional?.name}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>Data:</strong> {selectedDate && format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>Horário:</strong> {selectedTime && `${new Date(selectedTime.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedTime.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>
          <ClientInfoForm
            onBack={handleBack}
            onSubmit={(data) => {
              setClient(data);
              setCurrentStep(5);
            }}
          />
        </div>
      )}

      {currentStep === 5 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Confirmação</h2>
          </div>
          <div className="bg-[#F6F0FD] p-3 rounded-lg mb-4 space-y-1">
            <p className="text-sm text-[#6D3FC4]">
              <strong>Serviço:</strong> {specialty?.name}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>Profissional:</strong> {professional?.name}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>Data:</strong> {selectedDate && format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>Horário:</strong> {selectedTime && `${new Date(selectedTime.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedTime.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>Nome:</strong> {client?.name}
            </p>
            <p className="text-sm text-[#6D3FC4]">
              <strong>E-mail:</strong> {client?.email}
            </p>
            {client?.phone && (
              <p className="text-sm text-[#6D3FC4]">
                <strong>Telefone:</strong> {client?.phone}
              </p>
            )}
          </div>
          <button
            onClick={handleBooking}
            className="px-4 py-3 bg-[#6D3FC4] text-white rounded hover:bg-[#5a2d9e] w-full"
          >
            Confirmar agendamento
          </button>
        </div>
      )}
    </div>
  );
};

export default SharedBookingEmbedPage;