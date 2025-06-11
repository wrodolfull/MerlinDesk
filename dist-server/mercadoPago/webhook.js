"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_1 = require("../supabase");
const router = express_1.default.Router();
router.post('/', async (req, res) => {
    const body = req.body;
    try {
        if (body.type === 'preapproval' && body.action === 'authorized') {
            const assinaturaId = body.data.id;
            const { error } = await supabase_1.supabase
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
    }
    catch (err) {
        console.error('Erro no webhook:', err);
        res.sendStatus(500);
    }
});
exports.default = router;
