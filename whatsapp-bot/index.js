// Adicione esta linha no início do arquivo
globalThis.crypto = globalThis.crypto || require('node:crypto').webcrypto;

require('dotenv').config();
const express = require('express');
const { Boom } = require('@hapi/boom');
const { 
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  delay
} = require('@whiskeysockets/baileys');
const fetch = require('node-fetch');
const fs = require('fs');
const cron = require('node-cron');

const app = express();
app.use(express.json());

// Configurações
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const AUTH_FOLDER = './auth_info_baileys';
const PORT = process.env.PORT || 3008;

// Estado global
const messageQueue = [];
let isProcessingQueue = false;
let sock = null;
let connectionAttempts = 0;
const maxConnectionAttempts = 5;
let isConnected = false;
let lastSuccessfulMessage = Date.now();
let consecutiveTimeouts = 0;

// Estatísticas para o assistente
let messagesSentToday = 0;
let lastResetDate = new Date().toDateString();

// Estado de conversas ativas para reagendamento
const activeConversations = new Map();

// Garantir que a pasta de autenticação exista
if (!fs.existsSync(AUTH_FOLDER)) {
  fs.mkdirSync(AUTH_FOLDER, { recursive: true });
}

// Verificar variáveis obrigatórias
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Variáveis de ambiente obrigatórias não encontradas:');
  missingVars.forEach(varName => console.error(`   - ${varName}`));
  process.exit(1);
}

console.log('✅ Todas as variáveis de ambiente foram carregadas');

// Função para normalizar número de telefone
function normalizePhoneNumber(phone) {
  let cleaned = phone.replace(/\D/g, '');
  
  if (phone.startsWith('+55')) {
    cleaned = phone.substring(3).replace(/\D/g, '');
    cleaned = '55' + cleaned;
  } else if (phone.startsWith('+')) {
    cleaned = phone.substring(1).replace(/\D/g, '');
  }
  
  if (!cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  if (cleaned.length !== 13) {
    console.warn(`⚠️ Número pode estar incorreto: ${phone} -> ${cleaned} (${cleaned.length} dígitos)`);
  }
  
  return cleaned + '@s.whatsapp.net';
}

// Funções utilitárias para notificações
function isWithinBusinessHours(date) {
  const hour = date.getHours();
  console.log(`Hora atual: ${hour}h - Verificando horário comercial (7h-20h)`);
  return hour >= 7 && hour <= 20;
}

function formatDate(date) {
  return date.toLocaleDateString('pt-BR');
}

function formatTime(date) {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDateTime(date) {
  return date.toLocaleString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Reset diário do contador
function resetDailyStats() {
  const today = new Date().toDateString();
  if (lastResetDate !== today) {
    messagesSentToday = 0;
    lastResetDate = today;
  }
}

// Função para detectar se precisa reiniciar conexão
function shouldRestartConnection() {
  return consecutiveTimeouts >= 3 || (Date.now() - lastSuccessfulMessage > 5 * 60 * 1000);
}

// Função para reiniciar conexão
async function restartConnection() {
  console.log('🔄 Reiniciando conexão devido a problemas persistentes...');
  isConnected = false;
  consecutiveTimeouts = 0;
  
  if (sock) {
    try {
      sock.end();
    } catch (err) {
      console.log('Erro ao fechar socket:', err.message);
    }
  }
  
  await delay(5000);
  startBot();
}

// NOVA FUNÇÃO: Buscar agendamentos com filtros específicos
async function getAppointmentsByFilters(filters = {}) {
  try {
    let url = `${SUPABASE_URL}/rest/v1/appointments?select=id,start_time,end_time,status,notes,clients(name,phone,email),professionals(name,phone),specialties(name,duration,price)`;
    
    // Aplicar filtros
    if (filters.status) {
      url += `&status=eq.${filters.status}`;
    }
    
    if (filters.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      url += `&start_time=gte.${startOfDay.toISOString()}&start_time=lte.${endOfDay.toISOString()}`;
    }
    
    if (filters.userId) {
      url += `&user_id=eq.${filters.userId}`;
    }
    
    if (filters.tomorrow) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const endTomorrow = new Date(tomorrow);
      endTomorrow.setHours(23, 59, 59, 999);
      url += `&start_time=gte.${tomorrow.toISOString()}&start_time=lte.${endTomorrow.toISOString()}`;
    }
    
    url += '&order=start_time.asc';
    
    const response = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Erro ao buscar agendamentos: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }
}

// NOVA FUNÇÃO: Buscar horários disponíveis para reagendamento
async function getAvailableSlots(professionalId, specialtyId, excludeAppointmentId = null) {
  try {
    // Buscar duração da especialidade
    const specialtyResponse = await fetch(`${SUPABASE_URL}/rest/v1/specialties?select=duration&id=eq.${specialtyId}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const specialtyData = await specialtyResponse.json();
    const duration = specialtyData[0]?.duration || 60; // padrão 60 minutos
    
    // Buscar agendamentos existentes dos próximos 7 dias
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    let appointmentsUrl = `${SUPABASE_URL}/rest/v1/appointments?select=start_time,end_time&professional_id=eq.${professionalId}&start_time=gte.${today.toISOString()}&start_time=lte.${nextWeek.toISOString()}&status=neq.canceled`;
    
    if (excludeAppointmentId) {
      appointmentsUrl += `&id=neq.${excludeAppointmentId}`;
    }
    
    const appointmentsResponse = await fetch(appointmentsUrl, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    const existingAppointments = await appointmentsResponse.json();
    
    // Gerar slots disponíveis
    const availableSlots = [];
    const workingHours = { start: 8, end: 18 }; // 8h às 18h
    
    for (let day = 1; day <= 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      date.setHours(workingHours.start, 0, 0, 0);
      
      // Pular fins de semana
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      while (date.getHours() < workingHours.end) {
        const slotEnd = new Date(date.getTime() + duration * 60000);
        
        // Verificar se o slot não conflita com agendamentos existentes
        const hasConflict = existingAppointments.some(apt => {
          const aptStart = new Date(apt.start_time);
          const aptEnd = new Date(apt.end_time);
          
          return (date < aptEnd && slotEnd > aptStart);
        });
        
        if (!hasConflict) {
          availableSlots.push({
            start: new Date(date),
            end: new Date(slotEnd),
            formatted: formatDateTime(date)
          });
        }
        
        // Próximo slot (intervalos de 30 minutos)
        date.setMinutes(date.getMinutes() + 30);
      }
    }
    
    return availableSlots.slice(0, 10); // Retornar apenas os primeiros 10 slots
  } catch (error) {
    console.error('Erro ao buscar horários disponíveis:', error);
    return [];
  }
}

// NOVA FUNÇÃO: Gerar templates de mensagem melhorados
function generateMessageTemplate(type, appointment) {
  const startTime = new Date(appointment.start_time);
  const date = formatDate(startTime);
  const time = formatTime(startTime);
  const clientName = appointment.clients?.name || 'Cliente';
  const professionalName = appointment.professionals?.name || 'Profissional';
  const specialtyName = appointment.specialties?.name || 'Consulta';
  const duration = appointment.specialties?.duration || 60;
  const price = appointment.specialties?.price || 0;
  
  const templates = {
    confirmation: `🔔 *Confirmação de Agendamento*

Olá ${clientName}! 👋

📋 *Detalhes do Agendamento:*
📅 Data: ${date}
⏰ Horário: ${time}
👨‍⚕️ Profissional: Dr(a). ${professionalName}
🏥 Especialidade: ${specialtyName}
⏱️ Duração: ${duration} minutos
💰 Valor: R$ ${price.toFixed(2)}

📋 *Para responder, digite apenas:*
1️⃣ - Confirmar
2️⃣ - Reagendar  
3️⃣ - Cancelar

💡 *Basta digitar o número da opção!*`,

    reminder_1h: `🔔 *Lembrete: Sua consulta é em 1 hora!*

📅 ${date} às ${time}
👨‍⚕️ Dr(a). ${professionalName}
🏥 ${specialtyName}
⏱️ Duração: ${duration} minutos

📍 Não se esqueça! Nos vemos em breve! 😊`,

    reminder_24h: `📅 *Lembrete: Consulta amanhã*

Olá ${clientName}!

📋 *Detalhes do Agendamento:*
📅 Data: ${date}
⏰ Horário: ${time}
👨‍⚕️ Dr(a). ${professionalName}
🏥 ${specialtyName}
⏱️ Duração: ${duration} minutos

📋 *Para confirmar, digite apenas:*
1️⃣ - Confirmar
2️⃣ - Reagendar
3️⃣ - Cancelar`,

    professional_notification: `👨‍⚕️ *Notificação Profissional*

Olá Dr(a). ${professionalName}!

📅 ${date} às ${time}
👤 Cliente: ${clientName}
🏥 Especialidade: ${specialtyName}
⏱️ Duração: ${duration} minutos
📞 Telefone: ${appointment.clients?.phone || 'N/D'}

Prepare-se para o atendimento! 📋`
  };
  
  return templates[type] || templates.confirmation;
}

// NOVA FUNÇÃO: Gerar mensagem com slots disponíveis
function generateAvailableSlotsMessage(slots, appointmentData) {
  let message = `📅 *Horários Disponíveis para Reagendamento*

👨‍⚕️ Dr(a). ${appointmentData.professionals?.name}
🏥 ${appointmentData.specialties?.name}

📋 *Escolha um horário:*\n\n`;

  slots.forEach((slot, index) => {
    message += `${index + 1}️⃣ ${slot.formatted}\n`;
  });

  message += `\n💡 *Digite o número do horário desejado (1-${slots.length})*`;
  
  return message;
}

// Função para encontrar o último agendamento pendente de um cliente
async function findLastPendingAppointment(jid) {
  try {
    // Extrair número do telefone do JID
    const phoneNumber = jid.replace('@s.whatsapp.net', '').replace('55', '');
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments?select=id,start_time,clients(name,phone),professionals(name,phone),specialties(name,duration,price)&clients.phone=like.*${phoneNumber}*&status=eq.pending&order=created_at.desc&limit=1`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Erro ao buscar agendamento:', response.status);
      return null;
    }

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
    
  } catch (error) {
    console.error('Erro ao buscar último agendamento:', error);
    return null;
  }
}

// NOVA FUNÇÃO: Buscar agendamento completo por ID
async function getAppointmentById(appointmentId) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments?select=*,clients(name,phone,email),professionals(name,phone),specialties(name,duration,price)&id=eq.${appointmentId}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.length > 0 ? data[0] : null;
    
  } catch (error) {
    console.error('Erro ao buscar agendamento por ID:', error);
    return null;
  }
}

// Função para buscar agendamentos que precisam de notificação
async function getAppointmentsForNotification() {
  try {
    const now = new Date();
    const in1h = new Date(now.getTime() + 60 * 60 * 1000);
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    console.log(`Buscando agendamentos entre ${now.toISOString()} e ${in24h.toISOString()}`);

    const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments?select=id,start_time,status,clients(name,phone),professionals(name,phone),specialties(name,duration,price)&status=eq.confirmed&start_time=gte.${now.toISOString()}&start_time=lte.${in24h.toISOString()}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar agendamentos: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    return [];
  }
}

// Função para verificar se notificação já foi enviada
async function wasNotificationSent(appointmentId, type) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications_log?select=id&appointment_id=eq.${appointmentId}&type=eq.${type}`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    return data.length > 0;
  } catch (error) {
    console.error('Erro ao verificar notificação:', error);
    return false;
  }
}

// Função para marcar notificação como enviada
async function markNotificationAsSent(appointmentId, type) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/notifications_log`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        appointment_id: appointmentId,
        type: type,
        sent_at: new Date().toISOString()
      })
    });

    return response.ok;
  } catch (error) {
    console.error('Erro ao marcar notificação:', error);
    return false;
  }
}

// Função principal para processar notificações
async function processNotifications() {
  try {
    console.log('🔔 Iniciando verificação de notificações...');
    resetDailyStats();
    
    const now = new Date();
    
    if (!isWithinBusinessHours(now)) {
      console.log('⏰ Fora do horário comercial, pulando notificações');
      return { success: true, message: 'Fora do horário comercial', sent: 0 };
    }

    if (!isConnected) {
      console.log('❌ Bot WhatsApp não está conectado, pulando notificações');
      return { success: false, message: 'Bot não conectado', sent: 0 };
    }

    const appointments = await getAppointmentsForNotification();
    console.log(`📅 Encontrados ${appointments.length} agendamentos para verificar`);

    let sentCount = 0;
    const errors = [];

    for (const appt of appointments) {
      try {
        const start = new Date(appt.start_time);
        const diff = start.getTime() - now.getTime();
        
        let type = null;
        if (diff <= 60 * 60 * 1000 + 60000) {
          type = '1h';
        } else if (diff <= 24 * 60 * 60 * 1000 + 60000 && diff > 23 * 60 * 60 * 1000) {
          type = '24h';
        }
        
        if (!type) continue;

        const alreadySent = await wasNotificationSent(appt.id, type);
        if (alreadySent) {
          console.log(`✅ Notificação ${type} já enviada para agendamento ${appt.id}`);
          continue;
        }

        // Preparar dados completos do agendamento
        const appointmentData = {
          id: appt.id,
          start_time: appt.start_time,
          clients: appt.clients,
          professionals: appt.professionals,
          specialties: appt.specialties || { name: 'Consulta', duration: 60, price: 0 }
        };

        if (appt.clients?.phone) {
          const jid = normalizePhoneNumber(appt.clients.phone);
          const template = type === '1h' ? 'reminder_1h' : 'reminder_24h';
          const message = generateMessageTemplate(template, appointmentData);
          
          // Passar os dados completos para a fila
          addToMessageQueue(jid, message, appt.id, null, appointmentData);
          sentCount++;
          
          await delay(500);
        }

        if (appt.professionals?.phone) {
          const jid = normalizePhoneNumber(appt.professionals.phone);
          const message = generateMessageTemplate('professional_notification', appointmentData);
          
          addToMessageQueue(jid, message, appt.id, null, appointmentData);
          sentCount++;
          
          await delay(500);
        }

        if (sentCount > 0) {
          await markNotificationAsSent(appt.id, type);
          console.log(`✅ Notificação ${type} marcada como enviada para agendamento ${appt.id}`);
        }

      } catch (error) {
        console.error(`❌ Erro ao processar agendamento ${appt.id}:`, error);
        errors.push({
          appointmentId: appt.id,
          error: error.message
        });
      }
    }

    console.log(`🔔 Processamento concluído. ${sentCount} mensagens adicionadas à fila`);
    
    return {
      success: true,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString()
    };

  } catch (error) {
    console.error('❌ Erro geral no processamento de notificações:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

async function startBot() {
  try {
    console.log('Iniciando bot WhatsApp com Baileys v6.6.0...');
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_FOLDER);

    sock = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      browser: ['ZapBot', 'Chrome', '1.0.0'],
      version: [2, 2403, 2],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      defaultQueryTimeoutMs: undefined,
      connectTimeoutMs: 60000,
      keepAliveIntervalMs: 25000,
      retryRequestDelayMs: 3000,
      fireInitQueries: false,
      generateHighQualityLinkPreview: false,
      getMessage: async () => {
        return { conversation: 'hello' };
      }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect } = update;

      if (connection === 'close') {
        isConnected = false;
        const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
        
        console.log('Conexão fechada. Código:', statusCode);
        
        if (statusCode === DisconnectReason.badSession || statusCode === DisconnectReason.loggedOut) {
          console.log('Sessão inválida. Removendo arquivos de autenticação...');
          try {
            fs.rmSync(AUTH_FOLDER, { recursive: true, force: true });
            fs.mkdirSync(AUTH_FOLDER, { recursive: true });
          } catch (err) {
            console.error('Erro ao limpar pasta de autenticação:', err);
          }
          connectionAttempts = 0;
          setTimeout(() => startBot(), 5000);
        } else if (statusCode === DisconnectReason.connectionReplaced) {
          console.error('Conexão substituída. Nova sessão aberta em outro lugar.');
          process.exit(1);
        } else if (connectionAttempts < maxConnectionAttempts) {
          connectionAttempts++;
          console.log(`Tentativa de reconexão ${connectionAttempts}/${maxConnectionAttempts}`);
          setTimeout(() => startBot(), 5000);
        } else {
          console.log('Máximo de tentativas alcançado. Parando reconexões.');
        }
      } else if (connection === 'open') {
        console.log('✅ Conectado ao WhatsApp!');
        isConnected = true;
        connectionAttempts = 0;
        lastSuccessfulMessage = Date.now();
        consecutiveTimeouts = 0;
        
        await delay(8000);
        
        if (!isProcessingQueue && messageQueue.length > 0) {
          processMessageQueue();
        }
      }
    });

    // Manipulador de mensagens recebidas - MELHORADO COM REAGENDAMENTO
    sock.ev.on('messages.upsert', async ({ messages }) => {
      try {
        const msg = messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const jid = msg.key.remoteJid;
        const messageText = msg.message.conversation || 
                           msg.message.extendedTextMessage?.text || 
                           '';
        
        console.log(`📨 Mensagem recebida de ${jid}: "${messageText}"`);
        
        if (messageText) {
          // Verificar se há conversa ativa de reagendamento
          const activeConv = activeConversations.get(jid);
          
          if (activeConv) {
            await handleRescheduleConversation(jid, messageText, activeConv);
            return;
          }
          
          // Padrões para aceitar respostas simples E completas
          const simplePattern = /^[1-3]$/;
          const fullPattern = /^(\d+)\s*-?\s*([a-f0-9-]{36})$/i;
          
          let option, appointmentId;
          
          // Primeiro tenta padrão completo
          const fullMatch = messageText.match(fullPattern);
          if (fullMatch) {
            option = fullMatch[1];
            appointmentId = fullMatch[2];
            console.log(`✅ Padrão completo encontrado: opção ${option}, ID ${appointmentId}`);
          } 
          // Depois tenta padrão simples
          else {
            const simpleMatch = messageText.match(simplePattern);
            if (simpleMatch) {
              option = simpleMatch[0];
              
              // Buscar o último agendamento pendente deste cliente
              const appointmentData = await findLastPendingAppointment(jid);
              
              if (!appointmentData) {
                await sock.sendMessage(jid, { 
                  text: '❌ Não encontrei agendamentos pendentes para você. Entre em contato conosco para mais informações.' 
                });
                return;
              }
              
              appointmentId = appointmentData.id;
              console.log(`✅ Usando agendamento mais recente: ${appointmentId}`);
            }
          }
          
          if (option && appointmentId) {
            if (option === '1') {
              // Confirmar agendamento
              await handleConfirmation(jid, appointmentId);
            } else if (option === '2') {
              // Iniciar processo de reagendamento
              await handleRescheduleStart(jid, appointmentId);
            } else if (option === '3') {
              // Cancelar agendamento
              await handleCancellation(jid, appointmentId);
            }
          }
        }
      } catch (err) {
        console.error('❌ Erro ao processar mensagem recebida:', err);
      }
    });

    return sock;
  } catch (error) {
    console.error('Erro ao iniciar o bot:', error);
    connectionAttempts++;
    if (connectionAttempts < maxConnectionAttempts) {
      setTimeout(() => startBot(), 10000);
    }
    return null;
  }
}

// NOVA FUNÇÃO: Lidar com confirmação
async function handleConfirmation(jid, appointmentId) {
  try {
    const updateResult = await updateAppointmentStatus(appointmentId, 'confirmed');
    
    if (updateResult) {
      const replyText = '✅ *Agendamento confirmado com sucesso!*\n\nObrigado por confirmar. Nos vemos no horário marcado! 😊';
      await sock.sendMessage(jid, { text: replyText });
      lastSuccessfulMessage = Date.now();
      consecutiveTimeouts = 0;
      console.log(`✅ Status atualizado com sucesso: ${appointmentId} -> confirmed`);
    } else {
      throw new Error('Falha na atualização do Supabase');
    }
  } catch (error) {
    console.error('❌ Erro ao confirmar agendamento:', error);
    await sock.sendMessage(jid, { 
      text: '❌ *Erro ao processar sua confirmação*\n\nOcorreu um erro. Por favor, entre em contato conosco diretamente. 📞' 
    });
  }
}

// NOVA FUNÇÃO: Lidar com cancelamento
async function handleCancellation(jid, appointmentId) {
  try {
    const updateResult = await updateAppointmentStatus(appointmentId, 'canceled');
    
    if (updateResult) {
      const replyText = '❌ *Agendamento cancelado!*\n\nSeu agendamento foi cancelado. Caso precise remarcar, entre em contato conosco. 📞';
      await sock.sendMessage(jid, { text: replyText });
      lastSuccessfulMessage = Date.now();
      consecutiveTimeouts = 0;
      console.log(`✅ Status atualizado com sucesso: ${appointmentId} -> canceled`);
    } else {
      throw new Error('Falha na atualização do Supabase');
    }
  } catch (error) {
    console.error('❌ Erro ao cancelar agendamento:', error);
    await sock.sendMessage(jid, { 
      text: '❌ *Erro ao processar seu cancelamento*\n\nOcorreu um erro. Por favor, entre em contato conosco diretamente. 📞' 
    });
  }
}

// NOVA FUNÇÃO: Iniciar processo de reagendamento
async function handleRescheduleStart(jid, appointmentId) {
  try {
    // Buscar dados completos do agendamento
    const appointmentData = await getAppointmentById(appointmentId);
    
    if (!appointmentData) {
      await sock.sendMessage(jid, { 
        text: '❌ Não foi possível encontrar os dados do agendamento. Entre em contato conosco.' 
      });
      return;
    }
    
    // Buscar horários disponíveis
    const availableSlots = await getAvailableSlots(
      appointmentData.professional_id, 
      appointmentData.specialty_id, 
      appointmentId
    );
    
    if (availableSlots.length === 0) {
      await sock.sendMessage(jid, { 
        text: '😔 *Não há horários disponíveis no momento*\n\nEntraremos em contato em breve para encontrar um novo horário. 📞' 
      });
      return;
    }
    
    // Salvar estado da conversa
    activeConversations.set(jid, {
      type: 'reschedule',
      appointmentId: appointmentId,
      appointmentData: appointmentData,
      availableSlots: availableSlots,
      step: 'selecting_slot'
    });
    
    // Enviar opções de horários
    const slotsMessage = generateAvailableSlotsMessage(availableSlots, appointmentData);
    await sock.sendMessage(jid, { text: slotsMessage });
    
    console.log(`📅 Iniciado processo de reagendamento para ${appointmentId}`);
    
  } catch (error) {
    console.error('❌ Erro ao iniciar reagendamento:', error);
    await sock.sendMessage(jid, { 
      text: '❌ *Erro ao buscar horários disponíveis*\n\nPor favor, entre em contato conosco diretamente. 📞' 
    });
  }
}

// NOVA FUNÇÃO: Lidar com conversa de reagendamento
async function handleRescheduleConversation(jid, messageText, conversation) {
  try {
    if (conversation.step === 'selecting_slot') {
      const slotIndex = parseInt(messageText) - 1;
      
      if (isNaN(slotIndex) || slotIndex < 0 || slotIndex >= conversation.availableSlots.length) {
        await sock.sendMessage(jid, { 
          text: `❌ Opção inválida. Por favor, digite um número entre 1 e ${conversation.availableSlots.length}.` 
        });
        return;
      }
      
      const selectedSlot = conversation.availableSlots[slotIndex];
      
      // Atualizar conversa para confirmação
      conversation.selectedSlot = selectedSlot;
      conversation.step = 'confirming_slot';
      activeConversations.set(jid, conversation);
      
      // Enviar confirmação
      const confirmMessage = `📅 *Confirmar Reagendamento*

📋 *Novo horário selecionado:*
${selectedSlot.formatted}

👨‍⚕️ Dr(a). ${conversation.appointmentData.professionals?.name}
🏥 ${conversation.appointmentData.specialties?.name}

✅ Digite *SIM* para confirmar
❌ Digite *NÃO* para cancelar`;

      await sock.sendMessage(jid, { text: confirmMessage });
      
    } else if (conversation.step === 'confirming_slot') {
      const response = messageText.toLowerCase().trim();
      
      if (response === 'sim' || response === 's') {
        // Confirmar reagendamento
        await confirmReschedule(jid, conversation);
      } else if (response === 'não' || response === 'nao' || response === 'n') {
        // Cancelar reagendamento
        activeConversations.delete(jid);
        await sock.sendMessage(jid, { 
          text: '❌ Reagendamento cancelado. Seu agendamento original permanece inalterado.' 
        });
      } else {
        await sock.sendMessage(jid, { 
          text: '❌ Resposta inválida. Digite *SIM* para confirmar ou *NÃO* para cancelar.' 
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Erro na conversa de reagendamento:', error);
    activeConversations.delete(jid);
    await sock.sendMessage(jid, { 
      text: '❌ *Erro no reagendamento*\n\nPor favor, entre em contato conosco diretamente. 📞' 
    });
  }
}

// NOVA FUNÇÃO: Confirmar reagendamento
async function confirmReschedule(jid, conversation) {
  try {
    const { appointmentId, selectedSlot } = conversation;
    
    // Atualizar agendamento no banco
    const updateResult = await updateAppointmentDateTime(
      appointmentId, 
      selectedSlot.start, 
      selectedSlot.end
    );
    
    if (updateResult) {
      // Limpar conversa ativa
      activeConversations.delete(jid);
      
      const successMessage = `✅ *Reagendamento confirmado com sucesso!*

📋 *Novo agendamento:*
📅 ${selectedSlot.formatted}
👨‍⚕️ Dr(a). ${conversation.appointmentData.professionals?.name}
🏥 ${conversation.appointmentData.specialties?.name}

Nos vemos no novo horário! 😊`;

      await sock.sendMessage(jid, { text: successMessage });
      
      console.log(`✅ Reagendamento confirmado: ${appointmentId} -> ${selectedSlot.start}`);
      
    } else {
      throw new Error('Falha na atualização do banco de dados');
    }
    
  } catch (error) {
    console.error('❌ Erro ao confirmar reagendamento:', error);
    activeConversations.delete(jid);
    await sock.sendMessage(jid, { 
      text: '❌ *Erro ao confirmar reagendamento*\n\nPor favor, entre em contato conosco diretamente. 📞' 
    });
  }
}

// NOVA FUNÇÃO: Atualizar data/hora do agendamento
async function updateAppointmentDateTime(appointmentId, startTime, endTime) {
  try {
    console.log(`📡 Atualizando horário do agendamento ${appointmentId}...`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments?id=eq.${appointmentId}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        status: 'confirmed'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}: ${errorText}`);
      throw new Error(`Erro ao atualizar agendamento: ${response.status} ${errorText}`);
    }
    
    console.log(`✅ Agendamento ${appointmentId} reagendado com sucesso`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro na função updateAppointmentDateTime:`, error);
    return false;
  }
}

// Função para atualizar status no Supabase
async function updateAppointmentStatus(appointmentId, status) {
  try {
    console.log(`📡 Enviando atualização para Supabase: ${appointmentId} -> ${status}`);
    
    const response = await fetch(`${SUPABASE_URL}/rest/v1/appointments?id=eq.${appointmentId}`, {
      method: 'PATCH',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ 
        status: status
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Erro HTTP ${response.status}: ${errorText}`);
      throw new Error(`Erro ao atualizar agendamento: ${response.status} ${errorText}`);
    }
    
    console.log(`✅ Agendamento ${appointmentId} atualizado com sucesso no Supabase`);
    return true;
    
  } catch (error) {
    console.error(`❌ Erro na função updateAppointmentStatus:`, error);
    return false;
  }
}

// Função de envio com controle rigoroso de timeouts
async function sendMessageWithRetry(jid, content, maxRetries = 2) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const [result] = await sock.onWhatsApp(jid);
      if (!result?.exists) {
        console.warn(`🚫 Número ${jid} não possui WhatsApp`);
        return false;
      }
      
      await sock.sendMessage(jid, content);
      lastSuccessfulMessage = Date.now();
      consecutiveTimeouts = 0;
      messagesSentToday++;
      console.log(`✅ Mensagem enviada com sucesso para ${jid} (${messagesSentToday} hoje)`);
      return true;
    } catch (err) {
      retries++;
      consecutiveTimeouts++;
      console.log(`❌ Falha ao enviar mensagem (${retries}/${maxRetries}):`, err.message);
      
      if (err.message.includes('Timed Out') && shouldRestartConnection()) {
        console.log('🔄 Muitos timeouts, reiniciando conexão...');
        await restartConnection();
        throw new Error('Connection restarted due to timeouts');
      }
      
      if (retries >= maxRetries) {
        throw err;
      }
      
      await delay(5000 * retries);
    }
  }
}

function addToMessageQueue(jid, message, appointmentId, res, appointmentData = null) {
  messageQueue.push({ 
    jid, 
    message, 
    appointmentId, 
    res, 
    timestamp: Date.now(),
    appointmentData 
  });
  console.log(`📝 Mensagem adicionada à fila. Total: ${messageQueue.length}`);
  
  if (!isProcessingQueue) {
    processMessageQueue();
  }
}

async function processMessageQueue() {
  if (messageQueue.length === 0) {
    isProcessingQueue = false;
    return;
  }
  
  isProcessingQueue = true;
  const { jid, message, appointmentId, res, timestamp, appointmentData } = messageQueue.shift();
  
  const isMessageTooOld = Date.now() - timestamp > 30 * 60 * 1000;
  if (isMessageTooOld) {
    console.log('⏰ Mensagem descartada por ser muito antiga');
    if (res) res.status(410).send({ error: 'Mensagem expirada' });
    setTimeout(() => processMessageQueue(), 3000);
    return;
  }
  
  try {
    if (!isConnected) {
      console.log('🔌 Socket não conectado, colocando mensagem de volta na fila');
      messageQueue.unshift({ jid, message, appointmentId, res, timestamp, appointmentData });
      setTimeout(() => processMessageQueue(), 5000);
      return;
    }
    
    // Usar template melhorado se temos dados do agendamento
    let messageContent;
    if (appointmentData) {
      messageContent = {
        text: message // Já vem formatado do generateMessageTemplate
      };
    } else {
      // Fallback para mensagem simples
      messageContent = {
        text: `${message}\n\n📋 *Para responder, digite apenas:*\n1️⃣ - Confirmar\n2️⃣ - Reagendar\n3️⃣ - Cancelar`
      };
    }
    
    const success = await sendMessageWithRetry(jid, messageContent);
    
    if (res) {
      if (success) {
        res.send({ success: true });
      } else {
        res.status(404).send({ error: 'Número não possui WhatsApp' });
      }
    }
  } catch (err) {
    console.error('❌ Erro ao processar mensagem da fila:', err);
    
    if (err.message.includes('Connection restarted')) {
      console.log('🔄 Colocando mensagem de volta na fila devido a reconexão');
      messageQueue.push({ jid, message, appointmentId, res: null, timestamp, appointmentData });
    }
    
    if (res) res.status(500).send({ error: 'Erro ao enviar mensagem' });
  }
  
  setTimeout(() => processMessageQueue(), 6000);
}

// ==================== NOVOS ENDPOINTS PARA ASSISTENTE VIRTUAL ====================

// Endpoint para o assistente enviar mensagens
app.post('/assistant-send', async (req, res) => {
  const { appointments, action } = req.body;
  
  if (!appointments || !Array.isArray(appointments)) {
    return res.status(400).send({ error: 'appointments array é obrigatório' });
  }
  
  let sentCount = 0;
  const errors = [];
  
  for (const appt of appointments) {
    try {
      let message = '';
      
      const appointmentData = {
        id: appt.id,
        start_time: appt.start_time,
        clients: { name: appt.client_name },
        professionals: { name: appt.professional_name },
        specialties: { name: appt.specialty_name, duration: appt.duration || 60, price: appt.price || 0 }
      };
      
      switch (action) {
        case 'confirmation':
          message = generateMessageTemplate('confirmation', appointmentData);
          break;
        case 'reminder':
          message = generateMessageTemplate('reminder_1h', appointmentData);
          break;
        case 'reminder_24h':
          message = generateMessageTemplate('reminder_24h', appointmentData);
          break;
        default:
          message = generateMessageTemplate('confirmation', appointmentData);
      }
      
      const jid = normalizePhoneNumber(appt.client_phone);
      addToMessageQueue(jid, message, appt.id, null, appointmentData);
      sentCount++;
      
    } catch (error) {
      console.error(`Erro ao processar agendamento ${appt.id}:`, error);
      errors.push({ appointmentId: appt.id, error: error.message });
    }
  }
  
  res.json({
    success: true,
    sent: sentCount,
    errors: errors.length > 0 ? errors : undefined
  });
});

// Endpoint para o assistente consultar dados
app.post('/assistant-query', async (req, res) => {
  const { action, filters = {} } = req.body;
  
  try {
    switch (action) {
      case 'get_appointments':
        const appointments = await getAppointmentsByFilters(filters);
        res.json({ success: true, data: appointments });
        break;
        
      case 'get_status':
        resetDailyStats();
        res.json({
          success: true,
          data: {
            connected: isConnected,
            queueSize: messageQueue.length,
            uptime: process.uptime(),
            messagesSentToday: messagesSentToday,
            lastSuccessfulMessage: new Date(lastSuccessfulMessage).toISOString(),
            consecutiveTimeouts: consecutiveTimeouts,
            activeConversations: activeConversations.size
          }
        });
        break;
        
      case 'get_statistics':
        const today = new Date();
        const startOfDay = new Date(today);
        startOfDay.setHours(0, 0, 0, 0);
        
        const todayAppointments = await getAppointmentsByFilters({
          date: startOfDay.toISOString().split('T')[0]
        });
        
        const pendingAppointments = await getAppointmentsByFilters({
          status: 'pending'
        });
        
        const confirmedAppointments = await getAppointmentsByFilters({
          status: 'confirmed'
        });
        
        res.json({
          success: true,
          data: {
            todayAppointments: todayAppointments.length,
            pendingAppointments: pendingAppointments.length,
            confirmedAppointments: confirmedAppointments.length,
            messagesSentToday: messagesSentToday,
            botStatus: isConnected ? 'online' : 'offline',
            activeConversations: activeConversations.size
          }
        });
        break;
        
      default:
        res.status(400).json({ error: 'Ação não reconhecida' });
    }
  } catch (error) {
    console.error('Erro na consulta do assistente:', error);
    res.status(500).json({ error: error.message });
  }
});

// Endpoint para atualizar status via assistente
app.post('/assistant-update', async (req, res) => {
  const { appointmentId, status } = req.body;
  
  if (!appointmentId || !status) {
    return res.status(400).json({ error: 'appointmentId e status são obrigatórios' });
  }
  
  try {
    const success = await updateAppointmentStatus(appointmentId, status);
    res.json({ success });
  } catch (error) {
    console.error('Erro ao atualizar via assistente:', error);
    res.status(500).json({ error: error.message });
  }
});

// ==================== ENDPOINTS ORIGINAIS ====================

app.post('/send-message', async (req, res) => {
  const { phone, message, appointmentId } = req.body;
  if (!phone || !message || !appointmentId) {
    return res.status(400).send({ error: 'phone, message e appointmentId são obrigatórios' });
  }
  
  const jid = normalizePhoneNumber(phone);
  console.log(`📞 Número normalizado: ${phone} -> ${jid}`);
  
  addToMessageQueue(jid, message, appointmentId, res);
});

app.get('/check-notifications', async (req, res) => {
  console.log('🔔 Verificação manual de notificações solicitada');
  const result = await processNotifications();
  res.json(result);
});

app.post('/force-restart', async (req, res) => {
  console.log('🔄 Reinicialização forçada solicitada via API');
  await restartConnection();
  res.send({ success: true, message: 'Reinicialização forçada iniciada' });
});

app.get('/status', (req, res) => {
  resetDailyStats();
  res.send({
    status: isConnected ? 'connected' : 'disconnected',
    queueSize: messageQueue.length,
    uptime: process.uptime(),
    connectionAttempts,
    lastSuccessfulMessage: new Date(lastSuccessfulMessage).toISOString(),
    timeSinceLastSuccess: Date.now() - lastSuccessfulMessage,
    consecutiveTimeouts,
    messagesSentToday: messagesSentToday,
    activeConversations: activeConversations.size
  });
});

// Novo endpoint para métricas detalhadas
app.get('/metrics', (req, res) => {
  resetDailyStats();
  res.json({
    bot_status: isConnected ? 'online' : 'offline',
    queue_size: messageQueue.length,
    connection_attempts: connectionAttempts,
    uptime_seconds: process.uptime(),
    last_successful_message: new Date(lastSuccessfulMessage).toISOString(),
    consecutive_timeouts: consecutiveTimeouts,
    messages_sent_today: messagesSentToday,
    active_conversations: activeConversations.size,
    memory_usage: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Endpoint para limpar conversas ativas (útil para debugging)
app.post('/clear-conversations', (req, res) => {
  activeConversations.clear();
  res.json({ success: true, message: 'Conversas ativas limpas' });
});

async function startApp() {
  try {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`📲 Servidor Baileys rodando na porta ${PORT}`);
      console.log(`🔗 Endpoints disponíveis:`);
      console.log(`   POST /send-message - Enviar mensagem`);
      console.log(`   POST /assistant-send - Enviar via assistente`);
      console.log(`   POST /assistant-query - Consultar dados`);
      console.log(`   POST /assistant-update - Atualizar agendamento`);
      console.log(`   POST /clear-conversations - Limpar conversas ativas`);
      console.log(`   GET /status - Status do bot`);
      console.log(`   GET /metrics - Métricas detalhadas`);
    });
    
    await startBot();
    
    // Verificação automática de notificações a cada 5 minutos no horário comercial
    cron.schedule('*/5 7-20 * * *', async () => {
      console.log('🕐 Executando verificação automática de notificações...');
      await processNotifications();
    });
    
    // Verificação de conexão a cada 3 minutos
    cron.schedule('*/3 * * * *', async () => {
      if (shouldRestartConnection()) {
        console.warn('⚠️ Conexão travada detectada. Reiniciando automaticamente...');
        await restartConnection();
      }
    });
    
    // Reset diário das estatísticas à meia-noite
    cron.schedule('0 0 * * *', () => {
      console.log('🌅 Resetando estatísticas diárias...');
      messagesSentToday = 0;
      lastResetDate = new Date().toDateString();
      activeConversations.clear(); // Limpar conversas antigas
    });
    
    // Limpar conversas inativas a cada hora
    cron.schedule('0 * * * *', () => {
      console.log('🧹 Limpando conversas inativas...');
      const now = Date.now();
      const timeout = 60 * 60 * 1000; // 1 hora
      
      for (const [jid, conversation] of activeConversations.entries()) {
        if (now - conversation.timestamp > timeout) {
          activeConversations.delete(jid);
          console.log(`🗑️ Conversa inativa removida: ${jid}`);
        }
      }
    });
    
    console.log('⏰ Cron jobs configurados');
    
  } catch (err) {
    console.error('Erro fatal ao iniciar aplicação:', err);
  }
}

process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promessa rejeitada não tratada:', reason);
});

startApp();
