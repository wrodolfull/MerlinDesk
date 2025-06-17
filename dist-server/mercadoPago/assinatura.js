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
        console.log('🔄 Buscando plano no Supabase...');
        // ✅ Buscar o plano com o ID do Mercado Pago
        const { data: planData, error: planError } = await supabase
            .from('subscription_plans')
            .select('id, name, price, mercado_pago_plan_id')
            .eq('name', 'Empresa')
            .single();
        if (planError || !planData) {
            console.error('❌ Erro ao buscar plano:', planError);
            res.status(500).json({ error: 'Plano Empresa não encontrado' });
            return;
        }
        let mercadoPagoPlanId = planData.mercado_pago_plan_id;
        // ✅ Verificar se o plano ainda existe no Mercado Pago (se tiver ID salvo)
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
                    // ✅ Limpar o ID inválido do banco
                    await supabase
                        .from('subscription_plans')
                        .update({ mercado_pago_plan_id: null })
                        .eq('id', planData.id);
                    console.log('✅ ID do plano inválido removido do Supabase');
                }
                else {
                    // Se for outro tipo de erro, relançar
                    throw error;
                }
            }
        }
        // ✅ Criar plano no Mercado Pago apenas se não existir ou for inválido
        if (!mercadoPagoPlanId) {
            console.log('🔄 Criando novo plano no Mercado Pago...');
            const plano = await mercadoPagoAPI.post('/preapproval_plan', {
                reason: 'Assinatura Plano Empresa',
                auto_recurring: {
                    frequency: 1,
                    frequency_type: 'months',
                    transaction_amount: Number(planData.price) || 79.9,
                    currency_id: 'BRL',
                },
                back_url: 'https://merlindesk.com/dashboard',
            });
            mercadoPagoPlanId = plano.data.id;
            console.log('✅ Novo plano criado:', mercadoPagoPlanId);
            // ✅ Salvar o ID do plano no Supabase para reutilização
            const { error: updateError } = await supabase
                .from('subscription_plans')
                .update({ mercado_pago_plan_id: mercadoPagoPlanId })
                .eq('id', planData.id);
            if (updateError) {
                console.error('❌ Erro ao salvar ID do plano no Supabase:', updateError);
                // Continuar mesmo com erro de salvamento do ID
            }
            else {
                console.log('✅ ID do plano salvo no Supabase');
            }
        }
        // ✅ Criar checkout de pagamento (sempre novo)
        console.log('🔄 Criando checkout de pagamento...');
        const preference = await mercadoPagoAPI.post('/checkout/preferences', {
            items: [{
                    title: 'Assinatura Plano Empresa',
                    quantity: 1,
                    unit_price: Number(planData.price) || 79.9,
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
        // ✅ Dados para salvar no Supabase
        const subscriptionData = {
            user_id,
            plan_id: planData.id,
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
        console.log('✅ Dados salvos no Supabase:', subscriptionResult?.[0]?.id);
        res.json({
            checkout_url,
            plan_id: mercadoPagoPlanId,
            preference_id: preference_id,
            database_id: subscriptionResult?.[0]?.id
        });
    }
    catch (error) {
        console.error('❌ Erro ao criar assinatura:', error);
        // ✅ Tratamento específico para erros do Mercado Pago
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
