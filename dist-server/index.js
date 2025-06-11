"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const google_1 = __importDefault(require("./google"));
const google_calendar_1 = __importDefault(require("./google-calendar"));
const assinatura_1 = __importDefault(require("./mercadoPago/assinatura"));
const webhook_1 = __importDefault(require("./mercadoPago/webhook"));
console.log('🚀 Iniciando servidor...');
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// ✅ Middleware de debug ANTES dos routers
app.use((req, res, next) => {
    console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
console.log('📦 Registrando routers...');
app.use('/google', google_1.default);
app.use('/google', google_calendar_1.default);
app.use('/mercado-pago', assinatura_1.default);
app.use('/mercado-pago/webhook', webhook_1.default);
app.listen(PORT, () => {
    console.log(`✅ Servidor rodando na porta ${PORT}`);
});
