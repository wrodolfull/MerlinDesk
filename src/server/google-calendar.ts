// google-calendar.ts (Operações específicas do calendário)
import express from 'express';
import { google } from 'googleapis';
import dotenv from 'dotenv';
import type { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

dotenv.config();
const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

// Função para criar alias do Gmail
function createGmailAlias(email: string): string {
  if (email.includes('@gmail.com')) {
    const [localPart, domain] = email.split('@');
    return `${localPart}+calendar@${domain}`;
  }
  return email;
}

// Função para verificar disponibilidade (reutilizada do google.ts)
async function checkCalendarAvailability(
  oauth2Client: any,
  startTime: string,
  endTime: string,
  calendarId: string = 'primary'
): Promise<{ available: boolean; conflictingEvents?: any[] }> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: calendarId,
      timeMin: startTime,
      timeMax: endTime,
      singleEvents: true,
      orderBy: 'startTime',
      maxResults: 50
    });

    const events = response.data.items || [];
    
    const conflictingEvents = events.filter(event => {
      if (event.status === 'cancelled') return false;
      if (event.start?.date && !event.start?.dateTime) return false;
      
      const eventStart = new Date(event.start?.dateTime || event.start?.date!);
      const eventEnd = new Date(event.end?.dateTime || event.end?.date!);
      const requestStart = new Date(startTime);
      const requestEnd = new Date(endTime);
      
      return (requestStart < eventEnd && requestEnd > eventStart);
    });

    return {
      available: conflictingEvents.length === 0,
      conflictingEvents: conflictingEvents.length > 0 ? conflictingEvents : undefined
    };

  } catch (error) {
    console.error('❌ Erro ao verificar disponibilidade:', error);
    throw new Error('Erro ao verificar disponibilidade no calendário');
  }
}

// ✅ FUNÇÃO PARA VERIFICAR PERMISSÕES DA CONTA GOOGLE
async function checkGoogleAccountPermissions(oauth2Client: any): Promise<boolean> {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    
    // Verificar se a conta tem permissões para criar videoconferências
    const settingsResponse = await calendar.settings.list();
    console.log('🔍 Configurações da conta Google:', settingsResponse.data.items?.length || 0);
    
    // Verificar se a conta tem Google Meet habilitado
    const calendarListResponse = await calendar.calendarList.list();
    const primaryCalendar = calendarListResponse.data.items?.find(cal => cal.primary);
    
    if (primaryCalendar) {
      console.log('✅ Calendário primário encontrado:', primaryCalendar.summary);
      console.log('🔍 Acesso ao calendário:', primaryCalendar.accessRole);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar permissões da conta Google:', error);
    return false;
  }
}

// POST /calendar/create-event (com validação de disponibilidade)
router.post('/calendar/create-event', async (req: Request, res: Response): Promise<void> => {
  const { appointmentId, userId, skipAvailabilityCheck = false } = req.body;

  console.log('🔍 Dados recebidos:', { appointmentId, userId, skipAvailabilityCheck });

  if (!appointmentId || !userId) {
    res.status(400).json({ error: 'appointmentId e userId são obrigatórios' });
    return;
  }

  try {
    // Buscar dados do agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients(name, email),
        professionals(name),
        specialties(name),
        guests
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error('❌ Agendamento não encontrado:', appointmentError);
      res.status(404).json({ error: 'Agendamento não encontrado' });
      return;
    }

    // Buscar email do dono do calendário
    const { data: ownerData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    console.log('✅ Agendamento encontrado:', appointment.id);
    console.log('🔍 Dados do agendamento:', {
      id: appointment.id,
      clientEmail: appointment.clients?.email,
      guests: appointment.guests,
      guestsType: typeof appointment.guests,
      guestsIsArray: Array.isArray(appointment.guests),
      guestsLength: appointment.guests ? appointment.guests.length : 0
    });

    // Buscar integração Google Calendar
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('credentials')
      .eq('user_id', userId)
      .eq('integration_type', 'google_calendar')
      .eq('status', 'active')
      .single();

    if (integrationError || !integration?.credentials) {
      console.error('❌ Integração não encontrada:', integrationError);
      res.status(401).json({ error: 'Integração Google Calendar não encontrada' });
      return;
    }

    console.log('✅ Integração encontrada para usuário:', userId);

    // Configurar OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials(integration.credentials);

    // ✅ VERIFICAR PERMISSÕES DA CONTA GOOGLE
    console.log('🔍 Verificando permissões da conta Google...');
    const hasPermissions = await checkGoogleAccountPermissions(oauth2Client);
    if (!hasPermissions) {
      console.warn('⚠️ Possíveis limitações na conta Google para videoconferência');
    }

    // ✅ VALIDAÇÃO DE DISPONIBILIDADE
    if (!skipAvailabilityCheck) {
      console.log('🔍 Verificando disponibilidade...');
      
      const availabilityResult = await checkCalendarAvailability(
        oauth2Client,
        appointment.start_time,
        appointment.end_time
      );

      if (!availabilityResult.available) {
        console.error('❌ Horário não disponível - conflitos encontrados');
        res.status(409).json({ 
          error: 'Horário não disponível',
          message: 'Já existe um evento agendado para este horário',
          conflictingEvents: availabilityResult.conflictingEvents?.map(event => ({
            summary: event.summary,
            start: event.start?.dateTime || event.start?.date,
            end: event.end?.dateTime || event.end?.date
          }))
        });
        return;
      }
      
      console.log('✅ Horário disponível - prosseguindo com criação');
    }

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Criar lista de participantes incluindo o dono
    const attendees = [];

    // Adicionar cliente
    if (appointment.clients?.email) {
      attendees.push({ email: appointment.clients.email });
    }

    // Adicionar convidados (guests)
    console.log('🔍 Processando convidados...');
    console.log('🔍 appointment.guests:', appointment.guests);
    console.log('🔍 appointment.guests é array?', Array.isArray(appointment.guests));
    
    if (appointment.guests && Array.isArray(appointment.guests) && appointment.guests.length > 0) {
      console.log('✅ Encontrados convidados para adicionar:', appointment.guests.length);
      appointment.guests.forEach((guestEmail: string, index: number) => {
        console.log(`🔍 Processando convidado ${index + 1}:`, guestEmail);
        if (guestEmail && guestEmail.trim() !== '') {
          attendees.push({ email: guestEmail.trim() });
          console.log('✅ Convidado adicionado:', guestEmail.trim());
        } else {
          console.log('⚠️ Convidado ignorado (vazio):', guestEmail);
        }
      });
    } else {
      console.log('⚠️ Nenhum convidado encontrado ou lista vazia');
      console.log('🔍 Tipo de guests:', typeof appointment.guests);
      console.log('🔍 Valor de guests:', appointment.guests);
    }

    // Adicionar dono do calendário usando alias
    if (ownerData?.email) {
      attendees.push({ 
        email: createGmailAlias(ownerData.email),
        organizer: false
      });
      console.log('✅ Dono adicionado como participante:', createGmailAlias(ownerData.email));
    }

    console.log('📋 Lista final de participantes:', attendees.map(a => a.email));
    console.log('📊 Total de participantes:', attendees.length);

    // Criar evento no formato correto do Google Calendar
    const event = {
      summary: `${appointment.specialties?.name || 'Agendamento'}`,
      description: `Agendamento com ${appointment.professionals?.name || 'Profissional'}${appointment.notes ? `\n\nObservações: ${appointment.notes}` : ''}\n\n---\nDesenvolvido por Merlindesk.com`,
      start: {
        dateTime: appointment.start_time,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: appointment.end_time,
        timeZone: 'America/Sao_Paulo',
      },
      attendees: attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 dia antes
          { method: 'popup', minutes: 15 }, // 15 minutos antes
        ],
      },
      // ✅ CONFIGURAÇÃO PARA VIDEOCONFERÊNCIA
      conferenceData: {
        createRequest: {
          requestId: `meet-${appointmentId}-${Date.now()}`,
          conferenceSolutionKey: {
            type: 'hangoutsMeet'
          }
        }
      },
      // ✅ CONFIGURAÇÃO ADICIONAL PARA GARANTIR VIDEOCONFERÊNCIA
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
    };

    console.log('🔍 Criando evento:', event);

    // Criar evento no Google Calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all',
      // ✅ CONFIGURAÇÃO ADICIONAL PARA FORÇAR VIDEOCONFERÊNCIA
      conferenceDataVersion: 1
    });

    console.log('✅ Evento criado no Google Calendar:', response.data.id);

    // ✅ Log detalhado da resposta do Google
    console.log('📋 Resposta completa do Google:', JSON.stringify(response.data, null, 2));

    // ✅ Extrair link da videoconferência se disponível
    const conferenceLink = response.data.conferenceData?.entryPoints?.find(
      (entry: any) => entry.entryPointType === 'video'
    )?.uri;

    console.log('🔗 Link da videoconferência:', conferenceLink);
    console.log('🔍 conferenceData completo:', response.data.conferenceData);

    // ✅ Se não foi criado automaticamente, tentar adicionar videoconferência
    let finalConferenceLink = conferenceLink;
    if (!conferenceLink && response.data.id) {
      console.log('🔄 Tentando adicionar videoconferência manualmente...');
      try {
        const updateResponse = await calendar.events.patch({
          calendarId: 'primary',
          eventId: response.data.id,
          requestBody: {
            conferenceData: {
              createRequest: {
                requestId: `meet-update-${appointmentId}-${Date.now()}`,
                conferenceSolutionKey: {
                  type: 'hangoutsMeet'
                }
              }
            }
          },
          sendUpdates: 'none' // Não enviar notificações para não spam
        });

        console.log('✅ Videoconferência adicionada manualmente');
        console.log('📋 Resposta do update:', JSON.stringify(updateResponse.data, null, 2));

        finalConferenceLink = updateResponse.data.conferenceData?.entryPoints?.find(
          (entry: any) => entry.entryPointType === 'video'
        )?.uri;

        console.log('🔗 Link final da videoconferência:', finalConferenceLink);
      } catch (updateErr: any) {
        console.error('⚠️ Erro ao adicionar videoconferência manualmente:', updateErr);
      }
    }

    // Atualizar agendamento com google_event_id e link da videoconferência
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ 
        google_event_id: response.data.id,
        video_conference_link: finalConferenceLink || null
      })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('⚠️ Erro ao atualizar google_event_id:', updateError);
    }

    res.json({ 
      success: true, 
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      videoConferenceLink: finalConferenceLink,
      notificationsSent: attendees.length,
      participants: attendees.map(a => a.email),
      availabilityChecked: !skipAvailabilityCheck
    });

  } catch (err: any) {
    console.error('❌ Erro detalhado ao criar evento:', err);
    
    if (err.response?.data) {
      console.error('📋 Resposta da API Google:', err.response.data);
    }
    
    res.status(500).json({ 
      error: 'Erro ao criar evento no Google Calendar',
      details: err.message 
    });
  }
});

// PUT /calendar/update-event (atualizar evento existente)
router.put('/calendar/update-event', async (req: Request, res: Response): Promise<void> => {
  const { appointmentId, userId, googleEventId } = req.body;

  console.log('🔍 Atualizando evento:', { appointmentId, userId, googleEventId });

  if (!appointmentId || !userId || !googleEventId) {
    res.status(400).json({ error: 'appointmentId, userId e googleEventId são obrigatórios' });
    return;
  }

  try {
    // Buscar dados do agendamento
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .select(`
        *,
        clients(name, email),
        professionals(name),
        specialties(name),
        guests
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error('❌ Agendamento não encontrado:', appointmentError);
      res.status(404).json({ error: 'Agendamento não encontrado' });
      return;
    }

    console.log('✅ Agendamento encontrado:', appointment.id);
    console.log('🔍 Dados do agendamento:', {
      id: appointment.id,
      clientEmail: appointment.clients?.email,
      guests: appointment.guests,
      guestsType: typeof appointment.guests,
      guestsIsArray: Array.isArray(appointment.guests),
      guestsLength: appointment.guests ? appointment.guests.length : 0
    });

    // Buscar integração Google Calendar
    const { data: integration, error: integrationError } = await supabase
      .from('user_integrations')
      .select('credentials')
      .eq('user_id', userId)
      .eq('integration_type', 'google_calendar')
      .eq('status', 'active')
      .single();

    if (integrationError || !integration?.credentials) {
      console.error('❌ Integração não encontrada:', integrationError);
      res.status(401).json({ error: 'Integração Google Calendar não encontrada' });
      return;
    }

    console.log('✅ Integração encontrada para usuário:', userId);

    // Configurar OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    
    oauth2Client.setCredentials(integration.credentials);

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    // Criar lista de participantes incluindo o dono
    const attendees = [];

    // Adicionar cliente
    if (appointment.clients?.email) {
      attendees.push({ email: appointment.clients.email });
    }

    // Adicionar convidados (guests)
    console.log('🔍 Processando convidados...');
    console.log('🔍 appointment.guests:', appointment.guests);
    console.log('🔍 appointment.guests é array?', Array.isArray(appointment.guests));
    
    if (appointment.guests && Array.isArray(appointment.guests) && appointment.guests.length > 0) {
      console.log('✅ Encontrados convidados para adicionar:', appointment.guests.length);
      appointment.guests.forEach((guestEmail: string, index: number) => {
        console.log(`🔍 Processando convidado ${index + 1}:`, guestEmail);
        if (guestEmail && guestEmail.trim() !== '') {
          attendees.push({ email: guestEmail.trim() });
          console.log('✅ Convidado adicionado:', guestEmail.trim());
        } else {
          console.log('⚠️ Convidado ignorado (vazio):', guestEmail);
        }
      });
    } else {
      console.log('⚠️ Nenhum convidado encontrado ou lista vazia');
      console.log('🔍 Tipo de guests:', typeof appointment.guests);
      console.log('🔍 Valor de guests:', appointment.guests);
    }

    console.log('📋 Lista final de participantes:', attendees.map(a => a.email));
    console.log('📊 Total de participantes:', attendees.length);

    // Atualizar evento no Google Calendar
    const event = {
      summary: `${appointment.specialties?.name || 'Agendamento'}`,
      description: `Agendamento com ${appointment.professionals?.name || 'Profissional'}${appointment.notes ? `\n\nObservações: ${appointment.notes}` : ''}\n\n---\nDesenvolvido por Merlindesk.com`,
      start: {
        dateTime: appointment.start_time,
        timeZone: 'America/Sao_Paulo',
      },
      end: {
        dateTime: appointment.end_time,
        timeZone: 'America/Sao_Paulo',
      },
      attendees: attendees,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 dia antes
          { method: 'popup', minutes: 15 }, // 15 minutos antes
        ],
      },
      guestsCanModify: false,
      guestsCanInviteOthers: false,
      guestsCanSeeOtherGuests: true,
    };

    console.log('🔍 Atualizando evento:', event);

    const response = await calendar.events.update({
      calendarId: 'primary',
      eventId: googleEventId,
      requestBody: event,
      sendUpdates: 'all',
    });

    console.log('✅ Evento atualizado no Google Calendar:', response.data.id);

    // Extrair link da videoconferência se disponível
    const conferenceLink = response.data.conferenceData?.entryPoints?.find(
      (entry: any) => entry.entryPointType === 'video'
    )?.uri;

    console.log('🔗 Link da videoconferência:', conferenceLink);

    // Atualizar agendamento com link da videoconferência se necessário
    if (conferenceLink && conferenceLink !== appointment.video_conference_link) {
      const { error: updateError } = await supabase
        .from('appointments')
        .update({ video_conference_link: conferenceLink })
        .eq('id', appointmentId);

      if (updateError) {
        console.error('⚠️ Erro ao atualizar video_conference_link:', updateError);
      }
    }

    res.json({ 
      success: true, 
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      videoConferenceLink: conferenceLink,
      participants: attendees.map(a => a.email),
      message: 'Evento atualizado com sucesso'
    });

  } catch (err: any) {
    console.error('❌ Erro ao atualizar evento:', err);
    res.status(500).json({ 
      error: 'Erro ao atualizar evento no Google Calendar',
      details: err.message 
    });
  }
});

export default router;
