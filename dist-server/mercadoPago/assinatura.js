"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const supabase_js_1 = require("@supabase/supabase-js");
const router = express_1.default.Router();
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SERVICE_ROLE_KEY);
const MERCADO_PAGO_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const mercadoPagoAPI = axios_1.default.create({
    baseURL: 'https://api.mercadopago.com',
    headers: {
        Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
    },
});
router.post('/criar', async (req, res) => {
    const { user_id, email } = req.body;
    if (!user_id || !email) {
        res.status(400).json({ error: 'user_id e email são obrigatórios' });
        return;
    }
    try {
        console.log('🔄 Buscando planos no Supabase...');
        // ✅ Buscar tanto o plano Empresa quanto o plano Grátis
        const { data: plansData, error: plansError } = await supabase
            .from('subscription_plans')
            .select('id, name, price, mercado_pago_plan_id')
            .in('name', ['Empresa', 'Grátis']);
        if (plansError || !plansData || plansData.length < 2) {
            console.error('❌ Erro ao buscar planos:', plansError);
            res.status(500).json({ error: 'Planos não encontrados' });
            return;
        }
        const empresaPlan = plansData.find(p => p.name === 'Empresa');
        const gratisPlan = plansData.find(p => p.name === 'Grátis');
        if (!empresaPlan || !gratisPlan) {
            res.status(500).json({ error: 'Planos Empresa ou Grátis não encontrados' });
            return;
        }
        let mercadoPagoPlanId = empresaPlan.mercado_pago_plan_id;
        // ✅ Verificar se o plano ainda existe no Mercado Pago
        if (mercadoPagoPlanId) {
            try {
                console.log('🔍 Verificando se o plano ainda existe no Mercado Pago...');
                await mercadoPagoAPI.get(`/preapproval_plan/${mercadoPagoPlanId}`);
                console.log('✅ Plano ainda existe, reutilizando:', mercadoPagoPlanId);
            }
            catch (error) {
                if (error.response?.status === 404 || error.response?.status === 400) {
                    console.log('❌ Plano não existe mais ou foi cancelado, criando novo...');
                    mercadoPagoPlanId = null;
                    await supabase
                        .from('subscription_plans')
                        .update({ mercado_pago_plan_id: null })
                        .eq('id', empresaPlan.id);
                    console.log('✅ ID do plano inválido removido do Supabase');
                }
                else {
                    throw error;
                }
            }
        }
        // ✅ Criar plano no Mercado Pago se necessário
        if (!mercadoPagoPlanId) {
            console.log('🔄 Criando novo plano no Mercado Pago...');
            const plano = await mercadoPagoAPI.post('/preapproval_plan', {
                reason: 'Assinatura Plano Empresa',
                auto_recurring: {
                    frequency: 1,
                    frequency_type: 'months',
                    transaction_amount: Number(empresaPlan.price) || 79.9,
                    currency_id: 'BRL',
                },
                back_url: 'https://merlindesk.com/dashboard',
            });
            mercadoPagoPlanId = plano.data.id;
            console.log('✅ Novo plano criado:', mercadoPagoPlanId);
            const { error: updateError } = await supabase
                .from('subscription_plans')
                .update({ mercado_pago_plan_id: mercadoPagoPlanId })
                .eq('id', empresaPlan.id);
            if (updateError) {
                console.error('❌ Erro ao salvar ID do plano no Supabase:', updateError);
            }
            else {
                console.log('✅ ID do plano salvo no Supabase');
            }
        }
        // ✅ Criar checkout de pagamento
        console.log('🔄 Criando checkout de pagamento...');
        const preference = await mercadoPagoAPI.post('/checkout/preferences', {
            items: [{
                    title: 'Assinatura Plano Empresa',
                    quantity: 1,
                    unit_price: Number(empresaPlan.price) || 79.9,
                    currency_id: 'BRL',
                }],
            payer: {
                email: email,
            },
            back_urls: {
                success: 'https://merlindesk.com/login?status=success',
                failure: 'https://merlindesk.com/login?status=failure',
                pending: 'https://merlindesk.com/login?status=pending',
            },
            auto_return: 'approved',
            external_reference: user_id,
        });
        const checkout_url = preference.data.init_point;
        const preference_id = preference.data.id;
        console.log('✅ Checkout criado:', preference_id);
        // ✅ Dados para salvar no Supabase - CLIENTE INICIA NO PLANO GRATUITO
        const subscriptionData = {
            user_id,
            plan_id: empresaPlan.id, // Plano que será ativado quando pagar
            current_plan_id: gratisPlan.id, // ✅ INICIA NO PLANO GRATUITO
            assinatura_id: preference_id,
            mercado_pago_plan_id: mercadoPagoPlanId,
            preference_id: preference_id,
            status: 'pending',
            current_period_start: new Date().toISOString(),
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        };
        console.log('🔄 Salvando assinatura no Supabase...');
        const { data: subscriptionResult, error: subscriptionError } = await supabase
            .from('user_subscriptions')
            .upsert(subscriptionData, {
            onConflict: 'user_id',
            ignoreDuplicates: false
        })
            .select();
        if (subscriptionError) {
            console.error('❌ Erro ao salvar assinatura no Supabase:', subscriptionError);
            res.status(500).json({
                error: 'Erro ao salvar assinatura no banco de dados',
                details: subscriptionError.message
            });
            return;
        }
        console.log('✅ Dados salvos no Supabase - Cliente iniciado no plano gratuito');
        res.json({
            checkout_url,
            plan_id: mercadoPagoPlanId,
            preference_id: preference_id,
            database_id: subscriptionResult?.[0]?.id,
            current_plan: 'Grátis' // Cliente inicia no gratuito
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar assinatura:', error);
        if (error.response?.data) {
            console.error('❌ Detalhes do erro MP:', error.response.data);
            res.status(500).json({
                error: 'Erro na integração com Mercado Pago',
                details: error.response.data
            });
        }
        else {
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
});
// Endpoint para cancelar assinatura
router.post('/cancelar', async (req, res) => {
    const { subscription_id, mercado_pago_plan_id } = req.body;
    if (!subscription_id || !mercado_pago_plan_id) {
        res.status(400).json({ error: 'IDs da assinatura são obrigatórios' });
        return;
    }
    try {
        const mercadoPagoAPI = axios_1.default.create({
            baseURL: 'https://api.mercadopago.com',
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });
        // Cancelar no Mercado Pago
        await mercadoPagoAPI.put(`/v1/subscriptions/${mercado_pago_plan_id}`, {
            status: 'cancelled'
        });
        res.json({ success: true, message: 'Assinatura cancelada com sucesso' });
    }
    catch (error) {
        console.error('❌ Erro ao cancelar assinatura no Mercado Pago:', error);
        if (error.response?.data) {
            console.error('❌ Detalhes do erro MP:', error.response.data);
            res.status(500).json({
                error: 'Erro na integração com Mercado Pago',
                details: error.response.data
            });
        }
        else {
            res.status(500).json({
                error: 'Erro interno do servidor',
                details: error.message
            });
        }
    }
});
exports.default = router;
