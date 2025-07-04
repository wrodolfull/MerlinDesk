import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, Star, Loader } from 'lucide-react';
import Button from '../components/ui/Button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from '../components/modals/AuthModal';
import toast from 'react-hot-toast';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  stripe_price_id: string;
  features: { [key: string]: string | number | boolean };
}

const formatFeature = (key: string, value: any): { text: string; enabled: boolean } => {
  const labels: { [key: string]: string } = {
    analytics: 'Relatórios e Análises',
    calendars_limit: 'Calendários',
    professionals_limit: 'Profissionais',
    specialties_limit: 'Especialidades',
    appointments_limit: 'Agendamentos/mês',
    whatsapp_limit: 'Lembretes WhatsApp',
    integrations_limit: 'Integrações',
    email_notifications: 'Notificações por Email',
    custom_branding: 'Marca personalizada',
    planner: 'Planner pessoal',
    google_integration: 'Integração com Google Calendar + Google Meet',
    api: 'API',
  };

  const label = labels[key] || key;

  if (value === true || value === -1) {
    if (key === 'appointments_limit') return { text: 'Agendamentos ilimitados', enabled: true };
    if (key === 'calendars_limit') return { text: 'Calendários Ilimitados', enabled: true };
    if (key === 'professionals_limit') return { text: 'Profissionais Ilimitados', enabled: true };
    return { text: label, enabled: true };
  }
  if (value === false || value === 0) return { text: `Sem ${label}`, enabled: false };
  return { text: `${value} ${label}`, enabled: true };
};

const PricingPage: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    
    // Usar planos hardcoded com as informações atualizadas
    const hardcodedPlans: Plan[] = [
      {
        id: 'free',
        name: 'Grátis',
        description: 'Para começar a organizar sua agenda.',
        price: 0,
        stripe_price_id: '',
        features: {
          analytics: true,
          calendars_limit: 1,
          professionals_limit: 1,
          email_notifications: true,
          appointments_limit: 20,
          planner: true
        }
      },
      {
        id: 'essential',
        name: 'Essencial',
        description: 'Para profissionais que buscam mais produtividade.',
        price: 69.90,
        stripe_price_id: 'price_1RcEMUPEA5RHigEI4g0hmaks',
        features: {
          analytics: true,
          calendars_limit: -1, // ilimitado
          professionals_limit: -1, // ilimitado
          custom_branding: true,
          email_notifications: true,
          appointments_limit: 80,
          planner: true,
          google_integration: true,
          api: true
        }
      },
      {
        id: 'pro',
        name: 'PRO',
        description: 'A solução completa com automação total.',
        price: 99.00,
        stripe_price_id: 'price_1RcEUMPEA5RHigEIYdBQsljh',
        features: {
          analytics: true,
          calendars_limit: -1, // ilimitado
          professionals_limit: -1, // ilimitado
          whatsapp_limit: true,
          email_notifications: true,
          appointments_limit: -1, // ilimitado
          planner: true,
          google_integration: true,
          api: true
        }
      }
    ];

    setPlans(hardcodedPlans);
    setLoading(false);
  }, []);

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      setSelectedPlanId(plan.id);
      setShowAuthModal(true);
      return;
    }
    
    if (plan.price === 0) {
      navigate('/dashboard');
      return;
    }

    setIsSubscribing(plan.id);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId: user.id,
          priceId: plan.stripe_price_id,
        },
      });

      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      toast.error(err.data?.error || 'Não foi possível iniciar a assinatura.');
      console.error(err);
    } finally {
      setIsSubscribing(null);
    }
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    const planToSubscribe = plans.find(p => p.id === selectedPlanId);
    if (planToSubscribe) {
      handleSubscribe(planToSubscribe);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader className="animate-spin h-10 w-10 text-[#7C45D0]" />
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 py-12 sm:py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl mb-4">
              Planos transparentes para o seu negócio
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Escolha o plano ideal para sua necessidade, sem surpresas. Cancele quando quiser.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-8 shadow-lg relative flex flex-col h-full ${
                  plan.name === 'Essencial' ? 'border-2 border-[#7C45D0] scale-105' : 'border border-gray-200'
                }`}
              >
                {plan.name === 'Essencial' && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#7C45D0] text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                    <Star size={14} /> Mais Popular
                  </div>
                )}
                
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 h-12">{plan.description}</p>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-extrabold">
                      {plan.price > 0 ? `R$${plan.price.toString().replace('.', ',')}`: 'Grátis'}
                    </span>
                    <span className="text-gray-500 text-lg">{plan.price > 0 ? '/mês' : ''}</span>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {Object.entries(plan.features)
                      .filter(([key, value]) => {
                        // Incluir todas as features relevantes
                        const relevantKeys = [
                          'analytics', 'calendars_limit', 'professionals_limit', 
                          'appointments_limit', 'email_notifications', 'custom_branding',
                          'planner', 'google_integration', 'api', 'whatsapp_limit'
                        ];
                        return relevantKeys.includes(key);
                      })
                      .map(([key, value]) => {
                        const feature = formatFeature(key, value);
                        return (
                          <li key={key} className="flex items-center">
                            {feature.enabled ? <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" /> : <X className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />}
                            <span className="text-gray-700">{feature.text}</span>
                          </li>
                        )
                      })}
                  </ul>
                </div>
                
                <Button 
                  className={`w-full mt-auto ${plan.name === 'Essencial' ? 'bg-[#7C45D0] text-white hover:bg-[#6B3BB8]' : 'bg-gray-800 text-white hover:bg-gray-900'}`}
                  onClick={() => handleSubscribe(plan)}
                  isLoading={isSubscribing === plan.id}
                  disabled={isSubscribing !== null}
                >
                  {isSubscribing === plan.id ? 'Aguarde...' : (plan.price === 0 ? 'Começar Grátis' : 'Assinar Agora')}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default PricingPage;
