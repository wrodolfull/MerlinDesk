import express from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { supabase } from '../supabase';

const router = express.Router();

const validateWebhookSignature = (
  dataId: string, 
  requestId: string, 
  signature: string
): boolean => {
  const secret = process.env.MP_WEBHOOK_SECRET!;
  
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
      } else if (key.trim() === 'v1') {
        hash = value.trim();
      }
    }
  });
  
  if (!ts || !hash) {
    return false;
  }
  
  const manifest = `id:${dataId};request-id:${requestId};ts:${ts};`;
  
  const expectedHash = crypto
    .createHmac('sha256', secret)
    .update(manifest)
    .digest('hex');
  
  return expectedHash === hash;
};

router.post('/', async (req, res): Promise<void> => {
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const signature = req.headers['x-signature'] as string;
    const requestId = req.headers['x-request-id'] as string;
    const dataId = req.query['data.id'] as string;

    console.log('📨 Webhook recebido:', JSON.stringify(body, null, 2));

    if (signature && process.env.MP_WEBHOOK_SECRET) {
      if (!validateWebhookSignature(dataId, requestId, signature)) {
        console.error('❌ Assinatura do webhook inválida');
        res.status(401).send('Unauthorized');
        return;
      }
      console.log('✅ Assinatura do webhook válida');
    }

    // ✅ Tratar eventos de payment
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      console.log(`🔄 Processando pagamento: ${paymentId}`);
      
      const mercadoPagoAPI = axios.create({
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

        // ✅ Buscar assinatura
        const { data: existingSubscription, error: selectError } = await supabase
          .from('user_subscriptions')
          .select('id, status, user_id, plan_id, current_plan_id')
          .eq('preference_id', payment.preference_id)
          .single();

        if (selectError || !existingSubscription) {
          console.error('❌ Assinatura não encontrada para preference_id:', payment.preference_id);
          res.status(200).send('OK - Assinatura não encontrada');
          return;
        }

        // ✅ IDs dos planos baseados nos seus dados
        const empresaPlanId = '13a351d7-08e5-41f0-8658-19e4e40b7254';
        const gratisPlanId = '5d14538d-9f51-41ba-a686-12c6b27af642';

        // ✅ Determinar novo status e plano baseado no pagamento
        let newStatus = 'pending';
        let newCurrentPlanId = gratisPlanId; // Padrão: plano gratuito

        if (payment.status === 'approved') {
          newStatus = 'active';
          newCurrentPlanId = empresaPlanId; // ✅ UPGRADE PARA EMPRESA
          console.log('🎉 Pagamento aprovado - Upgrading para plano Empresa');
        } else if (payment.status === 'cancelled' || payment.status === 'rejected') {
          newStatus = 'canceled';
          newCurrentPlanId = gratisPlanId; // ✅ DOWNGRADE PARA GRATUITO
          console.log('❌ Pagamento cancelado/rejeitado - Downgrade para plano gratuito');
        } else {
          // Pagamento pendente - mantém no plano gratuito
          newCurrentPlanId = gratisPlanId;
          console.log('⏳ Pagamento pendente - Mantendo no plano gratuito');
        }

        // ✅ Atualizar apenas se houver mudança
        if (existingSubscription.status !== newStatus || 
            existingSubscription.current_plan_id !== newCurrentPlanId) {
          
          const updateData: any = {
            status: newStatus,
            current_plan_id: newCurrentPlanId, // ✅ ATUALIZAR PLANO ATUAL
          };

          // ✅ Se aprovado, atualizar período
          if (newStatus === 'active') {
            updateData.current_period_start = new Date().toISOString();
            updateData.current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
          }

          const { error } = await supabase
            .from('user_subscriptions')
            .update(updateData)
            .eq('id', existingSubscription.id);

          if (error) {
            console.error('❌ Erro ao atualizar assinatura:', error);
            res.status(500).send('Erro ao atualizar assinatura');
            return;
          }

          const planName = newCurrentPlanId === empresaPlanId ? 'Empresa' : 'Grátis';
          console.log(`✅ Assinatura atualizada - Status: ${newStatus}, Plano: ${planName}`);
        } else {
          console.log(`ℹ️ Nenhuma alteração necessária`);
        }

      } catch (apiError) {
        console.error('❌ Erro ao consultar pagamento no MP:', apiError);
        res.status(500).send('Erro ao consultar pagamento');
        return;
      }
    }

    res.status(200).send('OK');
  } catch (err) {
    console.error('❌ Erro no webhook:', err);
    res.status(500).send('Erro interno');
  }
});

export default router;
