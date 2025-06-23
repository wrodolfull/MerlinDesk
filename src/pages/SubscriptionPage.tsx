import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Check, CreditCard, AlertCircle, Loader2, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface SubscriptionData {
  id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    features: Record<string, any>;
  };
  mercado_pago_plan_id?: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: Record<string, any>;
  popular?: boolean;
  stripe_price_id?: string;
}

const SubscriptionPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // Buscar assinatura atual
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select(`
            *,
            plan:subscription_plans!plan_id(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        // Se não há assinatura (PGRST116 = no rows returned), não é um erro
        if (subscriptionError && subscriptionError.code !== 'PGRST116') {
          console.error('Erro na query de assinatura:', subscriptionError);
          throw subscriptionError;
        }

        // Se não há assinatura, subscriptionData será null
        setSubscription(subscriptionData || null);
        
        // Log para debug
        console.log('Dados da assinatura carregados:', {
          subscriptionData,
          hasSubscription: !!subscriptionData,
          status: subscriptionData?.status,
          planName: subscriptionData?.plan?.name,
          planId: subscriptionData?.plan?.id
        });

        // Buscar planos disponíveis
        const { data: plansData, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price', { ascending: true });

        if (plansError) {
          console.error('Erro ao buscar planos:', plansError);
          throw plansError;
        }

        // Marcar o plano atual como popular se for o Business
        const plansWithPopular = plansData.map(plan => ({
          ...plan,
          popular: plan.name === 'Essencial'
        }));

        setAvailablePlans(plansWithPopular);
      } catch (err: any) {
        console.error('Erro ao buscar dados:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const isCurrentPlan = (plan: Plan) => {
    // Se o usuário não tem assinatura ativa, o plano gratuito é o atual
    if (!subscription || subscription.status !== 'active') {
      const isFree = plan.name === 'Grátis';
      console.log(`Plano ${plan.name} é atual (sem assinatura ativa): ${isFree}`);
      return isFree;
    }
    // Se tem assinatura ativa, compara com o plano da assinatura
    const isCurrent = subscription.plan?.id === plan.id;
    console.log(`Plano ${plan.name} é atual (com assinatura): ${isCurrent}`, {
      planId: plan.id,
      subscriptionPlanId: subscription.plan?.id,
      subscriptionPlanName: subscription.plan?.name
    });
    return isCurrent;
  };

  const getCurrentPlanName = () => {
    if (!subscription || subscription.status !== 'active') {
      return 'Grátis';
    }
    return subscription.plan?.name || 'Grátis';
  };

  const shouldShowCancelButton = () => {
    const shouldShow = subscription && subscription.status === 'active' && subscription.plan?.name !== 'Grátis';
    console.log('Deve mostrar botão de cancelar:', shouldShow, {
      hasSubscription: !!subscription,
      status: subscription?.status,
      planName: subscription?.plan?.name
    });
    return shouldShow;
  };

  const handleUpgrade = async (plan: Plan) => {
    if (!user) {
      toast.error('Você precisa estar logado para fazer upgrade');
      return;
    }

    // Se o usuário já está no plano gratuito e clicou no gratuito, não fazer nada
    if (plan.price === 0 && getCurrentPlanName() === 'Grátis') {
      toast.success('Você já está no plano gratuito');
      return;
    }

    // Se o usuário já está no plano Essencial e clicou no Essencial, não fazer nada
    if (plan.name === 'Essencial' && getCurrentPlanName() === 'Essencial') {
      toast.success('Você já está no plano Essencial');
      return;
    }

    try {
      setUpgrading(true);
      console.log('Iniciando upgrade para plano:', plan.name);
      
      // Usar Stripe em vez de Mercado Pago
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          userId: user.id,
          priceId: plan.stripe_price_id,
        },
      });

      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Erro: URL de checkout não encontrada');
      }
      
    } catch (err: any) {
      console.error('Erro ao processar upgrade:', err);
      toast.error('Erro ao processar upgrade. Tente novamente.');
    } finally {
      setUpgrading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!subscription) return;

    try {
      setCanceling(true);

      // 1. Cancelar no Mercado Pago
      if (subscription.mercado_pago_plan_id) {
        const response = await fetch('/api/mercado-pago/assinatura/cancelar', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription_id: subscription.id,
            mercado_pago_plan_id: subscription.mercado_pago_plan_id
          }),
        });

        if (!response.ok) {
          throw new Error('Erro ao cancelar assinatura no Mercado Pago');
        }
      }

      // 2. Buscar ID do plano gratuito
      const { data: freePlan, error: freePlanError } = await supabase
        .from('subscription_plans')
        .select('id')
        .eq('name', 'Grátis')
        .single();

      if (freePlanError) throw freePlanError;

      // 3. Atualizar no Supabase
      const { error: updateError } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'canceled',
          plan_id: freePlan.id,
          current_plan_id: freePlan.id
        })
        .eq('id', subscription.id);

      if (updateError) throw updateError;

      toast.success('Assinatura cancelada com sucesso');
      setSubscription(prev => prev ? { 
        ...prev, 
        status: 'canceled',
        plan: {
          ...prev.plan,
          id: freePlan.id,
          name: 'Grátis',
          price: 0,
          features: {
            calendars: 1,
            professionals: 1,
            appointments_per_month: 50,
            analytics: false,
            custom_branding: false,
            email_notifications: true,
            sms_notifications: false
          }
        }
      } : null);
      setShowCancelDialog(false);
    } catch (err: any) {
      console.error('Erro ao cancelar assinatura:', err);
      toast.error(err.message || 'Erro ao cancelar assinatura');
    } finally {
      setCanceling(false);
    }
  };

  const formatFeatureLabel = (key: string, value: any): string => {
    const labels: Record<string, string> = {
      analytics: 'Relatórios e Análises',
      calendars: 'Calendários',
      professionals: 'Profissionais',
      custom_branding: 'Marca personalizada',
      sms_notifications: 'Notificações por SMS',
      email_notifications: 'Notificações por Email',
      appointments_per_month: 'Agendamentos por mês',
    };

    if (typeof value === 'boolean') {
      return value ? `${labels[key]} habilitado` : `${labels[key]} desabilitado`;
    }

    if (value === -1) {
      return `${labels[key]} ilimitados`;
    }

    return `${value} ${labels[key]}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Gerenciar Assinatura</h1>

      {error ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center text-red-600">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Erro ao carregar assinatura: {error}</span>
            </div>
          </CardContent>
        </Card>
      ) : subscription && subscription.status === 'active' && subscription.plan ? (
        // Usuário tem assinatura ativa
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Plano Atual</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Plano {subscription.plan.name}</h3>
                  <p className="text-gray-600">{subscription.plan.description}</p>
                  <p className="text-primary-600 font-medium mt-1">
                    {formatCurrency(subscription.plan.price)}/mês
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-primary-600" />
              </div>

              <div className="space-y-3 mb-6">
                {Object.entries(subscription.plan.features || {}).map(([key, value]) => (
                  <div key={key} className="flex items-center text-gray-700">
                    <Check className="h-5 w-5 text-primary-500 mr-3" />
                    <span>{formatFeatureLabel(key, value)}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600">Início do período</p>
                  <p className="font-medium">{formatDate(subscription.current_period_start)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fim do período</p>
                  <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={() => navigate('/pricing')} variant="outline">
                  Ver Outros Planos
                </Button>
                {shouldShowCancelButton() && (
                  <Button 
                    onClick={() => setShowCancelDialog(true)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Cancelar Assinatura
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Em breve você poderá ver seu histórico de pagamentos aqui.
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        // Usuário não tem assinatura ativa ou tem assinatura cancelada
        <div className="space-y-6">
          {subscription && subscription.status === 'canceled' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <AlertCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Sua assinatura foi cancelada
                  </h3>
                  <p className="text-gray-600">
                    Você ainda tem acesso ao plano atual até o fim do período. 
                    Reative sua assinatura para continuar aproveitando todos os recursos.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <div>
            <h2 className="text-xl font-semibold mb-4">Escolha o Plano Ideal para Você</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availablePlans && availablePlans.length > 0 ? (
                availablePlans.map((plan) => (
                  <Card 
                    key={plan.id} 
                    className={`relative ${plan.popular ? 'border-2 border-primary-500' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center">
                          <Star className="w-3 h-3 mr-1" />
                          Mais Popular
                        </span>
                      </div>
                    )}
                    
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {plan.name}
                        {isCurrentPlan(plan) && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                            Plano Atual
                          </span>
                        )}
                      </CardTitle>
                      <div className="flex items-baseline">
                        <span className="text-3xl font-bold">
                          {plan.price === 0 ? 'Grátis' : formatCurrency(plan.price)}
                        </span>
                        {plan.price > 0 && <span className="text-gray-500 ml-1">/mês</span>}
                      </div>
                      <p className="text-gray-600">{plan.description}</p>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-3 mb-6">
                        {Object.entries(plan.features || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center text-gray-700">
                            <Check className="h-5 w-5 text-primary-500 mr-3 flex-shrink-0" />
                            <span className="text-sm">{formatFeatureLabel(key, value)}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        className={`w-full ${plan.popular ? 'bg-primary-500 hover:bg-primary-600' : ''}`}
                        variant={plan.popular ? 'primary' : 'outline'}
                        onClick={() => handleUpgrade(plan)}
                        disabled={upgrading || isCurrentPlan(plan) || plan.price === 0}
                      >
                        {upgrading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : isCurrentPlan(plan) ? (
                          'Plano Atual'
                        ) : plan.price === 0 ? (
                          'Plano Gratuito'
                        ) : (
                          'Escolher Plano'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
                  <p className="text-gray-600">Carregando planos disponíveis...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmação de cancelamento */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancelar Assinatura</h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso ao plano atual até o fim do período atual.
            </p>
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={() => setShowCancelDialog(false)}
                disabled={canceling}
              >
                Não, manter assinatura
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancelSubscription}
                disabled={canceling}
              >
                {canceling ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Cancelando...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-2" />
                    Sim, cancelar assinatura
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage; 