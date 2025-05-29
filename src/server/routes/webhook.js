const express = require('express');
const router = express.Router();

// Verificação do webhook (GET)
router.get('/', (req, res) => {
  const VERIFY_TOKEN = process.env.META_VERIFY_TOKEN;

  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verificado!');
    return res.status(200).send(challenge);
  } else {
    return res.sendStatus(403);
  }
});

// Receber mensagens e eventos (POST)
router.post('/', (req, res) => {
  console.log('📥 Webhook recebido da Meta:', JSON.stringify(req.body, null, 2));
  // Aqui você pode salvar mensagens ou eventos no banco futuramente
  res.sendStatus(200);
});

module.exports = router;
