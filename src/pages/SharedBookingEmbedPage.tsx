import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, addDays, isSameDay, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { Professional, Specialty, Calendar } from '../types';
import { Check, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { DateTimeSelection } from '../components/booking/DateTimeSelection';

interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
}

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

interface SharedBookingEmbedPageProps {
  calendarId?: string;
  onBookingComplete?: (bookingData: any) => void;
  customStyles?: {
    primaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  showBranding?: boolean;
}

const SharedBookingEmbedPage: React.FC<SharedBookingEmbedPageProps> = ({
  calendarId: propCalendarId,
  onBookingComplete,
  customStyles = {},
  showBranding = true
}) => {
  const { id: paramId } = useParams();
  const calendarId = propCalendarId || paramId;
  
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [professional, setProfessional] = useState<Professional | undefined>();
  const [specialty, setSpecialty] = useState<Specialty | undefined>();
  const [selectedTime, setSelectedTime] = useState<{ start: string; end: string } | null>(null);
  const [client, setClient] = useState<ClientFormData | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  
  // Aplicar estilos customizados
  const primaryColor = customStyles.primaryColor || '#6D3FC4';
  const backgroundColor = customStyles.backgroundColor || 'white';
  const textColor = customStyles.textColor || '#1f2937';

    useEffect(() => {
      const fetchWorkingDays = async () => {
        if (!professional) return;

        const { data, error } = await supabase
          .from('working_hours')
          .select('day_of_week')
          .eq('professional_id', professional.id)
          .eq('is_working_day', true);

        if (!error && data) {
          const diasValidos = data.map((d) => d.day_of_week);
          setWorkingDays(diasValidos);
        }
      };

      fetchWorkingDays();
    }, [professional]);

  // Buscar dados do calendário
  useEffect(() => {
    if (!calendarId) return;
    
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('calendars')
          .select('*')
          .eq('id', calendarId)
          .single();
          
        if (error) throw error;
        if (data) setCalendar(data);
      } catch (err) {
        console.error('Erro ao buscar calendário:', err);
        setError('Calendário não encontrado');
      } finally {
        setLoading(false);
      }
    };
    
    fetchCalendar();
  }, [calendarId]);

  // Buscar profissionais e especialidades
  useEffect(() => {
    if (!calendar?.id) return;
    
    const fetchCalendarData = async () => {
      try {
        // Buscar especialidades
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
        } else {
          setSpecialties([]); // Garantir que sempre seja um array
        }

        // Buscar profissionais com especialidades
        const { data: professionalsData, error: profError } = await supabase
          .from('professionals')
          .select(`
            *, 
            professional_specialties!inner (
              specialty_id, 
              specialties (id, name, duration, price)
            )
          `)
          .eq('calendar_id', calendar.id);
          
        if (profError) throw profError;
        
        if (professionalsData && professionalsData.length > 0) {
          const mappedProfessionals = professionalsData.map((p: any) => ({
            ...p,
            calendarId: p.calendar_id,
            specialties: p.professional_specialties?.map((ps: any) => ps.specialties) || [],
          }));
          setProfessionals(mappedProfessionals);
        } else {
          setProfessionals([]); // Garantir que sempre seja um array
        }
      } catch (error) {
        console.error('Erro ao carregar dados do calendário:', error);
        setError('Erro ao carregar dados do calendário');
      }
    };
    
    fetchCalendarData();
  }, [calendar?.id]);

  // Filtrar profissionais por especialidade
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
      
      // Callback personalizado se fornecido
      if (onBookingComplete) {
        onBookingComplete({
          appointment,
          client,
          professional,
          specialty,
          selectedDate,
          selectedTime
        });
      }
      
      // Aguarda 5 segundos e abre merlindesk.com em nova aba (apenas se showBranding for true)
      if (showBranding) {
        setTimeout(() => {
          window.open('https://merlindesk.com', '_blank');
        }, 5000);
      }
      
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

  const ProgressSteps = () => {
    // Garantir que steps seja sempre um array
    const safeSteps = Array.isArray(steps) ? steps : [];
    
    return (
      <div className="mb-12">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-200 z-0"></div>
          <div
            className="absolute top-4 left-0 h-0.5 z-10 transition-all duration-500 ease-out"
            style={{ 
              backgroundColor: primaryColor,
              width: `${((currentStep - 1) / (safeSteps.length - 1)) * 100}%` 
            }}
          ></div>
          {safeSteps.map((step) => (
            <div key={step.id} className="flex flex-col items-center relative z-20">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all duration-300 ${
                  currentStep > step.id
                    ? `text-white`
                    : currentStep === step.id
                    ? `bg-white text-white shadow-lg ring-4`
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
                style={{
                  backgroundColor: currentStep > step.id ? primaryColor : currentStep === step.id ? 'white' : 'white',
                  borderColor: currentStep >= step.id ? primaryColor : '#d1d5db',
                  color: currentStep > step.id ? 'white' : currentStep === step.id ? primaryColor : '#9ca3af',
                  ringColor: currentStep === step.id ? `${primaryColor}20` : 'transparent'
                }}
              >
                {currentStep > step.id ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <div
                    className={`w-2 h-2 rounded-full`}
                    style={{
                      backgroundColor: currentStep === step.id ? primaryColor : '#9ca3af'
                    }}
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
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: primaryColor }} />
          <p className="text-gray-600">Carregando calendário...</p>
        </div>
      </div>
    );
  }

  if (error || !calendar) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor }}>
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Calendário não encontrado'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-white rounded hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
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
            {showBranding && (
              <div className="border-l-4 p-4 rounded-lg shadow-sm mb-6 text-left text-sm text-gray-700"
                   style={{ 
                     backgroundColor: `${primaryColor}10`, 
                     borderColor: primaryColor 
                   }}>
                <strong className="block font-semibold mb-1">🧙‍♂️ Conheça o Merlin Desk</strong>
                Quer automatizar seus próprios agendamentos e atendimentos no WhatsApp com inteligência artificial?
                <br />
                <a
                  href="https://merlindesk.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:opacity-80"
                  style={{ color: primaryColor }}
                >
                  Saiba como o Merlin Desk pode ajudar sua empresa →
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 min-h-screen w-full max-w-4xl mx-auto" style={{ backgroundColor, color: textColor }}>
      <ProgressSteps />

      {currentStep === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-6" style={{ color: textColor }}>Escolha o serviço</h2>
          {Array.isArray(specialties) && specialties.length > 0 ? (
            <div className="grid gap-3">
              {specialties.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => {
                    setSpecialty(spec);
                    setCurrentStep(2);
                  }}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-opacity-80 transition-all"
                  style={{
                    borderColor: `${primaryColor}40`,
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = primaryColor;
                    e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${primaryColor}40`;
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
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
            <h2 className="text-2xl font-bold" style={{ color: textColor }}>Escolha o profissional</h2>
          </div>
          {specialty && (
            <div className="p-3 rounded-lg mb-4" style={{ backgroundColor: `${primaryColor}10` }}>
              <p className="text-sm" style={{ color: primaryColor }}>
                <strong>Serviço selecionado:</strong> {specialty.name}
              </p>
            </div>
          )}
          {Array.isArray(filteredProfessionals) && filteredProfessionals.length > 0 ? (
            <div className="grid gap-3">
              {filteredProfessionals.map((prof) => (
                <button
                  key={prof.id}
                  onClick={async () => {
                    setProfessional(prof);
                    setCurrentStep(3);

                    try {
                      const { data, error } = await supabase
                        .from('working_hours')
                        .select('day_of_week')
                        .eq('professional_id', prof.id)
                        .eq('is_working_day', true);

                      if (error) throw error;

                      const days = data.map((d: any) => d.day_of_week);
                      setWorkingDays(days);
                      console.log('📅 Dias trabalhados:', days);
                    } catch (err) {
                      console.error('Erro ao buscar dias de trabalho:', err);
                      setWorkingDays([]); // fallback seguro
                    }
                  }}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-opacity-80 transition-all"
                  style={{
                    borderColor: `${primaryColor}40`,
                    backgroundColor: 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = primaryColor;
                    e.currentTarget.style.backgroundColor = `${primaryColor}10`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = `${primaryColor}40`;
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
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
            <h2 className="text-2xl font-bold" style={{ color: textColor }}>Escolha data e horário</h2>
          </div>
          <div className="p-3 rounded-lg mb-4 space-y-1" style={{ backgroundColor: `${primaryColor}10` }}>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Serviço:</strong> {specialty.name}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Profissional:</strong> {professional.name}
            </p>
          </div>

          <DateTimeSelection
            professional={professional}
            specialty={specialty}
            onSelect={(date, timeSlot) => {
              setSelectedDate(date);
              setSelectedTime(timeSlot);
              setCurrentStep(4);
              
            }}
            onBack={handleBack}
            getTimeSlots={async (date) => {
              try {
                const { data, error } = await supabase.rpc('get_available_slots', {
                  input_professional_id: professional.id,
                  input_specialty_id: specialty.id,
                  input_date: format(date, 'yyyy-MM-dd'),
                });
                if (error) {
                  console.error('Erro ao buscar horários:', error);
                  return [];
                }

                // Verificação de segurança adicional
                if (!data || !Array.isArray(data)) {
                  console.log('⚠️ getTimeSlots: Dados inválidos retornados:', data);
                  return [];
                }

                const slots = data.map((slot: any) => ({
                  start: slot.start_time,
                  end: slot.end_time,
                }));

                console.log('✅ getTimeSlots: Slots processados:', slots);
                return slots;
              } catch (err) {
                console.error('Erro inesperado:', err);
                return [];
              }
            }}
            workingDays={workingDays}
            selectedDate={selectedDate}
          />
        </div>
      )}
      {currentStep === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={handleBack} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold" style={{ color: textColor }}>Seus dados</h2>
          </div>
          <div className="p-3 rounded-lg mb-4 space-y-1" style={{ backgroundColor: `${primaryColor}10` }}>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Serviço:</strong> {specialty?.name}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Profissional:</strong> {professional?.name}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Data:</strong> {selectedDate && format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
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
            <h2 className="text-2xl font-bold" style={{ color: textColor }}>Confirmação</h2>
          </div>
          <div className="p-3 rounded-lg mb-4 space-y-1" style={{ backgroundColor: `${primaryColor}10` }}>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Serviço:</strong> {specialty?.name}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Profissional:</strong> {professional?.name}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Data:</strong> {selectedDate && format(selectedDate, 'dd/MM/yyyy', { locale: ptBR })}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Horário:</strong> {selectedTime && `${new Date(selectedTime.start).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} - ${new Date(selectedTime.end).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>Nome:</strong> {client?.name}
            </p>
            <p className="text-sm" style={{ color: primaryColor }}>
              <strong>E-mail:</strong> {client?.email}
            </p>
            {client?.phone && (
              <p className="text-sm" style={{ color: primaryColor }}>
                <strong>Telefone:</strong> {client?.phone}
              </p>
            )}
          </div>
          <button
            onClick={handleBooking}
            className="px-4 py-3 text-white rounded hover:opacity-90 w-full transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            Confirmar agendamento
          </button>
        </div>
      )}
    </div>
  );
};

export default SharedBookingEmbedPage;
