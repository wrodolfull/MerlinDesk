import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, Users, Building, Check, ArrowRight, Phone, Mail, MapPin } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

const LandingPage = () => {
  return (
    <div className="min-h-screen">
      {/* Barra de Navegação Fixa */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="text-primary-700 font-bold text-xl">AgendaFácil</div>
          <div className="hidden md:flex items-center space-x-6">
            {['Recursos', 'Planos', 'Preços', 'Sobre'].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-primary-700/80 hover:text-primary-700 transition-colors">
                {item}
              </a>
            ))}
            <Link to="/login">
              <Button variant="ghost" className="text-primary-700 border border-primary-700/30 hover:bg-primary-700/10">
                Entrar
              </Button>
            </Link>
            <Link to="/register">
              <Button className="bg-primary-700 text-white hover:bg-primary-800">
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Seção Hero */}
      <section className="relative overflow-hidden pt-28 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-primary-100 to-white"></div>
        <div className="absolute top-0 right-0 w-full h-full overflow-hidden">
          <svg className="absolute top-0 right-0 opacity-10" width="800" height="800" viewBox="0 0 800 800">
            <defs>
              <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" />
                <stop offset="100%" stopColor="#EC4899" />
              </linearGradient>
            </defs>
            <circle cx="400" cy="400" r="300" fill="none" stroke="url(#grad1)" strokeWidth="100" strokeDasharray="50 30" />
            <circle cx="400" cy="400" r="200" fill="none" stroke="url(#grad1)" strokeWidth="50" strokeDasharray="20 20" />
          </svg>
        </div>
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <span className="inline-block px-4 py-2 rounded-full bg-primary-700/10 text-primary-700 font-medium text-sm mb-6">
                Novo: Integração com WhatsApp
              </span>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-gray-900">
                Agendamentos <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">simplificados</span> para seu negócio
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-600">
                Automatize agendamentos para barbearias, clínicas estéticas, consultórios e muito mais com nossa plataforma intuitiva.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg" className="w-full sm:w-auto bg-primary-700 text-white hover:bg-primary-800 relative overflow-hidden group">
                    <span className="relative z-10">Experimente Grátis</span>
                    <span className="absolute inset-0 bg-gradient-to-r from-primary-700/0 via-white/30 to-primary-700/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></span>
                  </Button>
                </Link>
                <a href="#demo">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-700 text-primary-700 hover:bg-primary-700/10">
                    Ver Demonstração
                  </Button>
                </a>
              </div>
              <div className="mt-8 flex items-center">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                      <div className={`w-full h-full bg-gradient-to-br from-primary-${i*100} to-secondary-${i*100}`}></div>
                    </div>
                  ))}
                </div>
                <div className="ml-4 text-sm text-gray-600">
                  <span className="font-bold text-primary-700">+2.500</span> empresas já utilizam
                </div>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center md:justify-end">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-lg blur opacity-30"></div>
                <div className="relative bg-white rounded-lg shadow-xl p-1 overflow-hidden">
                  <div className="aspect-[4/3] w-full max-w-md bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div className="text-primary-700 font-bold">AgendaFácil</div>
                        <div className="text-gray-500 text-sm">Maio 2025</div>
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-semibold text-gray-800">Visão Semanal</h3>
                          <div className="text-primary-700 text-sm">Hoje</div>
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1 mb-3">
                          {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                            <div key={i} className="text-gray-500 text-center text-xs">{day}</div>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 31 }, (_, i) => (
                            <div 
                              key={i} 
                              className={`text-center text-xs py-2 rounded-full ${
                                i + 1 === 21 ? 'bg-primary-700 text-white font-bold' : 
                                [5, 12, 18, 25].includes(i + 1) ? 'bg-primary-100 text-primary-700' : 'text-gray-700'
                              }`}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="bg-white rounded-lg shadow-sm p-3 flex items-center border-l-4 border-green-500">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">09:00 - Corte de Cabelo</div>
                            <div className="text-xs text-gray-500">Carlos Silva</div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 flex items-center border-l-4 border-blue-500">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">11:30 - Barba</div>
                            <div className="text-xs text-gray-500">André Martins</div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        </div>
                        
                        <div className="bg-white rounded-lg shadow-sm p-3 flex items-center border-l-4 border-purple-500">
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-800">14:00 - Consulta</div>
                            <div className="text-xs text-gray-500">Maria Oliveira</div>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-purple-500"></div>
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
      <section id="recursos" className="py-16 bg-white relative overflow-hidden">
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-primary-50 to-white"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recursos Poderosos para Agendamentos</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo o que você precisa para gerenciar agendamentos e fazer seu negócio crescer.
            </p>
          </div>

          
        </div>
      </section>

      {/* Seção Por Que Escolher */}
      <section id="vantagens" className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-gray-100"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Por Que Escolher AgendaFácil</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mb-4"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="text-4xl mb-4 bg-gradient-to-br from-primary-500 to-primary-600 text-transparent bg-clip-text">⚡️</div>
              <h3 className="text-xl font-bold mb-3">Aumente a Eficiência</h3>
              <p className="text-gray-600">Reduza o trabalho administrativo em 70% com nosso sistema automatizado de agendamento</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="text-4xl mb-4 bg-gradient-to-br from-primary-500 to-primary-600 text-transparent bg-clip-text">📱</div>
              <h3 className="text-xl font-bold mb-3">Reduza Faltas</h3>
              <p className="text-gray-600">Lembretes automáticos ajudaram empresas a diminuir faltas em 60%</p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary-400/20 to-primary-600/20 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="text-4xl mb-4 bg-gradient-to-br from-primary-500 to-primary-600 text-transparent bg-clip-text">💰</div>
              <h3 className="text-xl font-bold mb-3">Aumente a Receita</h3>
              <p className="text-gray-600">Nossos clientes relatam um aumento médio de 30% nos agendamentos após a implementação</p>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Demonstração */}
      <section id="demo" className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-gray-50"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Veja Como Funciona</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experimente nossa plataforma intuitiva e transforme a maneira como você gerencia agendamentos.
            </p>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden shadow-xl border border-gray-100">
            <div className="aspect-video w-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
              <div className="text-white text-center p-8">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polygon points="10 8 16 12 10 16 10 8"></polygon>
                </svg>
                <p className="text-xl font-medium">Assista ao vídeo de demonstração</p>
              </div>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mb-4 text-xl font-bold">1</div>
                  <h3 className="text-lg font-semibold mb-2">Configure sua Agenda</h3>
                  <p className="text-gray-600">Defina seus serviços, horários disponíveis e profissionais em minutos.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mb-4 text-xl font-bold">2</div>
                  <h3 className="text-lg font-semibold mb-2">Compartilhe seu Link</h3>
                  <p className="text-gray-600">Envie aos clientes ou integre em seu site e redes sociais.</p>
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center mb-4 text-xl font-bold">3</div>
                  <h3 className="text-lg font-semibold mb-2">Gerencie Agendamentos</h3>
                  <p className="text-gray-600">Acompanhe compromissos, envie lembretes e analise resultados.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção de Depoimentos */}
      <section className="py-16 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O Que Nossos Clientes Dizem</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empresas adoram como o AgendaFácil simplifica seu fluxo de trabalho de agendamento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Depoimento 1 */}
            <Card className="border-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/10 to-primary-600/10 rounded-tl-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "O AgendaFácil transformou a maneira como gerenciamos nossa barbearia. Nossos clientes adoram o agendamento online fácil, e reduzimos as faltas em 60%."
                </p>
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-300">
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">MS</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Miguel Silva</p>
                    <p className="text-sm text-gray-600">Proprietário, Barbearia Central</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 2 */}
            <Card className="border-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/10 to-primary-600/10 rounded-tl-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "O recurso de múltiplas agendas é perfeito para nossa clínica com vários especialistas. Podemos gerenciar todos os compromissos em um só lugar, mantendo as agendas separadas."
                </p>
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-300">
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">JL</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Dra. Juliana Lima</p>
                    <p className="text-sm text-gray-600">Diretora Médica, Clínica Bem-Estar</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Depoimento 3 */}
            <Card className="border-none relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-primary-100"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-400/10 to-primary-600/10 rounded-tl-full"></div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">
                  "Como um pequeno salão de beleza, o AgendaFácil nos ajudou a parecer profissionais e fornecer uma experiência de agendamento perfeita. Nossos clientes adoram!"
                </p>
                <div className="flex items-center">
                  <div className="mr-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 p-0.5">
                      <div className="w-full h-full rounded-full overflow-hidden bg-gray-300">
                        <div className="w-full h-full flex items-center justify-center text-white font-bold">ST</div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sofia Torres</p>
                    <p className="text-sm text-gray-600">Proprietária, Salão Beleza Natural</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção de Preços */}
      <section id="precos" className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-white"></div>
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Planos Simples e Transparentes</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full mb-4"></div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano perfeito para o tamanho e as necessidades do seu negócio.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Plano Grátis */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 transition-transform hover:scale-105 duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Grátis</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-primary-700">R$0</span>
                <span className="text-gray-500 ml-2">/mês</span>
              </div>
              <p className="text-gray-600 mt-3">Ideal para começar e testar todos os recursos.</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {[
                  '1 calendário',
                  'Até 50 agendamentos/mês',
                  'Página de agendamento'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="h-5 w-5 text-primary-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register?plan=free" className="mt-6 block">
                <Button className="w-full bg-primary-700 text-white hover:bg-primary-800">
                  Começar Grátis
                </Button>
              </Link>
            </div>
          </div>

          {/* Plano Empresarial */}
          <div className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-100 transition-transform hover:scale-105 duration-300">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Empresarial</h3>
              <div className="flex items-baseline">
                <span className="text-4xl font-bold text-primary-700">R$299</span>
                <span className="text-gray-500 ml-2">/mês</span>
              </div>
              <p className="text-gray-600 mt-3">Para empresas em crescimento que precisam de tudo.</p>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {[
                  'Calendários ilimitados',
                  'Agendamentos ilimitados',
                  'Lembretes via WhatsApp',
                  'Página de agendamento',
                  'Relatório avançado',
                  'Assistente virtual com IA*',
                  'Suporte'
                ].map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <svg className="h-5 w-5 text-primary-700 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link to="/register?plan=business" className="mt-6 block">
                <Button className="w-full bg-primary-700 text-white hover:bg-primary-800">
                  Falar com Vendas
                </Button>
              </Link>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Seção CTA */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-600 to-primary-800 animate-gradient-x"></div>
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="a" gradientTransform="rotate(90)">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0,1000 C200,800 350,900 500,750 C650,600 700,800 900,800 L1000,1000 Z" fill="url(#a)" />
            <path d="M0,1000 C150,850 300,950 400,800 C500,650 600,750 800,700 L1000,1000 Z" fill="url(#a)" opacity="0.5" />
          </svg>
        </div>
        <div className="container mx-auto px-4 max-w-6xl text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4 text-white">Pronto para transformar seus agendamentos?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-white/80">
            Junte-se a milhares de empresas que usam o AgendaFácil para otimizar seu processo de agendamento.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-white text-secondary-700 hover:bg-white/90 w-full sm:w-auto">
                Comece seu Teste Gratuito
              </Button>
            </Link>
            <a href="#demo">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 w-full sm:w-auto backdrop-blur-sm">
                Ver Demonstração
              </Button>
            </a>
          </div>
        </div>
      </section>
      
      {/* Adicione isso ao seu CSS global */}
      <style jsx global>{`
        @keyframes animate-gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: animate-gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
