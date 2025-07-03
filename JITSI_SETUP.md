# 🎥 Configuração do Jitsi Meet

## 📋 Visão Geral

O sistema agora usa o **Jitsi Meet** para videochamadas, que é uma solução gratuita e hospedada pelo próprio Jitsi. Não é necessário configurar servidores ou instalar software adicional.

## ✨ Vantagens do Jitsi Meet

- ✅ **Totalmente gratuito** - hospedado pelo Jitsi
- ✅ **Sem configuração** - funciona imediatamente
- ✅ **Código aberto** - transparente e confiável
- ✅ **Compatível** - funciona em todos os navegadores
- ✅ **Seguro** - criptografia de ponta a ponta
- ✅ **Sem limites** - sem restrições de uso

## 🔧 Como Funciona

### 1. Geração de Sala
- Cada videochamada gera uma sala única baseada no ID do agendamento
- Formato: `merlindesk-{appointmentId}-{timestamp}`
- Exemplo: `merlindesk-12345-1703123456789`

### 2. Configuração do Iframe
- O Jitsi Meet é carregado em um iframe dentro do modal
- Configurações personalizadas para uma experiência mais limpa
- Nome do participante é definido automaticamente

### 3. Controles
- Todos os controles de áudio/vídeo são gerenciados pelo Jitsi
- Interface intuitiva e familiar
- Suporte a compartilhamento de tela

## 🚀 Uso

### Para Profissionais
1. Clique no botão de videochamada no agendamento
2. Permita acesso à câmera e microfone
3. Use os controles do Jitsi para gerenciar a chamada
4. Compartilhe o link da sala com o cliente se necessário

### Para Clientes
1. Receba o link da sala do profissional
2. Acesse o link no navegador
3. Permita acesso à câmera e microfone
4. Participe da videochamada

## 🔗 URLs das Salas

As salas são acessíveis através de URLs como:
```
https://meet.jit.si/merlindesk-12345-1703123456789
```

## ⚙️ Configurações Aplicadas

O iframe do Jitsi é configurado com as seguintes opções:

- `prejoinPageEnabled=false` - Entrada direta na sala
- `startWithAudioMuted=false` - Áudio ativado por padrão
- `startWithVideoMuted=false` - Vídeo ativado por padrão
- `enableClosePage=false` - Remove página de fechamento
- `enableWelcomePage=false` - Remove página de boas-vindas
- `enableLobbyChat=false` - Remove chat do lobby
- `enableKnockingParticipant=false` - Remove sistema de "bater na porta"
- `enableInsecureRoomNameWarning=false` - Remove avisos de segurança
- `enableRecording=false` - Desabilita gravação
- `enableLiveStreaming=false` - Desabilita transmissão ao vivo
- `enableScreensharing=true` - Mantém compartilhamento de tela

## 🔒 Segurança

- **Criptografia**: Todas as comunicações são criptografadas
- **Salas únicas**: Cada agendamento tem uma sala diferente
- **Sem persistência**: As salas são temporárias
- **Controle de acesso**: Apenas participantes com o link podem entrar

## 🆚 Comparação com LiveKit

| Recurso | LiveKit | Jitsi Meet |
|---------|---------|------------|
| Custo | Pago | Gratuito |
| Configuração | Complexa | Simples |
| Hospedagem | Própria | Jitsi |
| Limites | Sim | Não |
| Manutenção | Necessária | Automática |
| Escalabilidade | Limitada | Ilimitada |

## 🎯 Próximos Passos

1. **Testar a funcionalidade** em diferentes navegadores
2. **Verificar a qualidade** das videochamadas
3. **Coletar feedback** dos usuários
4. **Ajustar configurações** se necessário

## 📞 Suporte

Se houver problemas com as videochamadas:

1. Verifique se o navegador suporta WebRTC
2. Confirme que câmera e microfone estão funcionando
3. Teste em um navegador diferente
4. Verifique a conexão com a internet

---

**Nota**: Esta implementação substitui completamente o LiveKit, eliminando a necessidade de servidores próprios e configurações complexas. 