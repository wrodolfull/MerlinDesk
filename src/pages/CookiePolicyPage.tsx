import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Política de Cookies
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. O que são Cookies?</h2>
                <p>
                  Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, 
                  tablet ou celular) quando você visita um site. Eles são amplamente utilizados para fazer 
                  os sites funcionarem de forma mais eficiente, bem como fornecer informações aos proprietários do site.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Como Usamos Cookies</h2>
                <p>Utilizamos cookies para:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Lembrar suas preferências e configurações</li>
                  <li>Analisar como você usa nosso site para melhorar nossos serviços</li>
                  <li>Personalizar sua experiência de navegação</li>
                  <li>Garantir a segurança da sua conta</li>
                  <li>Fornecer funcionalidades essenciais do site</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Tipos de Cookies que Utilizamos</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies Essenciais</h3>
                    <p>
                      Estes cookies são necessários para o funcionamento básico do site. Eles incluem cookies 
                      que permitem que você faça login em áreas seguras do site, use um carrinho de compras ou 
                      use serviços de e-billing.
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Cookies de autenticação</li>
                      <li>Cookies de sessão</li>
                      <li>Cookies de segurança</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies de Performance</h3>
                    <p>
                      Estes cookies coletam informações sobre como os visitantes usam um site, por exemplo, 
                      quais páginas os visitantes vão com mais frequência e se recebem mensagens de erro.
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Google Analytics</li>
                      <li>Cookies de análise de uso</li>
                      <li>Cookies de monitoramento de performance</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies de Funcionalidade</h3>
                    <p>
                      Estes cookies permitem que o site se lembre de escolhas que você faz (como seu nome de usuário, 
                      idioma ou a região em que você está) e forneça recursos aprimorados e mais pessoais.
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Cookies de preferências de idioma</li>
                      <li>Cookies de configurações de tema</li>
                      <li>Cookies de personalização</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Cookies de Marketing</h3>
                    <p>
                      Estes cookies são usados para rastrear visitantes em sites. A intenção é exibir anúncios 
                      que são relevantes e envolventes para o usuário individual.
                    </p>
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Cookies de publicidade</li>
                      <li>Cookies de redes sociais</li>
                      <li>Cookies de remarketing</li>
                    </ul>
                  </div>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies de Terceiros</h2>
                <p>
                  Alguns cookies podem ser colocados por serviços de terceiros que aparecem em nossas páginas, 
                  como Google Analytics, Google Maps, e redes sociais. Estes cookies são gerenciados pelos 
                  respectivos provedores de serviços.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mt-3">
                  <h4 className="font-semibold text-gray-800 mb-2">Serviços de Terceiros que Utilizamos:</h4>
                  <ul className="list-disc pl-6 space-y-1">
                    <li><strong>Google Analytics:</strong> Para análise de tráfego e comportamento dos usuários</li>
                    <li><strong>Google Calendar:</strong> Para integração com calendários</li>
                    <li><strong>Mercado Pago:</strong> Para processamento de pagamentos</li>
                    <li><strong>WhatsApp Business API:</strong> Para comunicação com clientes</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Como Gerenciar Cookies</h2>
                <p>
                  Você pode controlar e/ou excluir cookies conforme desejar. Você pode excluir todos os cookies 
                  que já estão no seu computador e pode configurar a maioria dos navegadores para impedir que 
                  sejam colocados.
                </p>
                
                <div className="bg-blue-50 p-4 rounded-lg mt-3">
                  <h4 className="font-semibold text-blue-800 mb-2">Como desabilitar cookies:</h4>
                  <ul className="list-disc pl-6 space-y-1 text-blue-700">
                    <li><strong>Chrome:</strong> Configurações → Privacidade e segurança → Cookies e outros dados do site</li>
                    <li><strong>Firefox:</strong> Opções → Privacidade e Segurança → Cookies e dados do site</li>
                    <li><strong>Safari:</strong> Preferências → Privacidade → Gerenciar dados do site</li>
                    <li><strong>Edge:</strong> Configurações → Cookies e permissões do site</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mt-3">
                  <p className="text-yellow-800">
                    <strong>Importante:</strong> Desabilitar cookies pode afetar a funcionalidade do site. 
                    Alguns recursos podem não funcionar corretamente se os cookies estiverem desabilitados.
                  </p>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cookies Específicos do MerlinDesk</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full border border-gray-200">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-200 px-4 py-2 text-left">Nome do Cookie</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Propósito</th>
                        <th className="border border-gray-200 px-4 py-2 text-left">Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">session_id</td>
                        <td className="border border-gray-200 px-4 py-2">Manter sessão do usuário</td>
                        <td className="border border-gray-200 px-4 py-2">Sessão</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">user_preferences</td>
                        <td className="border border-gray-200 px-4 py-2">Preferências do usuário</td>
                        <td className="border border-gray-200 px-4 py-2">1 ano</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">language</td>
                        <td className="border border-gray-200 px-4 py-2">Idioma preferido</td>
                        <td className="border border-gray-200 px-4 py-2">1 ano</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-200 px-4 py-2">theme</td>
                        <td className="border border-gray-200 px-4 py-2">Tema da interface</td>
                        <td className="border border-gray-200 px-4 py-2">1 ano</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Consentimento de Cookies</h2>
                <p>
                  Ao usar nosso site, você concorda com o uso de cookies conforme descrito nesta política. 
                  Se você não concordar com o uso de cookies, pode desabilitá-los nas configurações do seu navegador.
                </p>
                <p className="mt-3">
                  Você pode retirar seu consentimento a qualquer momento alterando as configurações do seu navegador 
                  ou entrando em contato conosco.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Atualizações desta Política</h2>
                <p>
                  Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas 
                  práticas ou por outros motivos operacionais, legais ou regulamentares. Recomendamos que você 
                  revise esta política regularmente.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contato</h2>
                <p>
                  Se você tiver dúvidas sobre esta Política de Cookies ou sobre como utilizamos cookies, 
                  entre em contato conosco através do suporte disponível na plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Informações Adicionais</h2>
                <p>
                  Para mais informações sobre cookies e como gerenciá-los, você pode visitar:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.allaboutcookies.org</a></li>
                  <li><a href="https://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.youronlinechoices.com</a></li>
                  <li><a href="https://www.networkadvertising.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.networkadvertising.org</a></li>
                </ul>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CookiePolicyPage; 