import { supabase } from './supabase';

/**
 * Verifica se há conflitos de horário para um profissional
 * @param professionalId - ID do profissional
 * @param startTime - Horário de início do agendamento
 * @param endTime - Horário de fim do agendamento
 * @param excludeAppointmentId - ID do agendamento a ser excluído da verificação (para edições)
 * @returns Objeto com informações sobre conflitos
 */
export const checkTimeConflict = async (
  professionalId: string,
  startTime: Date,
  endTime: Date,
  excludeAppointmentId?: string
): Promise<{ hasConflict: boolean; conflictingAppointments?: any[] }> => {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        end_time,
        status,
        client:clients(name, email)
      `)
      .eq('professional_id', professionalId)
      .neq('status', 'canceled')
      .or(`start_time.lt.${endTime.toISOString()},end_time.gt.${startTime.toISOString()}`);

    if (excludeAppointmentId) {
      query = query.neq('id', excludeAppointmentId);
    }

    const { data: conflictingAppointments, error } = await query;

    if (error) throw error;

    return {
      hasConflict: conflictingAppointments && conflictingAppointments.length > 0,
      conflictingAppointments: conflictingAppointments || []
    };
  } catch (error) {
    console.error('Erro ao verificar conflitos:', error);
    return { hasConflict: false };
  }
};

/**
 * Formata os detalhes dos conflitos para exibição
 * @param conflictingAppointments - Lista de agendamentos conflitantes
 * @returns String formatada com os detalhes dos conflitos
 */
export const formatConflictDetails = (conflictingAppointments: any[]): string => {
  return conflictingAppointments.map(apt => {
    const aptStart = new Date(apt.start_time).toLocaleString('pt-BR');
    const clientName = apt.client?.name || 'Cliente não identificado';
    return `• ${clientName} - ${aptStart}`;
  }).join('\n');
};

/**
 * Verifica se um horário está dentro do horário de funcionamento
 * @param startTime - Horário de início
 * @param endTime - Horário de fim
 * @param workingHours - Horário de funcionamento (opcional)
 * @returns true se o horário está dentro do horário de funcionamento
 */
export const isWithinWorkingHours = (
  startTime: Date,
  endTime: Date,
  workingHours?: { start: string; end: string }
): boolean => {
  if (!workingHours) return true; // Se não há horário definido, aceita qualquer horário

  const startHour = parseInt(workingHours.start.split(':')[0]);
  const startMinute = parseInt(workingHours.start.split(':')[1]);
  const endHour = parseInt(workingHours.end.split(':')[0]);
  const endMinute = parseInt(workingHours.end.split(':')[1]);

  const appointmentStartHour = startTime.getHours();
  const appointmentStartMinute = startTime.getMinutes();
  const appointmentEndHour = endTime.getHours();
  const appointmentEndMinute = endTime.getMinutes();

  const appointmentStartMinutes = appointmentStartHour * 60 + appointmentStartMinute;
  const appointmentEndMinutes = appointmentEndHour * 60 + appointmentEndMinute;
  const workingStartMinutes = startHour * 60 + startMinute;
  const workingEndMinutes = endHour * 60 + endMinute;

  return appointmentStartMinutes >= workingStartMinutes && appointmentEndMinutes <= workingEndMinutes;
}; 