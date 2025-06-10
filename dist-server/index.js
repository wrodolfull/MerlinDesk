"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const google_1 = __importDefault(require("./google"));
const google_calendar_1 = __importDefault(require("./google-calendar"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/google', google_1.default);
app.use('/google', google_calendar_1.default);
app.listen(PORT, () => {
    console.log(`Servidor backend rodando na porta ${PORT}`);
});
