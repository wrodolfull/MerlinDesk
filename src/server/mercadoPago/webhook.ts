import express from 'express';
import { supabase } from '../supabase';

const router = express.Router();

router.post('/', async (req, res): Promise<void> => {
  const body = req.body;

  try {
    if (body.type === 'preapproval' && body.action === 'authorized') {
      const assinaturaId = body.data.id;

      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date().toISOString(),
        })
        .eq('assinatura_id', assinaturaId);

      if (error) {
        console.error('Erro ao ativar assinatura:', error);
        res.status(500).send('Erro ao ativar assinatura');
        return;
      }

      console.log(`✅ Assinatura ativada: ${assinaturaId}`);
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('Erro no webhook:', err);
    res.sendStatus(500);
  }
});

export default router;
