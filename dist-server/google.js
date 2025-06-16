"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// google.ts (Versão para Produção - Corrigida com Validação de Disponibilidade)
const express_1 = __importDefault(require("express"));
const googleapis_1 = require("googleapis");
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const ioredis_1 = __importDefault(require("ioredis"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const router = express_1.default.Router();
// Configuração do Redis para produção
const redis = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    keepAlive: 30000,
    retryStrategy: (times) => Math.min(times * 100, 2000),
});
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY);
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
// Constantes de configuração
const PKCE_EXPIRY_SECONDS = 600; // 10 minutos
const RATE_LIMIT_WINDOW = 3600; // 1 hora
const MAX_REQUESTS_PER_HOUR = 50;
// Função para gerar code_verifier seguro
function generateCodeVerifier() {
    return crypto_1.default.randomBytes(32).toString('base64url');
}
// Função para gerar code_challenge
function generateCodeChallenge(verifier) {
    return crypto_1.default.createHash('sha256').update(verifier).digest('base64url');
}
// ✅ NOVA FUNÇÃO - Verificar disponibilidade no Google Calendar
async function checkCalendarAvailability(oauth2Client, startTime, endTime, calendarId = 'primary') {
    try {
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        // Buscar eventos no período especificado
        const response = await calendar.events.list({
            calendarId: calendarId,
            timeMin: startTime,
            timeMax: endTime,
            singleEvents: true,
            orderBy: 'startTime',
            maxResults: 50
        });
        const events = response.data.items || [];
        // Filtrar eventos que não são cancelados e que realmente conflitam
        const conflictingEvents = events.filter(event => {
            // Ignorar eventos cancelados
            if (event.status === 'cancelled')
                return false;
            // Ignorar eventos de dia inteiro
            if (event.start?.date && !event.start?.dateTime)
                return false;
            // Verificar sobreposição de horários
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
// ✅ NOVA FUNÇÃO - Usar FreeBusy API para verificação mais eficiente
async function checkFreeBusyAvailability(oauth2Client, startTime, endTime, calendarId = 'primary') {
    try {
        const calendar = googleapis_1.google.calendar({ version: 'v3', auth: oauth2Client });
        const response = await calendar.freebusy.query({
            requestBody: {
                timeMin: startTime,
                timeMax: endTime,
                items: [{ id: calendarId }]
            }
        });
        const busySlots = response.data.calendars?.[calendarId]?.busy || [];
        // Verificar se há sobreposição com slots ocupados
        const requestStart = new Date(startTime);
        const requestEnd = new Date(endTime);
        const hasConflict = busySlots.some(slot => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            return (requestStart < slotEnd && requestEnd > slotStart);
        });
        return {
            available: !hasConflict,
            busySlots: hasConflict ? busySlots : undefined
        };
    }
    catch (error) {
        console.error('❌ Erro ao verificar FreeBusy:', error);
        throw new Error('Erro ao verificar disponibilidade via FreeBusy');
    }
}
// Middleware de rate limiting
async function rateLimitMiddleware(req, res, next) {
    const clientIP = req.ip || req.socket.remoteAddress || 'unknown';
    const key = `rate_limit:${clientIP}`;
    try {
        const current = await redis.incr(key);
        if (current === 1) {
            await redis.expire(key, RATE_LIMIT_WINDOW);
        }
        if (current > MAX_REQUESTS_PER_HOUR) {
            res.status(429).json({
                error: 'Rate limit exceeded',
                retry_after: await redis.ttl(key)
            });
            return;
        }
        next();
    }
    catch (error) {
        console.error('Rate limit error:', error);
        next(); // Continuar em caso de erro do Redis
    }
}
// Middleware de validação de entrada
function validateUserId(req, res, next) {
    const userId = req.query.user_id || req.params.user_id || req.body.user_id;
    if (!userId || typeof userId !== 'string' || userId.length < 1 || userId.length > 100) {
        res.status(400).json({ error: 'user_id inválido ou ausente' });
        return;
    }
    // Sanitizar user_id
    const sanitizedUserId = userId.replace(/[^a-zA-Z0-9\-_]/g, '');
    if (sanitizedUserId !== userId) {
        res.status(400).json({ error: 'user_id contém caracteres inválidos' });
        return;
    }
    next();
}
// Rota de login Google com rate limiting
router.get('/auth', rateLimitMiddleware, validateUserId, async (req, res) => {
    const userId = req.query.user_id;
    try {
        // Verificar se já existe uma sessão PKCE ativa
        const existingVerifier = await redis.get(`pkce:${userId}`);
        if (existingVerifier) {
            console.log(`Sessão PKCE existente encontrada para usuário ${userId}`);
        }
        // Gerar novos parâmetros PKCE
        const codeVerifier = generateCodeVerifier();
        const codeChallenge = generateCodeChallenge(codeVerifier);
        // Armazenar code_verifier no Redis com TTL
        await redis.setex(`pkce:${userId}`, PKCE_EXPIRY_SECONDS, codeVerifier);
        // Gerar URL de autorização
        const url = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: ['https://www.googleapis.com/auth/calendar'],
            prompt: 'consent',
            state: userId,
            include_granted_scopes: true,
            code_challenge: codeChallenge,
            code_challenge_method: 'S256',
        });
        console.log(`✅ PKCE iniciado para usuário ${userId}`);
        res.redirect(url);
    }
    catch (error) {
        console.error('Erro ao iniciar autenticação:', error);
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Tente novamente em alguns instantes'
        });
    }
});
// Rota de callback Google
router.get('/callback', async (req, res) => {
    const { code, state, error } = req.query;
    // Log da requisição para auditoria
    console.log(`Callback recebido - State: ${state}, Error: ${error || 'none'}`);
    if (error) {
        console.error('Erro na autorização Google:', error);
        res.status(400).send(generateErrorPage(`Erro na autorização: ${error}`));
        return;
    }
    if (!code || !state) {
        res.status(400).send(generateErrorPage('Parâmetros obrigatórios ausentes'));
        return;
    }
    const userId = state;
    try {
        // Recuperar e validar code_verifier
        const codeVerifier = await redis.get(`pkce:${userId}`);
        if (!codeVerifier) {
            console.error(`Code verifier não encontrado para usuário ${userId}`);
            res.status(400).send(generateErrorPage('Sessão expirada ou inválida. Tente fazer login novamente.'));
            return;
        }
        // Trocar código por tokens usando PKCE
        const { tokens } = await oauth2Client.getToken({
            code: code,
            codeVerifier: codeVerifier,
        });
        // Validar tokens recebidos
        if (!tokens.access_token) {
            throw new Error('Access token não recebido');
        }
        console.log(`✅ Tokens obtidos com sucesso para usuário ${userId}`);
        oauth2Client.setCredentials(tokens);
        // Limpar code_verifier após uso bem-sucedido
        await redis.del(`pkce:${userId}`);
        // Salvar integração no Supabase com retry
        const integrationData = {
            user_id: userId,
            integration_type: 'google_calendar',
            status: 'active',
            credentials: {
                ...tokens,
                // Não armazenar informações sensíveis desnecessárias
                id_token: undefined,
            },
            updated_at: new Date().toISOString(),
        };
        let retryCount = 0;
        const maxRetries = 3;
        while (retryCount < maxRetries) {
            try {
                const { error: supabaseError } = await supabase
                    .from('user_integrations')
                    .upsert(integrationData, { onConflict: 'user_id,integration_type' });
                if (supabaseError) {
                    throw supabaseError;
                }
                break; // Sucesso, sair do loop
            }
            catch (dbError) {
                retryCount++;
                console.error(`Tentativa ${retryCount} falhou ao salvar integração:`, dbError);
                if (retryCount >= maxRetries) {
                    throw dbError;
                }
                // Aguardar antes de tentar novamente
                await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
            }
        }
        // Log de auditoria
        console.log(`✅ Integração Google Calendar salva com sucesso para usuário ${userId}`);
        // Invalidar cache relacionado se existir
        await redis.del(`integration_status:${userId}`);
        res.send(generateSuccessPage());
    }
    catch (err) {
        console.error('Erro no callback do Google:', err);
        // Limpar code_verifier em caso de erro
        try {
            await redis.del(`pkce:${userId}`);
        }
        catch (redisError) {
            console.error('Erro ao limpar Redis:', redisError);
        }
        res.status(500).send(generateErrorPage('Erro ao processar integração. Tente novamente.'));
    }
});
// ✅ NOVA ROTA - Verificar disponibilidade usando Events API
router.post('/calendar/check-availability', rateLimitMiddleware, validateUserId, async (req, res) => {
    const { user_id, startTime, endTime, calendarId = 'primary' } = req.body;
    if (!startTime || !endTime) {
        res.status(400).json({
            error: 'startTime e endTime são obrigatórios'
        });
        return;
    }
    try {
        // Buscar integração Google Calendar
        const { data: integration, error: integrationError } = await supabase
            .from('user_integrations')
            .select('credentials')
            .eq('user_id', user_id)
            .eq('integration_type', 'google_calendar')
            .eq('status', 'active')
            .single();
        if (integrationError || !integration?.credentials) {
            res.status(401).json({
                error: 'Integração Google Calendar não encontrada'
            });
            return;
        }
        // Configurar OAuth2 client
        const userOAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        userOAuth2Client.setCredentials(integration.credentials);
        // Verificar disponibilidade
        const availabilityResult = await checkCalendarAvailability(userOAuth2Client, startTime, endTime, calendarId);
        res.json({
            available: availabilityResult.available,
            startTime,
            endTime,
            calendarId,
            conflictingEvents: availabilityResult.conflictingEvents?.map(event => ({
                id: event.id,
                summary: event.summary,
                start: event.start?.dateTime || event.start?.date,
                end: event.end?.dateTime || event.end?.date,
                status: event.status
            }))
        });
    }
    catch (err) {
        console.error('❌ Erro ao verificar disponibilidade:', err);
        res.status(500).json({
            error: 'Erro ao verificar disponibilidade',
            details: err.message
        });
    }
});
// ✅ NOVA ROTA - Verificar disponibilidade usando FreeBusy API (mais eficiente)
router.post('/calendar/check-freebusy', rateLimitMiddleware, validateUserId, async (req, res) => {
    const { user_id, startTime, endTime, calendarId = 'primary' } = req.body;
    if (!startTime || !endTime) {
        res.status(400).json({
            error: 'startTime e endTime são obrigatórios'
        });
        return;
    }
    try {
        const { data: integration, error: integrationError } = await supabase
            .from('user_integrations')
            .select('credentials')
            .eq('user_id', user_id)
            .eq('integration_type', 'google_calendar')
            .eq('status', 'active')
            .single();
        if (integrationError || !integration?.credentials) {
            res.status(401).json({
                error: 'Integração Google Calendar não encontrada'
            });
            return;
        }
        const userOAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        userOAuth2Client.setCredentials(integration.credentials);
        const freeBusyResult = await checkFreeBusyAvailability(userOAuth2Client, startTime, endTime, calendarId);
        res.json({
            available: freeBusyResult.available,
            startTime,
            endTime,
            calendarId,
            busySlots: freeBusyResult.busySlots
        });
    }
    catch (err) {
        console.error('❌ Erro ao verificar FreeBusy:', err);
        res.status(500).json({
            error: 'Erro ao verificar disponibilidade via FreeBusy',
            details: err.message
        });
    }
});
// ✅ NOVA ROTA - Verificar múltiplos slots de uma vez
router.post('/calendar/check-multiple-slots', rateLimitMiddleware, validateUserId, async (req, res) => {
    const { user_id, timeSlots, calendarId = 'primary', useFreeBusy = true } = req.body;
    if (!timeSlots || !Array.isArray(timeSlots)) {
        res.status(400).json({
            error: 'timeSlots (array) é obrigatório'
        });
        return;
    }
    if (timeSlots.length > 20) {
        res.status(400).json({
            error: 'Máximo de 20 slots por requisição'
        });
        return;
    }
    try {
        const { data: integration, error: integrationError } = await supabase
            .from('user_integrations')
            .select('credentials')
            .eq('user_id', user_id)
            .eq('integration_type', 'google_calendar')
            .eq('status', 'active')
            .single();
        if (integrationError || !integration?.credentials) {
            res.status(401).json({
                error: 'Integração Google Calendar não encontrada'
            });
            return;
        }
        const userOAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
        userOAuth2Client.setCredentials(integration.credentials);
        // Verificar cada slot
        const results = await Promise.all(timeSlots.map(async (slot) => {
            try {
                if (useFreeBusy) {
                    const availability = await checkFreeBusyAvailability(userOAuth2Client, slot.startTime, slot.endTime, calendarId);
                    return {
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        available: availability.available,
                        method: 'freebusy',
                        conflicts: availability.busySlots?.length || 0
                    };
                }
                else {
                    const availability = await checkCalendarAvailability(userOAuth2Client, slot.startTime, slot.endTime, calendarId);
                    return {
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        available: availability.available,
                        method: 'events',
                        conflicts: availability.conflictingEvents?.length || 0
                    };
                }
            }
            catch (error) {
                return {
                    startTime: slot.startTime,
                    endTime: slot.endTime,
                    available: false,
                    error: 'Erro ao verificar slot'
                };
            }
        }));
        res.json({
            results,
            summary: {
                total: results.length,
                available: results.filter(r => r.available).length,
                unavailable: results.filter(r => !r.available).length
            },
            availableSlots: results.filter(r => r.available),
            unavailableSlots: results.filter(r => !r.available)
        });
    }
    catch (err) {
        console.error('❌ Erro ao verificar múltiplos slots:', err);
        res.status(500).json({
            error: 'Erro ao verificar disponibilidade',
            details: err.message
        });
    }
});
// Rota para verificar status com cache
router.get('/status/:user_id', validateUserId, async (req, res) => {
    const { user_id } = req.params;
    const cacheKey = `integration_status:${user_id}`;
    try {
        // Tentar buscar do cache primeiro
        const cachedStatus = await redis.get(cacheKey);
        if (cachedStatus) {
            res.json(JSON.parse(cachedStatus));
            return;
        }
        // Buscar do banco de dados
        const { data, error } = await supabase
            .from('user_integrations')
            .select('status, updated_at')
            .eq('user_id', user_id)
            .eq('integration_type', 'google_calendar')
            .single();
        if (error && error.code !== 'PGRST116') {
            throw error;
        }
        const statusResponse = {
            connected: data?.status === 'active',
            status: data?.status || 'not_connected',
            last_updated: data?.updated_at || null
        };
        // Cache por 5 minutos
        await redis.setex(cacheKey, 300, JSON.stringify(statusResponse));
        res.json(statusResponse);
    }
    catch (err) {
        console.error('Erro ao verificar status:', err);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});
// Rota para revogar integração
router.post('/disconnect', validateUserId, async (req, res) => {
    const { user_id } = req.body;
    try {
        // Buscar credenciais atuais
        const { data: integration } = await supabase
            .from('user_integrations')
            .select('credentials')
            .eq('user_id', user_id)
            .eq('integration_type', 'google_calendar')
            .eq('status', 'active')
            .single();
        // Revogar token no Google se existir
        if (integration?.credentials?.access_token) {
            try {
                const userOAuth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
                userOAuth2Client.setCredentials(integration.credentials);
                await userOAuth2Client.revokeCredentials();
                console.log(`✅ Token revogado no Google para usuário ${user_id}`);
            }
            catch (revokeError) {
                console.warn('Aviso: Erro ao revogar token no Google:', revokeError);
                // Continuar mesmo se a revogação falhar
            }
        }
        // Atualizar status no banco
        const { error } = await supabase
            .from('user_integrations')
            .update({
            status: 'inactive',
            credentials: {}, // Limpar credenciais
            updated_at: new Date().toISOString()
        })
            .eq('user_id', user_id)
            .eq('integration_type', 'google_calendar');
        if (error) {
            throw error;
        }
        // Invalidar cache
        await redis.del(`integration_status:${user_id}`);
        console.log(`✅ Integração revogada com sucesso para usuário ${user_id}`);
        res.json({
            success: true,
            message: 'Integração revogada com sucesso'
        });
    }
    catch (err) {
        console.error('Erro ao desconectar:', {
            message: err?.message,
            stack: err?.stack,
            name: err?.name,
            full: err
        });
        res.status(500).json({
            error: 'Erro interno do servidor',
            message: 'Tente novamente em alguns instantes'
        });
    }
});
// Rota de health check
router.get('/health', async (req, res) => {
    try {
        // Verificar Redis
        await redis.ping();
        // Verificar Supabase
        const { error } = await supabase
            .from('user_integrations')
            .select('count')
            .limit(1);
        if (error)
            throw error;
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                redis: 'ok',
                supabase: 'ok'
            }
        });
    }
    catch (err) {
        console.error('Health check failed:', err);
        res.status(503).json({
            status: 'unhealthy',
            timestamp: new Date().toISOString(),
            error: 'Service dependencies unavailable'
        });
    }
});
// Funções auxiliares para gerar páginas HTML
function generateSuccessPage() {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Integração Concluída</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center; 
          padding: 50px 20px; 
          background: #f8f9fa;
          margin: 0;
        }
        .container {
          max-width: 400px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .success { 
          color: #28a745; 
          font-size: 18px; 
          line-height: 1.5;
        }
        .icon { font-size: 48px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">✅</div>
        <div class="success">
          <strong>Integração realizada com sucesso!</strong>
          <br><br>
          Sua conta Google Calendar foi conectada.
          <br><br>
          Pode fechar esta aba.
        </div>
      </div>
    </body>
    </html>
  `;
}
function generateErrorPage(message) {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Erro na Integração</title>
      <style>
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          text-align: center; 
          padding: 50px 20px; 
          background: #f8f9fa;
          margin: 0;
        }
        .container {
          max-width: 400px;
          margin: 0 auto;
          background: white;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .error { 
          color: #dc3545; 
          font-size: 18px; 
          line-height: 1.5;
        }
        .icon { font-size: 48px; margin-bottom: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="icon">❌</div>
        <div class="error">
          <strong>Erro na integração</strong>
          <br><br>
          ${message}
          <br><br>
          Tente novamente.
        </div>
      </div>
    </body>
    </html>
  `;
}
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('Recebido SIGTERM, fechando conexões...');
    await redis.quit();
    process.exit(0);
});
exports.default = router;
