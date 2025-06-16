import express, { Request, Response } from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SERVICE_ROLE_KEY!
);

const MERCADO_PAGO_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN!;

const mercadoPagoAPI = axios.create({
  baseURL: 'https://api.mercadopago.com',
  headers: {
    Authorization: `Bearer ${MERCADO_PAGO_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

router.post('/criar', async (req: Request, res: Response): Promise<void> => {
  const { user_id, email } = req.body;

  if (!user_id || !email) {
    res.status(400).json({ error: 'user_id e email são obrigatórios' });
    return;
  }

  try {
    console.log('🔄 Criando plano no Mercado Pago...');
    
    // ✅ Buscar o plan_id dinamicamente (plano Empresa)
    const { data: planData, error: planError } = await supabase
      .from('subscription_plans')
      .select('id, name, price')
      .eq('name', 'Empresa')
      .single();

    if (planError || !planData) {
      console.error('❌ Erro ao buscar plano:', planError);
      res.status(500).json({ error: 'Plano Empresa não encontrado' });
      return;
    }
    
    // ✅ Criar plano no Mercado Pago
    const plano = await mercadoPagoAPI.post('/preapproval_plan', {
      reason: 'Assinatura Plano Empresa',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: planData.price || 79.9,
        currency_id: 'BRL',
      },
      back_url: 'https://merlindesk.com/login',
    });

    console.log('✅ Plano criado:', plano.data.id);

    // ✅ Criar checkout de pagamento
    const preference = await mercadoPagoAPI.post('/checkout/preferences', {
      items: [{
        title: 'Assinatura Plano Empresa',
        quantity: 1,
        unit_price: planData.price || 79.9,
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
      external_reference: user_id, // ✅ Adicionar referência do usuário
    });

    const checkout_url = preference.data.init_point;
    const preference_id = preference.data.id;

    // ✅ Dados alinhados com sua estrutura SQL
    const subscriptionData = {
      user_id,
      plan_id: planData.id, // ✅ UUID correto da busca
      assinatura_id: preference_id, // ✅ Conforme sua estrutura
      mercado_pago_plan_id: plano.data.id, // ✅ Conforme sua estrutura
      preference_id: preference_id, // ✅ Campo separado conforme SQL
      status: 'pending',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      // created_at e updated_at são automáticos pelos triggers
    };

    // ✅ Usar UPSERT com a constraint UNIQUE correta
    const { data: subscriptionResult, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, { 
        onConflict: 'user_id', // ✅ Funciona com sua constraint UNIQUE
        ignoreDuplicates: false 
      })
      .select();

    if (subscriptionError) {
      console.error('❌ Erro ao salvar assinatura no Supabase:', subscriptionError);
      res.status(500).json({ error: 'Erro ao salvar assinatura no banco de dados' });
      return;
    }

    console.log('✅ Dados salvos no Supabase:', subscriptionResult?.[0]?.id);

    res.json({ 
      checkout_url,
      plan_id: plano.data.id,
      preference_id: preference_id,
      database_id: subscriptionResult?.[0]?.id
    });

  } catch (error: any) {
    console.error('❌ Erro ao criar assinatura:', error.response?.data || error.message);
    res.status(500).json({ error: 'Erro ao criar assinatura' });
  }
});

export default router;
