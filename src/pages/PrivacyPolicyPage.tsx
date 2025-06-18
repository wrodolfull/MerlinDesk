import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Política de Privacidade
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Informações que Coletamos</h2>
                <p>Coletamos as seguintes informações quando você usa nosso serviço:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Informações de conta:</strong> nome, email, senha</li>
                  <li><strong>Dados do perfil:</strong> informações profissionais, especialidades</li>
                  <li><strong>Dados de clientes:</strong> nome, email, telefone (quando você os adiciona)</li>
                  <li><strong>Dados de agendamentos:</strong> horários, notas, status</li>
                  <li><strong>Dados de uso:</strong> como você interage com a plataforma</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Como Usamos Suas Informações</h2>
                <p>Usamos suas informações para:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Fornecer e manter nosso serviço</li>
                  <li>Processar agendamentos e notificações</li>
                  <li>Melhorar nossos serviços</li>
                  <li>Enviar comunicações importantes</li>
                  <li>Cumprir obrigações legais</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Compartilhamento de Informações</h2>
                <p>
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                  exceto nas seguintes situações:
                </p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Com seu consentimento explícito</li>
                  <li>Para cumprir obrigações legais</li>
                  <li>Com prestadores de serviços que nos ajudam a operar a plataforma</li>
                  <li>Para proteger nossos direitos e segurança</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Segurança dos Dados</h2>
                <p>
                  Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger 
                  suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies e Tecnologias Similares</h2>
                <p>
                  Usamos cookies e tecnologias similares para melhorar sua experiência, analisar o uso 
                  do serviço e personalizar conteúdo. Você pode controlar o uso de cookies através 
                  das configurações do seu navegador.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Retenção de Dados</h2>
                <p>
                  Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os 
                  propósitos descritos nesta política, a menos que um período de retenção mais longo 
                  seja exigido ou permitido por lei.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Seus Direitos</h2>
                <p>Você tem os seguintes direitos em relação aos seus dados pessoais:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li><strong>Acesso:</strong> solicitar informações sobre os dados que temos sobre você</li>
                  <li><strong>Correção:</strong> solicitar correção de dados imprecisos</li>
                  <li><strong>Exclusão:</strong> solicitar a exclusão de seus dados pessoais</li>
                  <li><strong>Portabilidade:</strong> solicitar uma cópia de seus dados em formato legível</li>
                  <li><strong>Oposição:</strong> opor-se ao processamento de seus dados</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Transferências Internacionais</h2>
                <p>
                  Seus dados podem ser transferidos e processados em países diferentes do seu país de residência. 
                  Garantimos que essas transferências são feitas de acordo com as leis de proteção de dados aplicáveis.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Menores de Idade</h2>
                <p>
                  Nosso serviço não é destinado a menores de 18 anos. Não coletamos intencionalmente 
                  informações pessoais de menores de idade. Se você é pai ou responsável e acredita 
                  que seu filho nos forneceu informações pessoais, entre em contato conosco.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Alterações nesta Política</h2>
                <p>
                  Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você 
                  sobre quaisquer alterações significativas através do serviço ou por email.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contato</h2>
                <p>
                  Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos 
                  suas informações pessoais, entre em contato conosco através do suporte disponível na plataforma.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">12. Lei Geral de Proteção de Dados (LGPD)</h2>
                <p>
                  Esta política está em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). 
                  Se você tiver dúvidas sobre seus direitos sob a LGPD, entre em contato conosco.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage; 