const express = require('express');
const path = require('path');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 4173;

console.log('🟢 Iniciando servidor...');

// Diretório absoluto da pasta dist
const distDir = path.resolve(__dirname, 'dist');

// Middleware de segurança e performance
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        connectSrc: ["'self'", "https://zqtrmtkbkdzyapdtapss.supabase.co"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "https:", "data:"],
      },
    },
  })
);
app.use(compression());

// Servir arquivos estáticos
app.use(express.static(distDir, {
  maxAge: '1d',
  setHeaders(res) {
    res.setHeader('Cache-Control', 'public, max-age=86400');
  }
}));

// Fallback SPA - agora com rota padrão válida
app.use((req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

// Start do servidor
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor rodando em http://0.0.0.0:${PORT}`);
});
