"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// google-calendar.ts (Operações específicas do calendário)
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const router = express_1.default.Router();
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY);
// Função para criar alias do Gmail
function createGmailAlias(email) {
    if (email.includes('@gmail.com')) {
        const [localPart, domain] = email.split('@');
        return `${localPart}+calendar@${domain}`;
    }
    return email;
}
// Função para verificar disponibilidade (reutilizada do google.ts)
async function checkCalendarAvailability(oauth2Client, startTime, endTime, calendarId = 'primary') {
    try {
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
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
            if (event.status === 'cancelled')
                return false;
            if (event.start?.date && !event.start?.dateTime)
                return false;
            const eventStart = new Date(event.start?.dateTime || event.start?.date);
            const eventEnd = new Date(event.end?.dateTime || event.end?.date);
            const requestStart = new Date(startTime);
            const requestEnd = new Date(endTime);
            return (requestStart < eventEnd && requestEnd > eventStart);
        });
        return {
            available: conflictingEvents.length === 0,
            conflictingEvents: conflictingEvents.length > 0 ? conflictingEvents : undefined
        };
    }
    catch (error) {
        console.error('❌ Erro ao verificar disponibilidade:', error);
        throw new Error('Erro ao verificar disponibilidade no calendário');
    }
}
// POST /calendar/create-event (com validação de disponibilidade)
router.post('/calendar/create-event', async (req, res) => {
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
        specialties(name)
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
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials(integration.credentials);
        // ✅ VALIDAÇÃO DE DISPONIBILIDADE
        if (!skipAvailabilityCheck) {
            console.log('🔍 Verificando disponibilidade...');
            const availabilityResult = await checkCalendarAvailability(oauth2Client, appointment.start_time, appointment.end_time);
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
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        // Criar lista de participantes incluindo o dono
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
            notificationsSent: attendees.length,
            availabilityChecked: !skipAvailabilityCheck
        });
    }
    catch (err) {
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
exports.default = router;
