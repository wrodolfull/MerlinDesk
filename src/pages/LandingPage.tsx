import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Building, Check, ArrowRight, Phone, Mail, MapPin, Menu, X, Sparkles, Zap, Star, Wand2, Play } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Barra de Navegação Fixa */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <div className="text-gray-900 font-bold text-xl">Merlin Desk</div>
          </div>
          
          {/* Menu Desktop */}
          <div className="hidden md:flex items-center space-x-8">
            {['Recursos', 'Preços'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-700 hover:text-gray-900 transition-colors font-medium">
                {item}
              </a>
            ))}
            <Link to="/login">
              <Button variant="ghost" className="text-gray-700 hover:bg-gray-50 font-medium">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-[#6D3FC4] text-white hover:bg-[#5A33A3] font-medium px-6">
                Começar grátis
              </Button>
            </Link>
          </div>

          {/* Botão Menu Mobile */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Menu Mobile */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="container mx-auto px-4 py-4 space-y-4">
              {['Recursos', 'Preços'].map(item => (
                <a 
                  key={item} 
                  href={`#${item.toLowerCase()}`} 
                  className="block text-gray-700 hover:text-gray-900 transition-colors py-2 font-medium"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <div className="pt-4 space-y-3">
                <Link to="/login" className="block">
                  <Button variant="ghost" className="w-full text-gray-700 hover:bg-gray-50 font-medium">
                    Entrar
                  </Button>
                </Link>
                <Link to="/register" className="block">
                  <Button className="w-full bg-[#6D3FC4] text-white hover:bg-[#5A33A3] font-medium">
                    Começar grátis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Seção Hero */}
      <section className="pt-32 pb-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
              Merlin Desk torna agendamentos <span className="text-[#6D3FC4]">simples</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
              Junte-se a profissionais que agendam reuniões facilmente e dominam sua rotina com sabedoria.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" className="bg-[#6D3FC4] text-white hover:bg-[#5A33A3] px-8 py-4 text-lg font-medium">
                  Começar grátis
                </Button>
              </Link>
              <a href="#demo">
                <Button size="lg" variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 text-lg font-medium">
                  <Play className="w-5 h-5 mr-2" />
                  Ver demonstração
                </Button>
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-4">Grátis para sempre — sem cartão de crédito necessário</p>
            <p className="text-sm text-gray-500 mb-6">Confiado por mais de 2.500 profissionais</p>
          </div>

          {/* Preview do Produto */}
          <div className="relative max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                  <div className="w-3 h-3 rounded-full bg-green-400"></div>
                  <div className="ml-4 text-sm text-gray-600">merlindesk.com/agendar</div>
                </div>
              </div>
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Realizar agendamento</h3>
                    <p className="text-gray-600 mb-6">Escolha um horário que funcione melhor para você.</p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-[#BFA3EC] cursor-pointer">
                        <Clock className="w-5 h-5 text-[#6D3FC4] mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Consulta de 30 min</div>
                          <div className="text-sm text-gray-500">Reunião inicial para conhecer suas necessidades</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center p-3 border border-gray-200 rounded-lg hover:border-[#BFA3EC] cursor-pointer">
                        <Users className="w-5 h-5 text-[#6D3FC4] mr-3" />
                        <div>
                          <div className="font-medium text-gray-900">Demonstração completa</div>
                          <div className="text-sm text-gray-500">Veja todos os recursos em ação</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-gray-900">Maio 2025</h4>
                        <div className="flex space-x-1">
                          <button className="p-1 hover:bg-gray-200 rounded">‹</button>
                          <button className="p-1 hover:bg-gray-200 rounded">›</button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1 mb-2">
                        {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                          <div key={i} className="text-center text-xs text-gray-500 py-2">{day}</div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: 35 }, (_, i) => {
                          const day = i - 5;
                          const isCurrentMonth = day > 0 && day <= 31;
                          const isToday = day === 21;
                          const hasSlots = [5, 12, 18, 25, 26].includes(day);
                          
                          return (
                            <div 
                              key={i} 
                              className={`text-center text-sm py-2 rounded cursor-pointer ${
                                !isCurrentMonth ? 'text-gray-300' :
                                isToday ? 'bg-[#6D3FC4] text-white font-bold' : 
                                hasSlots ? 'bg-blue-50 text-[#6D3FC4] hover:bg-[#E8DBFA]' : 
                                'text-gray-700 hover:bg-gray-100'
                              }`}
                            >
                              {isCurrentMonth ? day : ''}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <div className="text-sm font-medium text-gray-900">Horários disponíveis</div>
                        <div className="grid grid-cols-3 gap-2">
                          {['9:00', '10:30', '14:00', '15:30', '16:00'].map((time, i) => (
                            <button key={i} className="text-sm py-2 px-3 border border-gray-200 rounded hover:border-[#BFA3EC] hover:bg-[#F6F0FD]">
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Recursos */}
      <section id="recursos" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Merlin Desk torna agendamentos simples</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              O Merlin Desk é fácil o suficiente para usuários individuais e poderoso o suficiente para atender às necessidades de organizações empresariais.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8DBFA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-[#6D3FC4]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Calendários Ilimitados</h3>
              <p className="text-gray-600">O Merlin Desk conecta calendários para automatizar agendamentos de multiplos profissionais com disponibilidade em tempo real.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8DBFA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#6D3FC4]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Controle total da agenda</h3>
              <p className="text-gray-600">Mantenha os convidados informados sobre sua disponibilidade com configurações detalhadas e regras de agendamento.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#E8DBFA] rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-[#6D3FC4]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Relatórios completos</h3>
              <p className="text-gray-600">Tenha todos os dados de seus agendamento com um poderoso relatório.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Compartilhe sua página de agendamento</h3>
              <p className="text-lg text-gray-600 mb-6">
                Compartilhe seu link de agendamento diretamente com convidados.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200">
              <div className="bg-gray-100 rounded p-4 mb-4">
                <div className="text-sm text-gray-600 mb-2">Seu link de agendamento:</div>
                <div className="bg-white border border-gray-200 rounded px-3 py-2 text-[#6D3FC4] font-mono text-sm">
                  merlindesk.com/seucalendario
                </div>
              </div>
              <div className="space-y-3">
                <button className="w-full bg-[#6D3FC4] text-white py-2 rounded hover:bg-[#5A33A3]">
                  Compartilhar link
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 rounded hover:bg-gray-50">
                  Incorporar no site
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Redução de Faltas */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-gray-50 rounded-lg p-8">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Lembrete enviado</div>
                    <div className="text-sm text-gray-500">24h antes do agendamento</div>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-3 text-sm text-gray-700">
                  "Olá João! Lembre-se da sua consulta amanhã às 14:00."
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-[#E8DBFA] rounded-full flex items-center justify-center mr-3">
                    <Phone className="w-5 h-5 text-[#6D3FC4]" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">WhatsApp integrado</div>
                    <div className="text-sm text-gray-500">Comunicação direta</div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  Envie lembretes diretamente do painel para seus clientes.
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Reduza faltas e mantenha-se no caminho</h3>
              <p className="text-lg text-gray-600 mb-6">
                E-mails de lembrete para melhorar a presença e os resultados dos agendamentos.
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-[#E8DBFA] rounded-full flex items-center justify-center mr-3 mt-1">
                    <span className="text-[#6D3FC4] text-sm font-bold">60%</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Redução de faltas</div>
                    <div className="text-gray-600">Lembretes automáticos reduzem significativamente o número de faltas</div>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-1">
                    <Check className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Confirmação via WhatsApp</div>
                    <div className="text-gray-600">Clientes podem confirmar presença diretamente pelo WhatsApp</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Integrações */}
      {/* <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Conecte o Merlin Desk às ferramentas que você já usa</h2>
            <p className="text-xl text-gray-600">Aumente a produtividade com mais de 100 integrações</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              'Google Calendar', 'Outlook', 'Zoom', 'WhatsApp', 'Slack', 'Salesforce',
              'HubSpot', 'Zapier', 'Teams', 'Gmail', 'PayPal', 'Stripe'
            ].map((integration, i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 text-center hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gray-100 rounded mx-auto mb-2"></div>
                <div className="text-sm font-medium text-gray-700">{integration}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Seção de Preços */}
      <section id="precos" className="py-20 bg-white scroll-mt-28">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Escolha o plano perfeito para sua equipe</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            {/* Plano Pessoal */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Pessoal</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">Grátis</span>
                <span className="text-gray-500"> para sempre</span>
              </div>
              <p className="text-gray-600 mb-6">Para uso individual</p>
              <ul className="space-y-3 mb-8">
                {[
                  '1 calendário',
                  '20 agendamentos por mês',
                  'Relatório',
                  'Página de agendamento'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-[#6D3FC4] text-white hover:bg-[#5A33A3]">
                Começar grátis
              </Button>
            </div>

            {/* Plano Essencial */}
            <div className="bg-white rounded-lg border-2 border-[#6D3FC4] p-8 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-[#6D3FC4] text-white px-3 py-1 rounded-full text-sm font-medium">
                  Mais popular
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Essencial</h3>
              <div className="mb-4">
                <span className="text-3xl font-bold">R$69</span>
                <span className="text-gray-500">/mês</span>
              </div>
              <p className="text-gray-600 mb-6">Para uso profissional</p>
              <ul className="space-y-3 mb-8">
                {[
                  'Calendários ilimitados',
                  'Agendamentos ilimitados',
                  'Profissionais ilimitados',
                  'Especialidades ilimitadas',
                  'Lembretes automáticos',
                  'Relatório',
                  'Integração com Google',
                  'Assistente pessoal com IA',
                  'API',
                  'Suporte por email'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="w-5 h-5 text-green-500 mr-3" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-[#6D3FC4] text-white hover:bg-[#5A33A3]">
                Começar teste grátis
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Seção CTA Final */}
      <section className="py-20 bg-[#6D3FC4]">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Pronto para tornar o agendamento mais fácil do que nunca?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a milhões de profissionais que confiam no Merlin Desk para simplificar seus agendamentos.
          </p>
          <div className="flex justify-center">
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-[#6D3FC4] hover:bg-gray-50 px-8 py-4 text-lg font-medium"
              >
                Começar grátis
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-4">
            Grátis para sempre — sem cartão de crédito necessário
          </p>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
