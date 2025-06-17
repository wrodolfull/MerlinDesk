import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import AuthModal from '../components/modals/AuthModal';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  priceText: string;
  period: string;
  features: string[];
  buttonText: string;
  popular: boolean;
}

interface User {
  id: string;
  email?: string;
}

const PricingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const navigate = useNavigate();

  const plans: Plan[] = [
    {
      id: 'gratis',
      name: 'Grátis',
      description: 'Perfeito para gerenciamento pessoal',
      price: 0,
      priceText: 'Grátis',
      period: ' para sempre',
      features: [
        '1 calendário',
        '1 profissional',
        '20 agendamentos por mês',
        'Página de agendamento básica'
      ],
      buttonText: 'Começar grátis',
      popular: false,
    },
    {
      id: 'empresa',
      name: 'Empresa',
      description: 'Para negócios em crescimento',
      price: 79.9,
      priceText: 'R$79,90',
      period: '/mês',
      features: [
        'Calendários ilimitados',
        'Profissionais ilimitados',
        'Agendamentos ilimitados',
        'Analytics avançado',
        'Notificações por email',
        'Relatórios detalhados',
        'Integração com Google',
        'Suporte prioritário'
      ],
      buttonText: 'Assine agora',
      popular: true,
    },
  ];

  const handlePlanClick = async (plan: Plan): Promise<void> => {
    if (plan.price === 0) {
      // Plano gratuito - redirecionar para registro
      navigate('/register');
      return;
    }

    // Verificar se o usuário está logado
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (!user || error) {
      // Usuário não logado - mostrar modal de autenticação
      setSelectedPlan(plan);
      setShowAuthModal(true);
      return;
    }

    // Usuário logado - prosseguir com o pagamento
    await handlePayment(user, plan);
  };

  const handlePayment = async (user: User, plan: Plan): Promise<void> => {
    try {
      console.log('Iniciando processo de pagamento para:', plan.name);
      
      const requestData = {
        user_id: user.id,
        email: user.email,
      };

      const response = await fetch('https://merlindesk.com/mercado-pago/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Erro: URL de checkout não encontrada');
      }
      
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      alert('Erro ao processar pagamento. Tente novamente.');
    }
  };

  const handleAuthSuccess = async (user: User): Promise<void> => {
    setShowAuthModal(false);
    if (selectedPlan) {
      await handlePayment(user, selectedPlan);
      setSelectedPlan(null);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Escolha o plano perfeito para sua equipe
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comece com nosso plano gratuito ou escolha o plano empresa para recursos avançados.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
            {plans.map((plan: Plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg p-8 relative ${
                  plan.popular
                    ? 'border-2 border-[#7C45D0]'
                    : 'border border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-[#7C45D0] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Mais popular
                    </span>
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-3xl font-bold">{plan.priceText}</span>
                  <span className="text-gray-500">{plan.period}</span>
                </div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature: string, i: number) => (
                    <li key={i} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className="w-full bg-[#7C45D0] text-white hover:bg-[#6B3BB8]"
                  onClick={() => handlePlanClick(plan)}
                >
                  {plan.buttonText}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal de Autenticação */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          setSelectedPlan(null);
        }}
        onSuccess={handleAuthSuccess}
        selectedPlan={selectedPlan}
      />
    </>
  );
};

export default PricingPage;
