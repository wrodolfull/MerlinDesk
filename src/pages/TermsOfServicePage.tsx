import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

const TermsOfServicePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Termos de Uso
            </CardTitle>
            <p className="text-sm text-gray-600 text-center">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </CardHeader>
          <CardContent className="prose max-w-none">
            <div className="space-y-6 text-gray-700">
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Aceitação dos Termos</h2>
                <p>
                  Ao acessar e usar o MerlinDesk, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
                  Se você não concordar com qualquer parte destes termos, não deve usar nosso serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Descrição do Serviço</h2>
                <p>
                  O MerlinDesk é uma plataforma de agendamento e gestão de consultas que permite aos profissionais 
                  gerenciar seus calendários, clientes e agendamentos de forma eficiente.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Uso Aceitável</h2>
                <p>Você concorda em usar o serviço apenas para propósitos legais e de acordo com estes termos. 
                Você não deve:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>Usar o serviço para atividades ilegais</li>
                  <li>Violar direitos de propriedade intelectual</li>
                  <li>Transmitir vírus ou código malicioso</li>
                  <li>Interferir no funcionamento do serviço</li>
                  <li>Compartilhar suas credenciais de acesso</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Conta do Usuário</h2>
                <p>
                  Você é responsável por manter a confidencialidade de sua conta e senha. 
                  Você concorda em aceitar responsabilidade por todas as atividades que ocorrem em sua conta.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Privacidade</h2>
                <p>
                  Sua privacidade é importante para nós. Por favor, revise nossa Política de Privacidade, 
                  que também rege seu uso do serviço.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Propriedade Intelectual</h2>
                <p>
                  O serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão 
                  propriedade exclusiva da MerlinDesk e seus licenciadores.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Limitação de Responsabilidade</h2>
                <p>
                  Em nenhuma circunstância a MerlinDesk será responsável por danos indiretos, incidentais, 
                  especiais, consequenciais ou punitivos, incluindo perda de lucros, dados ou uso.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Modificações</h2>
                <p>
                  Reservamo-nos o direito de modificar ou substituir estes termos a qualquer momento. 
                  Se uma revisão for material, forneceremos pelo menos 30 dias de aviso prévio.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Rescisão</h2>
                <p>
                  Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio, 
                  por qualquer motivo, incluindo sem limitação se você violar os Termos.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Lei Aplicável</h2>
                <p>
                  Estes Termos serão interpretados e governados pelas leis do Brasil, 
                  sem considerar seus conflitos de disposições legais.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contato</h2>
                <p>
                  Se você tiver alguma dúvida sobre estes Termos de Uso, entre em contato conosco através 
                  do suporte disponível na plataforma.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfServicePage; 