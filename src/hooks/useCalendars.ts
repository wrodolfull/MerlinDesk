import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Calendar } from '../types';

export function useCalendars() {
  const { user } = useAuth();
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendars = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (!user?.id) {
        setCalendars([]);
        return;
      }

      const { data, error } = await supabase
        .from('calendars')
        .select('*')
        .or(`owner_id.eq.${user.id},user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCalendars = (data || []).map(calendar => ({
        id: calendar.id,
        name: calendar.name,
        locationId: calendar.location_id,
        ownerId: calendar.owner_id,
        userId: calendar.user_id,
        createdAt: new Date(calendar.created_at),
        hasRecurringSubscription: calendar.has_recurring_subscription || false,
      }));

      setCalendars(formattedCalendars);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendars');
      console.error('Calendar fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCalendars();
  }, [fetchCalendars]);

  return {
    calendars,
    loading,
    error,
    refetch: fetchCalendars,
  };
}