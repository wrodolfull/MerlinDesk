// google.ts (Versão para Produção - Corrigida)
import express from 'express';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import crypto from 'crypto';
import Redis from 'ioredis';
import type { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { CodeChallengeMethod } from 'google-auth-library/build/src/auth/oauth2client';

dotenv.config();
const router = express.Router();

// Configuração do Redis para produção
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  lazyConnect: true,
  keepAlive: 30000,
  retryStrategy: (times) => Math.min(times * 100, 2000),
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// Constantes de configuração
const PKCE_EXPIRY_SECONDS = 600; // 10 minutos
const RATE_LIMIT_WINDOW = 3600; // 1 hora
const MAX_REQUESTS_PER_HOUR = 50;

// Função para gerar code_verifier seguro
function generateCodeVerifier(): string {
  return crypto.randomBytes(32).toString('base64url');
}

// Função para gerar code_challenge
function generateCodeChallenge(verifier: string): string {
  return crypto.createHash('sha256').update(verifier).digest('base64url');
}

// Middleware de rate limiting
async function rateLimitMiddleware(req: Request, res: Response, next: NextFunction) {
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
  } catch (error) {
    console.error('Rate limit error:', error);
    next(); // Continuar em caso de erro do Redis
  }
}

// Middleware de validação de entrada
function validateUserId(req: Request, res: Response, next: NextFunction) {
  const userId = req.query.user_id as string || req.params.user_id || req.body.user_id;
  
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
  const userId = req.query.user_id as string;

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
      code_challenge_method: 'S256' as CodeChallengeMethod,
    });

    console.log(`✅ PKCE iniciado para usuário ${userId}`);
    res.redirect(url);

  } catch (error) {
    console.error('Erro ao iniciar autenticação:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: 'Tente novamente em alguns instantes'
    });
  }
});

// Rota de callback Google
router.get('/callback', async (req: Request, res: Response): Promise<void> => {
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

  const userId = state as string;

  try {
    // Recuperar e validar code_verifier
    const codeVerifier = await redis.get(`pkce:${userId}`);
    
    if (!codeVerifier) {
      console.error(`Code verifier não encontrado para usuário ${userId}`);
      res.status(400).send(generateErrorPage(
        'Sessão expirada ou inválida. Tente fazer login novamente.'
      ));
      return;
    }

    // Trocar código por tokens usando PKCE
    const { tokens } = await oauth2Client.getToken({
      code: code as string,
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
      } catch (dbError) {
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

  } catch (err) {
    console.error('Erro no callback do Google:', err);
    
    // Limpar code_verifier em caso de erro
    try {
      await redis.del(`pkce:${userId}`);
    } catch (redisError) {
      console.error('Erro ao limpar Redis:', redisError);
    }
    
    res.status(500).send(generateErrorPage(
      'Erro ao processar integração. Tente novamente.'
    ));
  }
});

// Rota para verificar status com cache
router.get('/status/:user_id', validateUserId, async (req: Request, res: Response): Promise<void> => {
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

  } catch (err) {
    console.error('Erro ao verificar status:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para revogar integração
router.post('/disconnect', validateUserId, async (req: Request, res: Response): Promise<void> => {
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
        oauth2Client.setCredentials(integration.credentials);
        await oauth2Client.revokeCredentials();
        console.log(`✅ Token revogado no Google para usuário ${user_id}`);
      } catch (revokeError) {
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

  } catch (err: any) {
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
router.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    // Verificar Redis
    await redis.ping();
    
    // Verificar Supabase
    const { error } = await supabase
      .from('user_integrations')
      .select('count')
      .limit(1);
    
    if (error) throw error;

    res.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        redis: 'ok',
        supabase: 'ok'
      }
    });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(503).json({ 
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service dependencies unavailable'
    });
  }
});

// Funções auxiliares para gerar páginas HTML
function generateSuccessPage(): string {
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

function generateErrorPage(message: string): string {
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

export default router;
