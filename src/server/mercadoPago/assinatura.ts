import express, { Request, Response } from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// ✅ Configuração do Supabase
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

// Rota existente
router.post('/assinatura', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ erro: 'E-mail do cliente é obrigatório.' });
    return;
  }

  try {
    const plano = await mercadoPagoAPI.post('/preapproval_plan', {
      reason: 'Plano Mensal Dohoo',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 79.9,
        currency_id: 'BRL',
      },
      back_url: 'https://merlindesk.com/login',
    });

    const planoId = plano.data.id;

    const assinatura = await mercadoPagoAPI.post('/preapproval', {
      preapproval_plan_id: planoId,
      payer_email: email,
      back_url: 'https://merlindesk.com/login',
    });

    res.status(200).json({
      init_point: assinatura.data.init_point,
      planoId,
      assinaturaId: assinatura.data.id,
    });
  } catch (error: unknown) {
    const err = error as any;
    console.error('Erro ao criar assinatura:', err.response?.data || err.message);
    res.status(500).json({ erro: 'Erro ao criar assinatura' });
  }
});

router.post('/criar', async (req: Request, res: Response): Promise<void> => {
  const { user_id, email } = req.body;

  if (!user_id || !email) {
    res.status(400).json({ error: 'user_id e email são obrigatórios' });
    return;
  }

  try {
    console.log('🔄 Criando plano no Mercado Pago...');
    
    // ✅ Criar apenas o plano (sem assinatura automática)
    const plano = await mercadoPagoAPI.post('/preapproval_plan', {
      reason: 'Assinatura Plano Empresa',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 79.9,
        currency_id: 'BRL',
      },
      back_url: 'https://merlindesk.com/login',
    });

    console.log('✅ Plano criado:', plano.data.id);

    // ✅ Criar link de pagamento (sem card_token_id)
    const preference = await mercadoPagoAPI.post('/checkout/preferences', {
      items: [{
        title: 'Assinatura Plano Empresa',
        quantity: 1,
        unit_price: 79.9,
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
    });

    const checkout_url = preference.data.init_point;
    const preference_id = preference.data.id;

    // Salvar no Supabase
    const subscriptionData = {
      user_id,
      plan_id: '13a351d7-08e5-4f10-8658-19e4e40b7254',
      assinatura_id: preference_id,
      mercado_pago_plan_id: plano.data.id,
      status: 'pending',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: subscriptionResult, error: subscriptionError } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, { 
        onConflict: 'user_id',
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