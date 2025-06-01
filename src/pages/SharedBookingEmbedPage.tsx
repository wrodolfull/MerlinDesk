import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, addDays, isSameDay } from 'date-fns';
import { supabase } from '../lib/supabase';
import { Professional, Specialty, Calendar } from '../types';
import { DateTimeSelection } from '../components/booking/DateTimeSelection';
import { ClientInfoForm } from '../components/booking/ClientInfoForm';
import { Dialog } from '@headlessui/react';
import { Card, CardContent } from '../components/ui/Card';
import { CheckCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';

const SharedBookingEmbedPage: React.FC = () => {
  const { id } = useParams();
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [step, setStep] = useState(1); // 1: Especialidade, 2: Profissional, 3: Data/Hora, 4: Cliente, 5: Confirmação
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [filteredProfessionals, setFilteredProfessionals] = useState<Professional[]>([]);
  const [professional, setProfessional] = useState<Professional | undefined>();
  const [specialty, setSpecialty] = useState<Specialty | undefined>();
  const [workingDays, setWorkingDays] = useState<number[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<{ start: string; end: string } | null>(null);
  const [client, setClient] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [bookingComplete, setBookingComplete] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        console.error('Erro ao buscar calendário:', err);
        setError('Calendário não encontrado');
      } finally {
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [id]);

  // Buscar profissionais e especialidades do calendário
  useEffect(() => {
    if (!calendar?.id) return;

    const fetchCalendarData = async () => {
      try {
        // Buscar especialidades do calendário
        const { data: specialtiesData, error: specError } = await supabase
          .from('specialties')
          .select('*')
          .eq('calendar_id', calendar.id);

        if (specError) throw specError;

        // Buscar profissionais do calendário
        const { data: professionalsData, error: profError } = await supabase
          .from('professionals')
          .select(`
            *,
            professional_specialties!inner (
              specialty_id,
              specialties (
                id,
                name,
                duration,
                price
              )
            )
          `)
          .eq('calendar_id', calendar.id);

        if (profError) throw profError;

        if (specialtiesData && specialtiesData.length > 0) {
          const mappedSpecialties = specialtiesData.map((s: any) => ({
            ...s,
            calendarId: s.calendar_id,
          }));
          setSpecialties(mappedSpecialties);
        }

        if (professionalsData && professionalsData.length > 0) {
          const mappedProfessionals = professionalsData.map((p: any) => ({
            ...p,
            calendarId: p.calendar_id,
            specialties: p.professional_specialties?.map((ps: any) => ps.specialties) || [],
          }));
          setProfessionals(mappedProfessionals);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do calendário:', error);
        setError('Erro ao carregar dados do calendário');
      }
    };

    fetchCalendarData();
  }, [calendar?.id]);

  // Filtrar profissionais baseado na especialidade selecionada
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

  // Buscar dias de trabalho do profissional
  useEffect(() => {
    const fetchWorkingDays = async () => {
      if (!professional?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('working_hours')
          .select('day_of_week')
          .eq('professional_id', professional.id)
          .eq('is_working_day', true);
        
        if (error) throw error;
        if (data) {
          const days = data.map((d) => d.day_of_week);
          console.log('Working days carregados:', days);
          setWorkingDays(days);
        }
      } catch (error) {
        console.error('Erro ao buscar dias de trabalho:', error);
      }
    };
    
    fetchWorkingDays();
  }, [professional?.id]);

  // CORREÇÃO: Função getTimeSlots corrigida
  const getTimeSlots = async (date: Date) => {
    if (!professional || !specialty) return [];

    try {
      console.log('Buscando slots para:', {
        date: date.toISOString().split('T')[0],
        professional_id: professional.id,
        specialty_id: specialty.id
      });

      // CORREÇÃO: Usar apenas os parâmetros corretos da função SQL
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_available_slots', {
          input_professional_id: professional.id,
          input_specialty_id: specialty.id,
          input_date: date.toISOString().split('T')[0],
        });

      if (!rpcError && rpcData) {
        console.log('Slots encontrados via RPC:', rpcData);
        return rpcData.map((slot: any) => ({
          start: slot.start_time,
          end: slot.end_time
        }));
      }

      console.log('RPC falhou:', rpcError);
      
      // Fallback: busca manual
      const dayOfWeek = date.getDay();
      const { data: workingHours, error: whError } = await supabase
        .from('working_hours')
        .select('start_time, end_time, break_start, break_end')
        .eq('professional_id', professional.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_working_day', true)
        .single();

      if (whError || !workingHours) {
        console.log('Nenhum horário de trabalho encontrado para este dia');
        return [];
      }

      const { data: appointments, error: appError } = await supabase
        .from('appointments')
        .select('start_time, end_time')
        .eq('professional_id', professional.id)
        .eq('date', date.toISOString().split('T')[0])
        .neq('status', 'cancelled');

      if (appError) {
        console.error('Erro ao buscar agendamentos:', appError);
        return [];
      }

      const slots = generateTimeSlots(
        workingHours,
        appointments || [],
        specialty.duration || 60,
        date
      );

      console.log('Slots gerados manualmente:', slots);
      return slots;

    } catch (error) {
      console.error('Erro ao buscar horários disponíveis:', error);
      return [];
    }
  };

  // Função auxiliar para gerar slots de tempo
  const generateTimeSlots = (
    workingHours: any,
    appointments: any[],
    duration: number,
    date: Date
  ) => {
    const slots: { start: string; end: string }[] = [];
    const dateStr = date.toISOString().split('T')[0];
    
    const startMinutes = timeToMinutes(workingHours.start_time);
    const endMinutes = timeToMinutes(workingHours.end_time);
    const breakStartMinutes = workingHours.break_start ? timeToMinutes(workingHours.break_start) : null;
    const breakEndMinutes = workingHours.break_end ? timeToMinutes(workingHours.break_end) : null;
    
    for (let minutes = startMinutes; minutes + duration <= endMinutes; minutes += 15) {
      const slotStart = minutes;
      const slotEnd = minutes + duration;
      
      if (breakStartMinutes && breakEndMinutes) {
        if (slotStart < breakEndMinutes && slotEnd > breakStartMinutes) {
          continue;
        }
      }
      
      const startTime = `${dateStr}T${minutesToTime(slotStart)}:00`;
      const endTime = `${dateStr}T${minutesToTime(slotEnd)}:00`;
      
      const hasConflict = appointments.some(apt => {
        const aptStart = new Date(apt.start_time).getTime();
        const aptEnd = new Date(apt.end_time).getTime();
        const slotStartTime = new Date(startTime).getTime();
        const slotEndTime = new Date(endTime).getTime();
        
        return slotStartTime < aptEnd && slotEndTime > aptStart;
      });
      
      if (!hasConflict) {
        slots.push({
          start: startTime,
          end: endTime
        });
      }
    }
    
    return slots;
  };

  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  const handleBooking = async () => {
    if (!client || !selectedDate || !selectedTime || !calendar || !professional || !specialty) return;

    try {
      const { error } = await supabase.from('appointments').insert({
        calendar_id: calendar.id,
        professional_id: professional.id,
        specialty_id: specialty.id,
        client_name: client.name,
        client_email: client.email,
        client_phone: client.phone ?? '',
        start_time: selectedTime.start,
        end_time: selectedTime.end,
        date: selectedDate.toISOString().split('T')[0],
        status: 'confirmed'
      });

      if (error) throw error;
      setBookingComplete(true);
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert('Erro ao confirmar agendamento. Tente novamente.');
    }
  };

  const copyEmbedCode = () => {
    const embedCode = `<iframe src="https://merlindesk.com/booking/embed/${calendar?.id}" width="100%" height="700" frameborder="0" style="border:none;"></iframe>`;
    navigator.clipboard.writeText(embedCode);
    alert('Código copiado!');
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#7c45d0]" />
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
            className="px-4 py-2 bg-[#7c45d0] text-white rounded hover:bg-[#5a2d9e]"
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
            <div className="bg-[#f3f0fd] border-l-4 border-[#7c45d0] p-4 rounded-lg shadow-sm mb-6 text-left text-sm text-gray-700">
              <strong className="block font-semibold mb-1">🧙‍♂️ Conheça o Merlin Desk</strong>
              Quer automatizar seus próprios agendamentos e atendimentos no WhatsApp com inteligência artificial?
              <br />
              <a
                href="https://merlindesk.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#7c45d0] underline hover:text-[#5a2d9e]"
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
    <div className="p-4 min-h-screen bg-white w-full max-w-3xl mx-auto">
      {window.self === window.top && (
        <button
          onClick={() => setShowEmbedModal(true)}
          className="text-sm text-[#7c45d0] underline mb-4 hover:text-[#5a2d9e]"
        >
          🔗 Código para incorporar
        </button>
      )}

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span className={step >= 1 ? 'text-[#7c45d0] font-medium' : ''}>Especialidade</span>
          <span className={step >= 2 ? 'text-[#7c45d0] font-medium' : ''}>Profissional</span>
          <span className={step >= 3 ? 'text-[#7c45d0] font-medium' : ''}>Data & Hora</span>
          <span className={step >= 4 ? 'text-[#7c45d0] font-medium' : ''}>Seus Dados</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#7c45d0] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
      </div>

      <Dialog open={showEmbedModal} onClose={() => setShowEmbedModal(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 bg-black bg-opacity-50">
          <Dialog.Panel className="bg-white max-w-lg w-full rounded-lg p-6 shadow-xl">
            <Dialog.Title className="text-lg font-semibold mb-4">Incorpore este calendário no seu site</Dialog.Title>
            <p className="text-sm text-gray-700 mb-2">
              Copie e cole o código abaixo no seu site:
            </p>
            <textarea
              className="w-full text-sm p-3 border rounded bg-gray-50 font-mono"
              rows={5}
              readOnly
              value={`<iframe src="https://merlindesk.com/booking/embed/${calendar.id}" width="100%" height="700" frameborder="0" style="border:none;"></iframe>`}
            />
            <div className="flex gap-2 mt-3">
              <button
                className="px-4 py-2 bg-[#7c45d0] text-white rounded hover:bg-[#5a2d9e]"
                onClick={copyEmbedCode}
              >
                Copiar código
              </button>
              <button
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                onClick={() => setShowEmbedModal(false)}
              >
                Fechar
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Escolha o serviço</h2>
          {specialties.length > 0 ? (
            <div className="grid gap-3">
              {specialties.map((spec) => (
                <button
                  key={spec.id}
                  onClick={() => {
                    setSpecialty(spec);
                    nextStep();
                  }}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-[#7c45d0] hover:bg-[#f3f0fd] transition-all"
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

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Escolha o profissional</h2>
          </div>
          
          {specialty && (
            <div className="bg-[#f3f0fd] p-3 rounded-lg mb-4">
              <p className="text-sm text-[#7c45d0]">
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
                    nextStep();
                  }}
                  className="p-4 text-left rounded-lg border border-gray-200 hover:border-[#7c45d0] hover:bg-[#f3f0fd] transition-all"
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

      {step === 3 && professional && specialty && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Escolha data e horário</h2>
          </div>

          <div className="bg-[#f3f0fd] p-3 rounded-lg mb-4 space-y-1">
            <p className="text-sm text-[#7c45d0]">
              <strong>Serviço:</strong> {specialty.name}
            </p>
            <p className="text-sm text-[#7c45d0]">
              <strong>Profissional:</strong> {professional.name}
            </p>
          </div>

          <DateTimeSelection
            professional={professional}
            specialty={specialty}
            workingDays={workingDays}
            getTimeSlots={getTimeSlots}
            onSelect={(date, time) => {
              setSelectedDate(date);
              setSelectedTime(time);
              nextStep();
            }}
            onBack={prevStep}
          />
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <button onClick={prevStep} className="p-2 hover:bg-gray-100 rounded">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Seus dados</h2>
          </div>

          <div className="bg-[#f3f0fd] p-3 rounded-lg mb-4 space-y-1">
            <p className="text-sm text-[#7c45d0]">
              <strong>Serviço:</strong> {specialty?.name}
            </p>
            <p className="text-sm text-[#7c45d0]">
              <strong>Profissional:</strong> {professional?.name}
            </p>
            <p className="text-sm text-[#7c45d0]">
              <strong>Data:</strong> {selectedDate && format(selectedDate, 'dd/MM/yyyy')}
            </p>
            <p className="text-sm text-[#7c45d0]">
              <strong>Horário:</strong> {selectedTime?.start} - {selectedTime?.end}
            </p>
          </div>

          <ClientInfoForm
            onBack={prevStep}
            onSubmit={(data) => {
              setClient(data);
              handleBooking();
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SharedBookingEmbedPage;