require('dotenv').config();
const express = require('express');
const cors = require('cors');

const connectRoute = require('./routes/connect');
const sendMessageRoute = require('./routes/sendMessage');
const webhookRoute = require('./routes/webhook');

const app = express();
app.use(cors());
app.use(express.json());

// Rotas da API
app.use('/api/connect', connectRoute);
app.use('/api/send-message', sendMessageRoute);
app.use('/api/webhook', webhookRoute);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
});
