"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAppointmentCancellation = exports.sendAppointmentReminder = exports.sendAppointmentConfirmation = exports.sendTextMessage = void 0;
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
// Configurações do WhatsApp Cloud API
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const META_VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;
const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
// Função genérica para enviar mensagens de texto
const sendTextMessage = async (phoneNumber, message) => {
    try {
        const payload = {
            messaging_product: 'whatsapp',
            to: phoneNumber,
            type: 'text',
            text: { body: message },
        };
        const response = await axios_1.default.post(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, payload, {
            headers: {
                Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('✅ Mensagem enviada:', response.data);
        return { success: true, data: response.data };
    }
    catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};
exports.sendTextMessage = sendTextMessage;
// Funções para envio de notificações
const sendAppointmentConfirmation = async (notification) => {
    const { clientName, clientPhone, professionalName, specialtyName, appointmentDate, appointmentTime, duration, notes } = notification;
    const formattedDate = new Date(appointmentDate).toLocaleDateString('pt-BR');
    const message = `🎉 *Confirmação de Agendamento*

Olá ${clientName}!

Seu agendamento foi confirmado:

📅 *Data:* ${formattedDate}
⏰ *Horário:* ${appointmentTime}
👨‍⚕️ *Profissional:* ${professionalName}
🏥 *Especialidade:* ${specialtyName}
⏱️ *Duração:* ${duration} minutos

${notes ? `📝 *Observações:* ${notes}` : ''}

Para reagendar ou cancelar, entre em contato.

Obrigado! 🙏`;
    return await (0, exports.sendTextMessage)(clientPhone, message);
};
exports.sendAppointmentConfirmation = sendAppointmentConfirmation;
const sendAppointmentReminder = async (notification) => {
    const { clientName, clientPhone, professionalName, specialtyName, appointmentDate, appointmentTime } = notification;
    const formattedDate = new Date(appointmentDate).toLocaleDateString('pt-BR');
    const message = `⏰ *Lembrete de Agendamento*

Olá ${clientName}!

Lembramos que você tem um agendamento amanhã:

📅 *Data:* ${formattedDate}
⏰ *Horário:* ${appointmentTime}
👨‍⚕️ *Profissional:* ${professionalName}
🏥 *Especialidade:* ${specialtyName}

Por favor, confirme sua presença.

Obrigado! 🙏`;
    return await (0, exports.sendTextMessage)(clientPhone, message);
};
exports.sendAppointmentReminder = sendAppointmentReminder;
const sendAppointmentCancellation = async (notification) => {
    const { clientName, clientPhone, professionalName, specialtyName, appointmentDate, appointmentTime } = notification;
    const formattedDate = new Date(appointmentDate).toLocaleDateString('pt-BR');
    const message = `❌ *Agendamento Cancelado*

Olá ${clientName}!

Seu agendamento foi cancelado:

📅 *Data:* ${formattedDate}
⏰ *Horário:* ${appointmentTime}
👨‍⚕️ *Profissional:* ${professionalName}
🏥 *Especialidade:* ${specialtyName}

Para reagendar, entre em contato.

Obrigado! 🙏`;
    return await (0, exports.sendTextMessage)(clientPhone, message);
};
exports.sendAppointmentCancellation = sendAppointmentCancellation;
// Função para processar mensagens recebidas
const handleIncomingMessage = async (message) => {
    const from = message.from;
    const messageType = message.type;
    const messageText = message.text?.body || '';
    console.log(`📥 Mensagem de ${from}: ${messageText}`);
    if (messageType === 'text') {
        const lowerText = messageText.toLowerCase();
        if (lowerText.includes('confirmar') || lowerText.includes('sim')) {
            await (0, exports.sendTextMessage)(from, '✅ Confirmação recebida! Aguardamos você no horário agendado.');
        }
        else if (lowerText.includes('cancelar') || lowerText.includes('não')) {
            await (0, exports.sendTextMessage)(from, '❌ Cancelamento registrado. Para reagendar, entre em contato.');
        }
        else if (lowerText.includes('reagendar')) {
            await (0, exports.sendTextMessage)(from, '🔄 Para reagendar, entre em contato conosco.');
        }
        else {
            await (0, exports.sendTextMessage)(from, 'Obrigado pela mensagem! Em breve responderemos.');
        }
    }
};
// 📌 ROTAS
// ✅ Webhook verification
router.get('/webhook', async (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === META_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    }
    else {
        res.status(403).send('Forbidden');
    }
});
// ✅ Webhook para receber mensagens
router.post('/webhook', async (req, res) => {
    const body = req.body;
    if (body.object === 'whatsapp_business_account') {
        body.entry?.forEach((entry) => {
            entry.changes?.forEach((change) => {
                if (change.value?.messages) {
                    change.value.messages.forEach((message) => {
                        handleIncomingMessage(message);
                    });
                }
            });
        });
    }
    res.status(200).send('OK');
});
// ✅ Enviar mensagem de texto simples
router.post('/send-message', async (req, res) => {
    const { phoneNumber, message } = req.body;
    if (!phoneNumber || !message) {
        res.status(400).json({ success: false, error: 'phoneNumber e message são obrigatórios' });
        return;
    }
    try {
        const result = await (0, exports.sendTextMessage)(phoneNumber, message);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Erro na rota send-message:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// ✅ Enviar confirmação de agendamento
router.post('/send-appointment-confirmation', async (req, res) => {
    const notification = req.body;
    const requiredFields = ['clientName', 'clientPhone', 'professionalName', 'specialtyName', 'appointmentDate', 'appointmentTime', 'duration'];
    for (const field of requiredFields) {
        if (!notification[field]) {
            res.status(400).json({ success: false, error: `Campo obrigatório ausente: ${field}` });
            return;
        }
    }
    try {
        const result = await (0, exports.sendAppointmentConfirmation)(notification);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Erro na rota send-appointment-confirmation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// ✅ Enviar lembrete de agendamento
router.post('/send-appointment-reminder', async (req, res) => {
    const notification = req.body;
    const requiredFields = ['clientName', 'clientPhone', 'professionalName', 'specialtyName', 'appointmentDate', 'appointmentTime', 'duration'];
    for (const field of requiredFields) {
        if (!notification[field]) {
            res.status(400).json({ success: false, error: `Campo obrigatório ausente: ${field}` });
            return;
        }
    }
    try {
        const result = await (0, exports.sendAppointmentReminder)(notification);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Erro na rota send-appointment-reminder:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// ✅ Enviar cancelamento de agendamento
router.post('/send-appointment-cancellation', async (req, res) => {
    const notification = req.body;
    const requiredFields = ['clientName', 'clientPhone', 'professionalName', 'specialtyName', 'appointmentDate', 'appointmentTime', 'duration'];
    for (const field of requiredFields) {
        if (!notification[field]) {
            res.status(400).json({ success: false, error: `Campo obrigatório ausente: ${field}` });
            return;
        }
    }
    try {
        const result = await (0, exports.sendAppointmentCancellation)(notification);
        res.json(result);
    }
    catch (error) {
        console.error('❌ Erro na rota send-appointment-cancellation:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});
// ✅ Status da integração
router.get('/status', async (req, res) => {
    res.json({
        success: true,
        status: {
            whatsapp_token: !!WHATSAPP_TOKEN,
            whatsapp_phone_number_id: !!WHATSAPP_PHONE_NUMBER_ID,
            meta_verify_token: !!META_VERIFY_TOKEN,
            api_url: WHATSAPP_API_URL,
        },
        message: 'WhatsApp Cloud API integration status',
    });
});
exports.default = router;
