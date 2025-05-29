// src/hooks/usePlanLimits.ts

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface PlanLimits {
  analytics: boolean;
  calendars: number;
  professionals: number;
  custom_branding: boolean;
  sms_notifications: boolean;
  email_notifications: boolean;
  appointments_per_month: number;
}

export const usePlanLimits = () => {
  const { user } = useAuth();
  const [limits, setLimits] = useState<PlanLimits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchLimits = async () => {
      const { data, error } = await supabase
        .from('user_plan_limits')
        .select('limits')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        setError(error.message);
      } else {
        setLimits(data?.limits || null);
      }
      setLoading(false);
    };

    fetchLimits();
  }, [user]);

  return { limits, loading, error };
};
