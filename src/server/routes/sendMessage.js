const express = require('express');
const router = express.Router();
const axios = require('axios');
const { validateUser } = require('../supabase');
const { Pool } = require('pg');

const pool = new Pool();

router.post('/', async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  const { to, text } = req.body;

  const user = await validateUser(token);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { rows } = await pool.query('SELECT * FROM whatsapp_connections WHERE user_id = $1', [user.id]);
  const conn = rows[0];
  if (!conn) return res.status(400).json({ error: 'Usuário não conectou um número ainda.' });

  try {
    await axios.post(
      `https://graph.facebook.com/v17.0/${conn.phone_number_id}/messages`,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text }
      },
      {
        headers: {
          Authorization: `Bearer ${conn.access_token}`
        }
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Erro ao enviar mensagem pelo WhatsApp API' });
  }
});

module.exports = router;
