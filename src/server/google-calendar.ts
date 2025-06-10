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

// POST /google/calendar/create-event
router.post('/calendar/create-event', async (req: Request, res: Response): Promise<void> => {
  const { appointmentId, userId } = req.body;

  console.log('🔍 Dados recebidos:', { appointmentId, userId });

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
        specialties(name)
      `)
      .eq('id', appointmentId)
      .single();

    if (appointmentError || !appointment) {
      console.error('❌ Agendamento não encontrado:', appointmentError);
      res.status(404).json({ error: 'Agendamento não encontrado' });
      return;
    }

    // ✅ NOVO: Buscar email do dono do calendário
    const { data: ownerData } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();

    console.log('✅ Agendamento encontrado:', appointment.id);

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

    // ✅ NOVO: Função para criar alias do Gmail
    function createGmailAlias(email: string): string {
      if (email.includes('@gmail.com')) {
        const [localPart, domain] = email.split('@');
        return `${localPart}+calendar@${domain}`;
      }
      return email;
    }

    // ✅ NOVO: Criar lista de participantes incluindo o dono
    const attendees = [];

    // Adicionar cliente
    if (appointment.clients?.email) {
      attendees.push({ email: appointment.clients.email });
    }

    // Adicionar dono do calendário usando alias
    if (ownerData?.email) {
      attendees.push({ 
        email: createGmailAlias(ownerData.email),
        organizer: false
      });
      console.log('✅ Dono adicionado como participante:', createGmailAlias(ownerData.email));
    }

    // Criar evento no formato correto do Google Calendar
    const event = {
      summary: `${appointment.specialties?.name || 'Agendamento'}`,
      description: `Agendamento com ${appointment.professionals?.name || 'Profissional'}${appointment.notes ? `\n\nObservações: ${appointment.notes}` : ''}`,
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
    };

    console.log('🔍 Criando evento:', event);

    // Criar evento no Google Calendar
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      sendUpdates: 'all'
    });

    console.log('✅ Evento criado no Google Calendar:', response.data.id);

    // Atualizar agendamento com google_event_id
    const { error: updateError } = await supabase
      .from('appointments')
      .update({ google_event_id: response.data.id })
      .eq('id', appointmentId);

    if (updateError) {
      console.error('⚠️ Erro ao atualizar google_event_id:', updateError);
    }

    res.json({ 
      success: true, 
      eventId: response.data.id,
      eventLink: response.data.htmlLink,
      notificationsSent: attendees.length
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

export default router;