"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase");
// ✅ Nova importação
const mercadopago_1 = require("mercadopago");
const router = express_1.default.Router();
// ✅ Nova configuração
const client = new mercadopago_1.MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: {
        timeout: 5000,
    }
});
// ✅ Nova instância da API
const preapproval = new mercadopago_1.PreApproval(client);
router.post('/criar', async (req, res) => {
    const { user_id, email } = req.body;
    if (!user_id || !email) {
        res.status(400).json({ error: 'user_id e email são obrigatórios' });
        return;
    }
    try {
        // ✅ Nova sintaxe para criar preapproval
        const preference = await preapproval.create({
            body: {
                reason: 'Assinatura Plano Empresa',
                auto_recurring: {
                    frequency: 1,
                    frequency_type: 'months',
                    transaction_amount: 79.9,
                    currency_id: 'BRL',
                    start_date: new Date().toISOString(),
                    end_date: '2026-12-31T00:00:00.000-03:00',
                },
                payer_email: email,
                back_url: 'https://merlindesk.com/login',
            }
        });
        const assinatura_id = preference.id;
        const checkout_url = preference.init_point;
        const { error } = await supabase_1.supabase.from('user_subscriptions').upsert([
            {
                user_id,
                plan_id: '13a351d7-08e5-4f10-8658-19e4e40b7254',
                assinatura_id,
                status: 'pending',
                current_period_start: new Date().toISOString(),
            }
        ], {
            onConflict: 'user_id'
        });
        if (error) {
            console.error('Erro ao salvar no Supabase:', error);
            res.status(500).json({ error: 'Erro ao salvar assinatura' });
            return;
        }
        res.json({ checkout_url });
    }
    catch (err) {
        console.error('Erro ao criar assinatura Mercado Pago:', err);
        res.status(500).json({ error: 'Erro ao criar assinatura' });
    }
});
exports.default = router;
