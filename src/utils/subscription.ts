// utils/subscription.ts
import { supabase } from '../lib/supabase';

export const getUserCurrentPlan = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      status,
      current_plan_id,
      current_plan:subscription_plans!current_plan_id(id, name, features)
    `)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    // Se não tem assinatura, retorna plano gratuito por padrão
    return {
      planName: 'Grátis',
      planId: '5d14538d-9f51-41ba-a686-12c6b27af642',
      features: {
        calendars: 1,
        professionals: 1,
        appointments_per_month: 50
      },
      status: 'free'
    };
  }

  return {
    planName: data.current_plan?.name || 'Grátis',
    planId: data.current_plan_id,
    features: data.current_plan?.features || {},
    status: data.status
  };
};

export const hasFeatureAccess = async (userId: string, feature: string) => {
  const userPlan = await getUserCurrentPlan(userId);
  const featureValue = userPlan.features[feature];
  
  // -1 significa ilimitado, qualquer número positivo é o limite
  return featureValue === -1 || (typeof featureValue === 'number' && featureValue > 0);
};

export const getFeatureLimit = async (userId: string, feature: string) => {
  const userPlan = await getUserCurrentPlan(userId);
  return userPlan.features[feature] || 0;
};
