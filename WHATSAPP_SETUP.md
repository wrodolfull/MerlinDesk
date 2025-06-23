# Configuração WhatsApp Cloud API - MerlinDesk

## Visão Geral

O MerlinDesk oferece integração com WhatsApp Business API para envio automático de notificações de agendamento. Esta funcionalidade está disponível **apenas para usuários com plano Empresa**.

## 🔒 Controle de Acesso

### Plano Empresa
- ✅ **Acesso completo** à integração WhatsApp
- ✅ **Teste de funcionalidades** via interface
- ✅ **Notificações automáticas** de agendamentos
- ✅ **Respostas automáticas** a mensagens recebidas

### Planos Gratuito e Básico
- ❌ **Acesso bloqueado** à integração WhatsApp
- ❌ **Interface desabilitada** com indicador visual
- ❌ **Funcionalidades não disponíveis**

## 📋 Pré-requisitos

1. **Plano Empresa** ativo no MerlinDesk
2. **Conta Meta for Developers** (https://developers.facebook.com)
3. **App do Facebook** com produto WhatsApp Business API
4. **Número de telefone verificado** no WhatsApp Business
5. **Token de acesso permanente** do WhatsApp Business API

## 🚀 Configuração Passo a Passo

### 1. Criar App no Meta for Developers

1. Acesse [Meta for Developers](https://developers.facebook.com)
2. Clique em "Criar App"
3. Selecione "Business" como tipo de app
4. Preencha as informações básicas do app

### 2. Adicionar Produto WhatsApp

1. No painel do app, clique em "Adicionar Produto"
2. Selecione "WhatsApp"
3. Clique em "Configurar"

### 3. Configurar Número de Telefone

1. Na seção "WhatsApp", clique em "Adicionar número de telefone"
2. Digite seu número de telefone
3. Escolha o método de verificação (SMS ou chamada)
4. Digite o código de verificação recebido
5. Anote o **Phone Number ID** (será necessário)

### 4. Gerar Token de Acesso

1. Na seção "WhatsApp", clique em "Tokens"
2. Clique em "Gerar token"
3. Selecione as permissões necessárias:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`
4. Copie o token gerado (será necessário)

### 5. Configurar Webhook

1. Na seção "WhatsApp", clique em "Webhooks"
2. Clique em "Configurar"
3. Digite a URL do webhook: `https://merlindesk.com/whatsapp/webhook`
4. Digite um **Verify Token** personalizado (será necessário)
5. Selecione os campos a serem enviados:
   - `messages`
   - `message_status`
6. Clique em "Verificar e Salvar"

## 🔧 Configuração no Servidor

### Variáveis de Ambiente

Adicione as seguintes variáveis ao arquivo `.env` do servidor:

```env
# WhatsApp Cloud API
WHATSAPP_TOKEN=seu_access_token_aqui
WHATSAPP_PHONE_NUMBER_ID=seu_phone_number_id_aqui
META_VERIFY_TOKEN=seu_verify_token_personalizado_aqui
```

### Configuração do Servidor

O servidor já está configurado para usar essas variáveis de ambiente. Não é necessária configuração adicional no frontend.

## 🧪 Testando a Integração

### 1. Verificar Acesso

1. Faça login no MerlinDesk com uma conta de plano Empresa
2. Vá para **Integrações** no menu lateral
3. Verifique se a seção "WhatsApp Business API" está disponível

### 2. Teste de Conexão

1. Na página de Integrações, clique em **"Testar"**
2. O sistema verificará se todas as credenciais estão corretas
3. O status será exibido com detalhes da configuração

### 3. Enviar Mensagem de Teste

1. No modal de teste, digite um número de telefone
2. Digite uma mensagem personalizada
3. Clique em **"Enviar Mensagem"**
4. Verifique se a mensagem foi recebida

### 4. Teste de Notificação de Agendamento

1. No modal de teste, clique em **"Enviar Notificação de Teste"**
2. Uma notificação de agendamento será enviada
3. Verifique se a notificação foi recebida corretamente

## 📱 Funcionalidades Automáticas

### Notificações Enviadas Automaticamente

1. **Confirmação de Agendamento**
   - Enviada quando um agendamento é criado
   - Inclui detalhes do agendamento (data, horário, profissional, especialidade)

2. **Lembretes de Agendamento**
   - Enviados automaticamente antes do agendamento
   - Configurável para diferentes intervalos

3. **Cancelamentos**
   - Enviados quando um agendamento é cancelado
   - Inclui informações para reagendamento

### Respostas Automáticas

O sistema responde automaticamente a mensagens recebidas:

- **"confirmar"** ou **"sim"** → Confirmação de presença
- **"cancelar"** ou **"não"** → Cancelamento confirmado
- **"reagendar"** → Instruções para reagendamento
- **Outras mensagens** → Resposta padrão

## 🔒 Segurança e Privacidade

### Configuração Global

- **Configuração única** para toda a aplicação
- **Credenciais centralizadas** no servidor
- **Controle de acesso** baseado no plano do usuário
- **Logs de auditoria** para todas as operações

### Armazenamento Seguro

- Tokens armazenados como variáveis de ambiente
- Acesso restrito ao servidor
- Logs detalhados para monitoramento

## 🛠️ Gerenciamento

### Atualizar Configuração

1. **Edite as variáveis de ambiente** no servidor
2. **Reinicie o servidor** para aplicar as mudanças
3. **Teste a configuração** via interface

### Desativar Integração

1. **Remova as variáveis de ambiente** do servidor
2. **Reinicie o servidor**
3. **A integração será desabilitada** automaticamente

## 🚨 Solução de Problemas

### Erro: "Funcionalidade não disponível"

**Causa**: Usuário não tem plano Empresa
**Solução**: Faça upgrade para o plano Empresa

### Erro: "Token inválido"

**Causa**: Token expirado ou incorreto
**Solução**: 
1. Gere um novo token no Meta for Developers
2. Atualize a variável de ambiente WHATSAPP_TOKEN

### Erro: "Phone Number ID inválido"

**Causa**: ID do número incorreto
**Solução**: 
1. Verifique o Phone Number ID no Meta for Developers
2. Atualize a variável de ambiente WHATSAPP_PHONE_NUMBER_ID

### Mensagens não são enviadas

**Possíveis causas**:
1. Número de telefone não verificado
2. Token sem permissões adequadas
3. Webhook não configurado corretamente

**Solução**:
1. Verifique se o número está verificado
2. Confirme as permissões do token
3. Teste a configuração do webhook

### Webhook não funciona

**Verificação**:
1. URL do webhook está correta?
2. Verify Token está correto?
3. Servidor está acessível?

**Solução**:
1. Verifique a URL: `https://merlindesk.com/whatsapp/webhook`
2. Confirme o Verify Token
3. Teste a conectividade do servidor

## 📞 Suporte

Se você encontrar problemas:

1. **Verifique os logs** no console do navegador
2. **Teste a configuração** usando o modal de teste
3. **Consulte esta documentação** para soluções comuns
4. **Entre em contato** com o suporte técnico

## 💰 Planos e Preços

### Plano Empresa
- **Preço**: R$ 99,90/mês
- **Inclui**: Integração WhatsApp Business API
- **Limite**: Mensagens ilimitadas
- **Suporte**: Prioridade

### Outros Planos
- **Gratuito**: Sem integração WhatsApp
- **Básico**: Sem integração WhatsApp
- **Profissional**: Sem integração WhatsApp

---

**Nota**: A integração WhatsApp é uma funcionalidade exclusiva do plano Empresa. Para acessar, faça upgrade do seu plano atual. 