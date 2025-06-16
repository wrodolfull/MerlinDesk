import express from 'express';
import cors from 'cors';
import googleRoutes from './google';
import googleCalendarRoutes from './google-calendar';
import mercadoPagoAssinatura from './mercadoPago/assinatura';
import mercadoPagoWebhook from './mercadoPago/webhook';

console.log('🚀 Iniciando servidor...');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());

// ✅ Middleware de debug
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ✅ IMPORTANTE: Webhook ANTES do express.json()
app.use('/webhook/mercado-pago', express.raw({ type: 'application/json' }));
app.use('/webhook/mercado-pago', mercadoPagoWebhook);

// ✅ JSON middleware para outras rotas
app.use(express.json());

// ✅ Outras rotas
app.use('/google', googleRoutes);
app.use('/google', googleCalendarRoutes);
app.use('/mercado-pago', mercadoPagoAssinatura);

// ✅ Rota de teste
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
  console.log(`🔗 Webhook URL: http://localhost:${PORT}/webhook/mercado-pago`);
});
