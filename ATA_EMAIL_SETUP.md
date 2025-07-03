# 📧 Envio Automático de ATA por Email

## 🎯 Visão Geral

O sistema agora possui funcionalidade de envio automático da ATA (resumo da reunião) por email para todos os participantes do agendamento quando a ATA for salva.

## ✨ Funcionalidades

- **Envio automático**: Quando o profissional salva a ATA, ela é enviada automaticamente por email
- **Múltiplos destinatários**: Email enviado para cliente, profissional e convidados
- **Configuração por profissional**: Cada profissional pode ativar/desativar o envio
- **Template personalizado**: Email com design profissional e todas as informações da reunião
- **Resumo IA**: Se um resumo foi gerado por IA, ele também é incluído no email

## 🔧 Como Configurar

### 1. Acessar Configurações de Videochamada

1. Vá para **Videochamadas** no menu lateral
2. Selecione um profissional
3. Configure as opções na seguinte ordem:

```
✅ Ativar videochamada
  ↓
✅ Ativar ATA/Resumo  
  ↓
✅ Enviar resumo por e-mail
```

### 2. Configurações Necessárias

Para que o envio de email funcione, é necessário:

1. **Videochamada ativada** para o profissional
2. **ATA/Resumo ativada** para o profissional  
3. **Envio por email ativado** para o profissional
4. **Variáveis de ambiente** configuradas no Supabase:
   - `SMTP_USER` - Email do remetente
   - `SMTP_PASS` - Senha do email

## 📋 Como Usar

### 1. Durante a Videochamada

1. Inicie uma videochamada através do agendamento
2. Clique no botão **ATA** para abrir a janela de anotações
3. Anote os principais pontos da reunião
4. Opcional: Clique em **"Gerar resumo com IA"** para criar um resumo automático
5. Clique em **"Salvar ATA"**

### 2. Envio Automático

Quando você clicar em **"Salvar ATA"**:

1. ✅ A ATA é salva no banco de dados
2. ✅ O sistema verifica se o envio de email está ativado para o profissional
3. ✅ Se ativado, envia email para:
   - Cliente (email do agendamento)
   - Profissional (email do profissional)
   - Convidados (emails adicionais do agendamento)
4. ✅ Mostra confirmação do envio

### 3. Feedback Visual

Após salvar, você verá:

- **"✅ ATA salva com sucesso!"** - Confirmação de salvamento
- **"✅ ATA enviada por email para X destinatário(s)"** - Confirmação de envio
- **"ℹ️ Envio de email desabilitado para este profissional"** - Se a opção estiver desativada
- **"⚠️ ATA salva, mas erro ao enviar email"** - Se houver erro no envio

## 📧 Template do Email

O email enviado contém:

### Cabeçalho
- Logo do Merlin Desk
- Título "ATA da Reunião"
- Data e hora da reunião

### Detalhes do Agendamento
- Nome do cliente
- Nome do profissional
- Serviço realizado
- Data e horário
- Duração
- ID do agendamento

### Conteúdo da ATA
- Anotações completas da reunião
- Resumo gerado por IA (se aplicável)

### Rodapé
- Promoção do Merlin Desk
- Informações de copyright

## 🔒 Segurança e Privacidade

### Controle de Acesso
- Apenas profissionais autorizados podem enviar atas
- Emails são enviados apenas para participantes do agendamento
- Configurações são específicas por profissional

### Dados Sensíveis
- ATA é salva no banco de dados com criptografia
- Emails são enviados via SMTP seguro
- Tokens de autenticação são validados

## 🛠️ Arquivos Técnicos

### Edge Function
- **Arquivo**: `supabase/functions/send-meeting-notes/index.ts`
- **Função**: Processa o envio de email da ATA
- **Dependências**: nodemailer, date-fns

### Frontend
- **Arquivo**: `src/pages/AtaPage.tsx`
- **Função**: `handleSaveAta()` - Salva ATA e chama edge function

### Banco de Dados
- **Tabela**: `video_call_settings`
- **Coluna**: `send_summary_by_email` - Controla envio por profissional

## 🚨 Solução de Problemas

### Email não está sendo enviado

1. **Verificar configurações**:
   - Videochamada ativada?
   - ATA/Resumo ativada?
   - Envio por email ativado?

2. **Verificar variáveis de ambiente**:
   - `SMTP_USER` configurado?
   - `SMTP_PASS` configurado?

3. **Verificar logs**:
   - Console do navegador para erros
   - Logs da edge function no Supabase

### Erro "Envio de email desabilitado"

- Vá para **Videochamadas** → Selecione o profissional → Ative "Enviar resumo por e-mail"

### Erro de autenticação

- Verifique se o usuário está logado
- Verifique se o token de acesso é válido

## 📈 Próximas Melhorias

- [ ] Template de email personalizável
- [ ] Agendamento de envio de atas
- [ ] Relatórios de envio
- [ ] Integração com WhatsApp
- [ ] Notificações push

---

**Nota**: Esta funcionalidade requer que as variáveis de ambiente SMTP estejam configuradas no Supabase para funcionar corretamente. 