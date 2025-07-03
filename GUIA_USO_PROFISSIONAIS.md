# 🎯 Guia de Uso - Sistema de Profissionais Merlin Desk

## 📋 Visão Geral

Este guia explica como usar o sistema de criação e gestão de profissionais no Merlin Desk. O sistema permite que administradores criem profissionais e eles recebam acesso controlado ao sistema.

## 🚀 Como Funciona

### Fluxo Completo:
1. **Admin cria profissional** → 2. **Profissional recebe email** → 3. **Profissional completa cadastro** → 4. **Acesso liberado**

---

## 👨‍💼 Para Administradores

### 1. Criando um Novo Profissional

#### Passo a Passo:
1. **Acesse o Dashboard**
   - Faça login como administrador
   - Vá para o menu "Profissionais"

2. **Clique em "Criar Profissional"**
   - Botão azul no canto superior direito

3. **Preencha as Informações:**
   - **Nome Completo** (obrigatório)
   - **Email** (obrigatório)
   - **Telefone** (opcional)
   - **Biografia** (opcional)
   - **Especialidades** (separadas por vírgula)

4. **Clique em "Criar e Enviar Convite"**
   - Sistema validará os dados
   - Enviará email automaticamente
   - Mostrará confirmação de sucesso

#### ⚠️ Validações Importantes:
- **Email único**: Não pode ser usado por outro profissional
- **Nome**: Mínimo 2 caracteres
- **Email**: Formato válido
- **Telefone**: Formato válido (se fornecido)

#### ✅ Feedback Visual:
- **Campos com erro**: Bordas vermelhas
- **Mensagens de erro**: Explicativas e claras
- **Status de validação**: Indicador visual
- **Confirmação**: Antes de enviar convite

### 2. Gerenciando Profissionais

#### Status dos Profissionais:
- **🟢 Com Acesso**: Profissional já completou cadastro
- **🟡 Aguardando Cadastro**: Profissional criado, aguardando completar cadastro

#### Ações Disponíveis:
- **👁️ Ver**: Visualizar detalhes do profissional
- **✏️ Editar**: Modificar informações (em desenvolvimento)
- **🗑️ Deletar**: Remover profissional do sistema
- **📧 Reenviar Convite**: Para profissionais que não receberam email

#### 📊 Estatísticas:
- **Total de Profissionais**: Número total
- **Com Acesso**: Profissionais ativos
- **Sem Acesso**: Profissionais aguardando cadastro

---

## 👩‍⚕️ Para Profissionais

### 1. Recebendo o Convite

#### Email Recebido:
- **Assunto**: "Complete seu cadastro - Merlin Desk"
- **Conteúdo**: 
  - Saudação personalizada
  - Lista de funcionalidades disponíveis
  - Botão "Completar Cadastro"
  - Link alternativo

### 2. Completando o Cadastro

#### Passo a Passo:
1. **Clique no link do email**
   - Direciona para `/complete-registration?token=ID`

2. **Defina sua Senha:**
   - Mínimo 6 caracteres
   - Deve conter: letra maiúscula, minúscula e número
   - Confirme a senha

3. **Complete seu Perfil:**
   - **Foto de Perfil** (opcional)
   - **Telefone** (opcional)
   - **Biografia** (opcional)
   - **Especialidades** (separadas por vírgula)

4. **Clique em "Completar Cadastro"**
   - Sistema criará sua conta
   - Redirecionará para o dashboard

#### ⚠️ Validações:
- **Senha forte**: Requisitos de segurança
- **Confirmação**: Senhas devem coincidir
- **Telefone**: Formato válido (se fornecido)

### 3. Acessando o Sistema

#### Primeiro Login:
- Use o email recebido no convite
- Use a senha definida no cadastro
- Acesse o dashboard profissional

#### Funcionalidades Disponíveis:
- ✅ **Meu Perfil**: Visualizar e editar informações pessoais
- ✅ **Agendamentos**: Gerenciar seus próprios agendamentos
- ✅ **Calendário**: Visualizar e editar seu calendário
- ✅ **Especialidades**: Criar e gerenciar especialidades
- ✅ **Tarefas**: Gerenciar suas próprias tarefas
- ✅ **Integrações**: Conectar Google Calendar e WhatsApp
- ✅ **Videochamadas**: Acessar funcionalidade de videochamadas

---

## 🔧 Funcionalidades Técnicas

### Segurança:
- **Autenticação**: Supabase Auth
- **Controle de Acesso**: Row Level Security (RLS)
- **Permissões**: Granulares por funcionalidade
- **Validação**: Frontend e backend

### Dados:
- **Profissionais**: Tabela `professionals`
- **Permissões**: Tabela `professional_access`
- **Tasks**: Campo `professional_id` adicionado
- **Especialidades**: Associadas ao profissional

### Email:
- **Serviço**: Resend
- **Templates**: HTML responsivo
- **Tipos**: Completar cadastro / Acesso existente

---

## 🚨 Troubleshooting

### Problemas Comuns:

#### 1. Profissional não recebeu email
**Solução:**
- Verificar spam/lixo eletrônico
- Reenviar convite pelo painel admin
- Verificar configuração do Resend

#### 2. Erro ao completar cadastro
**Possíveis causas:**
- Link expirado ou inválido
- Email já em uso
- Problemas de conexão

**Solução:**
- Verificar link no email
- Tentar novamente
- Contatar administrador

#### 3. Profissional não consegue fazer login
**Possíveis causas:**
- Email incorreto
- Senha esquecida
- Conta não ativada

**Solução:**
- Usar "Esqueci minha senha"
- Verificar email de cadastro
- Contatar administrador

#### 4. Permissões não funcionando
**Solução:**
- Verificar role no metadata do usuário
- Verificar registro em `professional_access`
- Aguardar sincronização (pode levar alguns segundos)

---

## 📞 Suporte

### Para Administradores:
- **Email**: admin@merlindesk.com
- **Documentação**: Este guia
- **Logs**: Console do navegador

### Para Profissionais:
- **Contato**: Administrador do sistema
- **FAQ**: Seção de troubleshooting
- **Recuperação**: Link "Esqueci minha senha"

---

## 🔄 Atualizações

### Versão Atual: 1.0
- ✅ Criação de profissionais
- ✅ Sistema de convites por email
- ✅ Cadastro completo de profissionais
- ✅ Controle de acesso granular
- ✅ Tasks por profissional
- ✅ Integrações individuais

### Próximas Funcionalidades:
- 📅 Edição de profissionais
- 📊 Relatórios avançados
- 🔔 Notificações em tempo real
- 📱 App mobile

---

## 📝 Notas Importantes

1. **Backup**: Sempre faça backup antes de grandes alterações
2. **Testes**: Teste o fluxo completo antes de usar em produção
3. **Monitoramento**: Acompanhe logs de erro
4. **Segurança**: Mantenha senhas seguras
5. **Comunicação**: Informe profissionais sobre o processo

---

*Este guia deve ser atualizado conforme novas funcionalidades são adicionadas ao sistema.* 