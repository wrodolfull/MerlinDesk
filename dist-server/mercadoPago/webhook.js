"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crypto_1 = __importDefault(require("crypto"));
const axios_1 = __importDefault(require("axios"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
const validateWebhookSignature = (dataId, requestId, signature) => {
    const secret = process.env.MP_WEBHOOK_SECRET;
    if (!secret || !signature) {
        return false;
    }
    const parts = signature.split(',');
    let ts = '';
    let hash = '';
    parts.forEach(part => {
        const [key, value] = part.split('=');
        if (key && value) {
            if (key.trim() === 'ts') {
                ts = value.trim();
            }
            else if (key.trim() === 'v1') {
                hash = value.trim();
            }
        }
    });
    if (!ts || !hash) {
        return false;
    }
    const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
    const expectedHash = crypto_1.default
        .createHmac('sha256', secret)
        .update(manifest)
        .digest('hex');
    return expectedHash === hash;
};
router.post('/', async (req, res) => {
    try {
        // ✅ Parse do body raw para JSON
        const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
        const signature = req.headers['x-signature'];
        const requestId = req.headers['x-request-id'];
        const dataId = req.query['data.id'];
        console.log('📨 Webhook recebido:', JSON.stringify(body, null, 2));
        console.log('🔍 Headers:', { signature, requestId, dataId });
        // ✅ Validação de assinatura (opcional para testes)
        if (signature && process.env.MP_WEBHOOK_SECRET) {
            if (!validateWebhookSignature(dataId, requestId, signature)) {
                console.error('❌ Assinatura do webhook inválida');
                res.status(401).send('Unauthorized');
                return;
            }
            console.log('✅ Assinatura do webhook válida');
        }
        else {
            console.log('⚠️ Validação de assinatura desabilitada (teste)');
        }
        // ✅ Tratar eventos de payment
        if (body.type === 'payment') {
            const paymentId = body.data.id;
            console.log(`🔄 Processando pagamento: ${paymentId}`);
            const mercadoPagoAPI = axios_1.default.create({
                baseURL: 'https://api.mercadopago.com',
                headers: {
                    Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            });
            try {
                const paymentResponse = await mercadoPagoAPI.get(`/v1/payments/${paymentId}`);
                const payment = paymentResponse.data;
                console.log(`💳 Status do pagamento: ${payment.status}`);
                // ✅ Buscar assinatura pelo preference_id
                const { data: existingSubscription, error: selectError } = await supabase_1.supabase
                    .from('user_subscriptions')
                    .select('id, status, user_id')
                    .eq('preference_id', payment.preference_id)
                    .single();
                if (selectError || !existingSubscription) {
                    console.error('❌ Assinatura não encontrada para preference_id:', payment.preference_id);
                    res.status(200).send('OK - Assinatura não encontrada'); // ✅ Retorna 200 para evitar retry
                    return;
                }
                // ✅ Atualizar status baseado no pagamento
                let newStatus = 'pending';
                if (payment.status === 'approved') {
                    newStatus = 'active';
                }
                else if (payment.status === 'cancelled' || payment.status === 'rejected') {
                    newStatus = 'canceled';
                }
                if (existingSubscription.status !== newStatus) {
                    const updateData = {
                        status: newStatus,
                    };
                    // ✅ Se aprovado, atualizar período
                    if (newStatus === 'active') {
                        updateData.current_period_start = new Date().toISOString();
                        updateData.current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
                    }
                    const { error } = await supabase_1.supabase
                        .from('user_subscriptions')
                        .update(updateData)
                        .eq('id', existingSubscription.id);
                    if (error) {
                        console.error('❌ Erro ao atualizar assinatura:', error);
                        res.status(500).send('Erro ao atualizar assinatura');
                        return;
                    }
                    console.log(`✅ Assinatura atualizada para ${newStatus}: ${payment.preference_id}`);
                }
                else {
                    console.log(`ℹ️ Assinatura já estava com status ${newStatus}`);
                }
            }
            catch (apiError) {
                console.error('❌ Erro ao consultar pagamento no MP:', apiError);
                res.status(500).send('Erro ao consultar pagamento');
                return;
            }
        }
        // ✅ Sempre retornar 200 para webhooks válidos
        res.status(200).send('OK');
    }
    catch (err) {
        console.error('❌ Erro no webhook:', err);
        res.status(500).send('Erro interno');
    }
});
exports.default = router;
