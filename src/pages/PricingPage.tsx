import React from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import Button from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { supabase } from '../lib/supabase';

const PricingPage = () => {
  const plans = [
    {
      name: 'Free',
      description: 'Perfect for personal use',
      price: 0,
      features: [
        '1 calendar',
        '1 professional',
        '50 appointments per month',
        'Basic email notifications',
        'Standard support',
      ],
      limitations: [
        'No analytics',
        'No custom branding',
        'No SMS notifications',
      ],
    },
    {
      name: 'Business',
      description: 'For growing businesses',
      price: 29.99,
      features: [
        'Unlimited calendars',
        'Unlimited professionals',
        'Unlimited appointments',
        'Advanced analytics',
        'Custom branding',
        'Email & SMS notifications',
        'Priority support',
        'API access',
      ],
      popular: true,
    },
  ];

  // 🔍 Versão de debug para investigar o problema
  const handlePaidPlanClick = async () => {
    console.log('=== DEBUG: Iniciando handlePaidPlanClick ===');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log('Usuário:', user?.id, user?.email);
    
    if (!user || error) {
      console.log('Erro de autenticação:', error);
      alert('Você precisa estar logado para assinar o plano.');
      return;
    }

    const requestData = {
      user_id: user.id,
      email: user.email,
    };
    console.log('Dados da requisição:', requestData);

    try {
      console.log('Fazendo requisição para: https://merlindesk.com/mercado-pago/criar');
      
      const response = await fetch('https://merlindesk.com/mercado-pago/criar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestData),
      });

      console.log('Status:', response.status);
      console.log('Headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('Resposta bruta:', responseText);
      
      if (!response.ok) {
        console.error('Erro HTTP:', response.status, response.statusText);
        alert(`Erro ${response.status}: ${response.statusText}`);
        return;
      }

      // Tentar fazer parse do JSON
      const data = JSON.parse(responseText);
      console.log('Dados parseados:', data);
      
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        alert('Erro: checkout_url não encontrada');
      }
      
    } catch (err) {
      console.error('Erro completo:', err);
      alert('Erro detalhado no console');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.popular
                  ? 'border-2 border-primary-500 shadow-xl'
                  : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 -translate-y-1/2 px-3 py-1 bg-primary-500 text-white text-sm font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <CardHeader className="text-center pb-8 pt-6">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-gray-600 mt-2">{plan.description}</p>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    ${plan.price}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">/month</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-center text-gray-700">
                      <Check className="h-5 w-5 text-primary-500 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {plan.limitations && (
                    <div className="pt-4 mt-4 border-t border-gray-200">
                      {plan.limitations.map((limitation) => (
                        <div key={limitation} className="flex items-center text-gray-500 py-1">
                          <span className="h-5 w-5 mr-3 flex-shrink-0">✕</span>
                          <span>{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  {plan.price === 0 ? (
                    <Link to="/register">
                      <Button className="w-full bg-gray-800 hover:bg-gray-900">
                        Get Started
                      </Button>
                    </Link>
                  ) : (
                    <Button className="w-full" onClick={handlePaidPlanClick}>
                      Assinar plano Business
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
