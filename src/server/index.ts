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
app.use(express.json());

// ✅ Middleware de debug ANTES dos routers
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

console.log('📦 Registrando routers...');
app.use('/google', googleRoutes);
app.use('/google', googleCalendarRoutes);
app.use('/mercado-pago', mercadoPagoAssinatura);
app.use('/mercado-pago/webhook', mercadoPagoWebhook);

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
