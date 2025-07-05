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
// ✅ FUNÇÃO PARA VERIFICAR PERMISSÕES DA CONTA GOOGLE
async function checkGoogleAccountPermissions(oauth2Client) {
    try {
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
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
    }
    catch (error) {
        console.error('❌ Erro ao verificar permissões da conta Google:', error);
        return false;
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
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
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
        // Adicionar convidados (guests)
        console.log('🔍 Processando convidados...');
        console.log('🔍 appointment.guests:', appointment.guests);
        console.log('🔍 appointment.guests é array?', Array.isArray(appointment.guests));
        if (appointment.guests && Array.isArray(appointment.guests) && appointment.guests.length > 0) {
            console.log('✅ Encontrados convidados para adicionar:', appointment.guests.length);
            appointment.guests.forEach((guestEmail, index) => {
                console.log(`🔍 Processando convidado ${index + 1}:`, guestEmail);
                if (guestEmail && guestEmail.trim() !== '') {
                    attendees.push({ email: guestEmail.trim() });
                    console.log('✅ Convidado adicionado:', guestEmail.trim());
                }
                else {
                    console.log('⚠️ Convidado ignorado (vazio):', guestEmail);
                }
            });
        }
        else {
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
        const conferenceLink = response.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri;
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
                finalConferenceLink = updateResponse.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri;
                console.log('🔗 Link final da videoconferência:', finalConferenceLink);
            }
            catch (updateErr) {
                console.error('⚠️ Erro ao adicionar videoconferência manualmente:', updateErr);
            }
        }
        // Atualizar agendamento com google_event_id e link da videoconferência
        const { error: updateError } = await supabase
            .from('appointments')
            .update({
            google_event_id: response.data.id,
            video_conference_link: finalConferenceLink || null,
            sync_source: 'merlin', // Marcar como originado do Merlin
            last_sync_at: new Date().toISOString()
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
// PUT /calendar/update-event (atualizar evento existente)
router.put('/calendar/update-event', async (req, res) => {
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
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials(integration.credentials);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
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
            appointment.guests.forEach((guestEmail, index) => {
                console.log(`🔍 Processando convidado ${index + 1}:`, guestEmail);
                if (guestEmail && guestEmail.trim() !== '') {
                    attendees.push({ email: guestEmail.trim() });
                    console.log('✅ Convidado adicionado:', guestEmail.trim());
                }
                else {
                    console.log('⚠️ Convidado ignorado (vazio):', guestEmail);
                }
            });
        }
        else {
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
        const conferenceLink = response.data.conferenceData?.entryPoints?.find((entry) => entry.entryPointType === 'video')?.uri;
        console.log('🔗 Link da videoconferência:', conferenceLink);
        // Atualizar agendamento com link da videoconferência se necessário
        if (conferenceLink && conferenceLink !== appointment.video_conference_link) {
            const { error: updateError } = await supabase
                .from('appointments')
                .update({
                video_conference_link: conferenceLink,
                sync_source: 'merlin', // Marcar como originado do Merlin
                last_sync_at: new Date().toISOString()
            })
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
    }
    catch (err) {
        console.error('❌ Erro ao atualizar evento:', err);
        res.status(500).json({
            error: 'Erro ao atualizar evento no Google Calendar',
            details: err.message
        });
    }
});
// ✅ NOVA ROTA - Webhook para receber notificações do Google Calendar
router.post('/calendar/webhook', async (req, res) => {
    console.log('🔔 Webhook recebido do Google Calendar');
    try {
        const { headers } = req;
        // Verificar se é uma notificação válida do Google
        const resourceId = headers['x-goog-resource-id'];
        const resourceUri = headers['x-goog-resource-uri'];
        const channelId = headers['x-goog-channel-id'];
        if (!resourceId || !resourceUri || !channelId) {
            console.log('⚠️ Webhook inválido - headers ausentes');
            res.status(400).json({ error: 'Webhook inválido' });
            return;
        }
        console.log('🔍 Webhook válido:', { resourceId, channelId });
        // Buscar integração pelo channel_id
        const { data: integration, error: integrationError } = await supabase
            .from('user_integrations')
            .select('user_id, credentials, google_sync_enabled')
            .eq('google_webhook_url', channelId)
            .eq('google_sync_enabled', true)
            .single();
        if (integrationError || !integration) {
            console.log('❌ Integração não encontrada para channel:', channelId);
            res.status(404).json({ error: 'Integração não encontrada' });
            return;
        }
        if (!integration.google_sync_enabled) {
            console.log('⚠️ Sincronização desabilitada para usuário:', integration.user_id);
            res.status(200).json({ message: 'Sincronização desabilitada' });
            return;
        }
        // Configurar OAuth2 client
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials(integration.credentials);
        // Buscar eventos modificados
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        // Buscar eventos recentes (últimas 24 horas)
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const eventsResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: yesterday.toISOString(),
            timeMax: now.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });
        const events = eventsResponse.data.items || [];
        console.log(`🔍 Encontrados ${events.length} eventos para sincronizar`);
        let syncedCount = 0;
        let errorCount = 0;
        for (const event of events) {
            if (event.status === 'cancelled') {
                // Marcar agendamento como cancelado no Merlin
                const { data: appointment } = await supabase
                    .from('appointments')
                    .select('id')
                    .eq('google_event_id', event.id)
                    .single();
                if (appointment) {
                    await supabase
                        .from('appointments')
                        .update({
                        status: 'canceled',
                        sync_source: 'google',
                        last_sync_at: new Date().toISOString()
                    })
                        .eq('id', appointment.id);
                    console.log('✅ Agendamento cancelado no Merlin:', appointment.id);
                    syncedCount++;
                }
            }
            else {
                // Sincronizar evento
                const result = await syncGoogleEventToMerlin(oauth2Client, event.id, integration.user_id);
                if (result.success) {
                    syncedCount++;
                }
                else {
                    errorCount++;
                    console.error('❌ Erro ao sincronizar evento:', event.id, result.error);
                }
            }
        }
        console.log(`✅ Sincronização concluída: ${syncedCount} eventos sincronizados, ${errorCount} erros`);
        res.json({
            success: true,
            syncedCount,
            errorCount,
            message: 'Webhook processado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao processar webhook:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});
// ✅ NOVA ROTA - Configurar webhook do Google Calendar
router.post('/calendar/setup-webhook', async (req, res) => {
    const { userId } = req.body;
    console.log('🔧 Configurando webhook para usuário:', userId);
    if (!userId) {
        res.status(400).json({ error: 'userId é obrigatório' });
        return;
    }
    try {
        // Buscar integração Google Calendar
        const { data: integration, error: integrationError } = await supabase
            .from('user_integrations')
            .select('credentials')
            .eq('user_id', userId)
            .eq('integration_type', 'google_calendar')
            .eq('status', 'active')
            .single();
        if (integrationError || !integration?.credentials) {
            res.status(401).json({ error: 'Integração Google Calendar não encontrada' });
            return;
        }
        // Configurar OAuth2 client
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials(integration.credentials);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        // Gerar URL única para o webhook
        const webhookUrl = `${process.env.VITE_API_URL}/google/calendar/webhook`;
        const channelId = `merlin-${userId}-${Date.now()}`;
        // Configurar webhook no Google Calendar
        const watchResponse = await calendar.events.watch({
            calendarId: 'primary',
            requestBody: {
                id: channelId,
                type: 'web_hook',
                address: webhookUrl,
                params: {
                    ttl: '604800' // 7 dias em segundos
                }
            }
        });
        console.log('📡 Resposta do Google (watch):', JSON.stringify(watchResponse.data, null, 2));
        // 🔐 Se 'expiration' não for fornecido, define 7 dias a partir de agora
        const expiration = watchResponse.data.expiration || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        // Atualizar integração com informações do webhook
        const { error: updateError } = await supabase
            .from('user_integrations')
            .update({
            google_webhook_url: channelId,
            google_webhook_expires_at: new Date(Number(watchResponse.data.expiration)).toISOString(),
            google_sync_enabled: true
        })
            .eq('user_id', userId)
            .eq('integration_type', 'google_calendar');
        if (updateError) {
            console.error('❌ Erro ao atualizar webhook:', updateError);
            res.status(500).json({ error: 'Erro ao salvar configuração do webhook' });
            return;
        }
        console.log('✅ Webhook configurado com sucesso:', channelId);
        res.json({
            success: true,
            channelId,
            expiration,
            message: 'Webhook configurado com sucesso'
        });
    }
    catch (error) {
        console.error('❌ Erro ao configurar webhook:', error);
        res.status(500).json({
            error: 'Erro ao configurar webhook',
            details: error.message
        });
    }
});
// ✅ NOVA ROTA - Sincronizar manualmente eventos do Google
router.post('/calendar/sync-from-google', async (req, res) => {
    const { userId, days = 7 } = req.body;
    console.log('🔄 Sincronização manual do Google Calendar para usuário:', userId);
    if (!userId) {
        res.status(400).json({ error: 'userId é obrigatório' });
        return;
    }
    try {
        // Buscar integração Google Calendar
        const { data: integration, error: integrationError } = await supabase
            .from('user_integrations')
            .select('credentials')
            .eq('user_id', userId)
            .eq('integration_type', 'google_calendar')
            .eq('status', 'active')
            .single();
        if (integrationError || !integration?.credentials) {
            res.status(401).json({ error: 'Integração Google Calendar não encontrada' });
            return;
        }
        // Configurar OAuth2 client
        const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        oauth2Client.setCredentials(integration.credentials);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        // Buscar eventos dos últimos X dias
        const now = new Date();
        const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
        const eventsResponse = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: now.toISOString(),
            singleEvents: true,
            orderBy: 'startTime'
        });
        const events = eventsResponse.data.items || [];
        console.log(`🔍 Encontrados ${events.length} eventos para sincronizar`);
        let syncedCount = 0;
        let errorCount = 0;
        for (const event of events) {
            const result = await syncGoogleEventToMerlin(oauth2Client, event.id, userId);
            if (result.success) {
                syncedCount++;
            }
            else {
                errorCount++;
                console.error('❌ Erro ao sincronizar evento:', event.id, result.error);
            }
        }
        console.log(`✅ Sincronização manual concluída: ${syncedCount} eventos sincronizados, ${errorCount} erros`);
        res.json({
            success: true,
            syncedCount,
            errorCount,
            totalEvents: events.length,
            message: 'Sincronização manual concluída'
        });
    }
    catch (error) {
        console.error('❌ Erro na sincronização manual:', error);
        res.status(500).json({
            error: 'Erro na sincronização manual',
            details: error.message
        });
    }
});
// ✅ FUNÇÃO - Sincronizar evento do Google para o Merlin
async function syncGoogleEventToMerlin(oauth2Client, googleEventId, userId) {
    try {
        console.log('🔄 Sincronizando evento do Google para o Merlin:', googleEventId);
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        // Buscar evento no Google Calendar
        const eventResponse = await calendar.events.get({
            calendarId: 'primary',
            eventId: googleEventId
        });
        const event = eventResponse.data;
        // Verificar se é um evento do Merlin (tem descrição específica)
        if (!event.description?.includes('Desenvolvido por Merlindesk.com')) {
            console.log('⚠️ Evento não é do Merlin, ignorando:', event.summary);
            return { success: false, error: 'Evento não é do Merlin' };
        }
        // Verificar se já existe um agendamento com este google_event_id
        const { data: existingAppointment } = await supabase
            .from('appointments')
            .select('id')
            .eq('google_event_id', googleEventId)
            .single();
        if (existingAppointment) {
            console.log('✅ Agendamento já existe, atualizando:', existingAppointment.id);
            return await updateMerlinAppointmentFromGoogle(event, existingAppointment.id, userId);
        }
        // Extrair informações do evento
        const eventInfo = extractEventInfoFromGoogle(event, userId);
        if (!eventInfo) {
            console.log('❌ Não foi possível extrair informações do evento');
            return { success: false, error: 'Informações do evento inválidas' };
        }
        // Criar novo agendamento no Merlin
        const { data: newAppointment, error: insertError } = await supabase
            .from('appointments')
            .insert({
            ...eventInfo,
            google_event_id: googleEventId,
            sync_source: 'google',
            last_sync_at: new Date().toISOString()
        })
            .select()
            .single();
        if (insertError) {
            console.error('❌ Erro ao criar agendamento:', insertError);
            return { success: false, error: insertError.message };
        }
        console.log('✅ Agendamento criado no Merlin:', newAppointment.id);
        return { success: true, appointmentId: newAppointment.id };
    }
    catch (error) {
        console.error('❌ Erro ao sincronizar evento do Google:', error);
        return { success: false, error: error.message };
    }
}
// ✅ FUNÇÃO - Extrair informações do evento do Google
function extractEventInfoFromGoogle(event, userId) {
    try {
        const startTime = new Date(event.start?.dateTime || event.start?.date);
        const endTime = new Date(event.end?.dateTime || event.end?.date);
        // Extrair informações da descrição
        const description = event.description || '';
        const notesMatch = description.match(/Observações: (.+?)(?:\n|$)/);
        const notes = notesMatch ? notesMatch[1] : null;
        return {
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            status: 'confirmed',
            notes: notes,
            sync_source: 'google',
            // Outros campos serão preenchidos baseados no cliente encontrado
        };
    }
    catch (error) {
        console.error('❌ Erro ao extrair informações do evento:', error);
        return null;
    }
}
// ✅ FUNÇÃO - Atualizar agendamento existente do Google
async function updateMerlinAppointmentFromGoogle(event, appointmentId, userId) {
    try {
        const eventInfo = extractEventInfoFromGoogle(event, userId);
        if (!eventInfo) {
            return { success: false, error: 'Informações do evento inválidas' };
        }
        // Atualizar agendamento
        const { error: updateError } = await supabase
            .from('appointments')
            .update({
            ...eventInfo,
            sync_source: 'google',
            last_sync_at: new Date().toISOString()
        })
            .eq('id', appointmentId);
        if (updateError) {
            console.error('❌ Erro ao atualizar agendamento:', updateError);
            return { success: false, error: updateError.message };
        }
        console.log('✅ Agendamento atualizado no Merlin:', appointmentId);
        return { success: true };
    }
    catch (error) {
        console.error('❌ Erro ao atualizar agendamento do Google:', error);
        return { success: false, error: error.message };
    }
}
exports.default = router;
