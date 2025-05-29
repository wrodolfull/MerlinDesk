const express = require('express');
const router = express.Router();
const axios = require('axios');
const { validateUser } = require('../supabase');
const { Pool } = require('pg');

const pool = new Pool();

router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { access_token, phone_number_id, waba_id } = req.body;

  const user = await validateUser(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    // Teste de envio de mensagem para validar token e phone_number_id
    await axios.post(
      `https://graph.facebook.com/v17.0/${phone_number_id}/messages`,
      {
        messaging_product: 'whatsapp',
        to: '5585999999999', // Coloque um número de teste válido
        type: 'text',
        text: { body: 'Conexão WhatsApp realizada com sucesso!' }
      },
      {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
    );

    await pool.query(
      `INSERT INTO whatsapp_connections (user_id, access_token, phone_number_id, waba_id, verified)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id) DO UPDATE SET access_token = $2, phone_number_id = $3, waba_id = $4, verified = $5`,
      [user.id, access_token, phone_number_id, waba_id, true]
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao conectar número com a API Meta' });
  }
});

module.exports = router;
