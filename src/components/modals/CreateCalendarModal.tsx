import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import toast, { Toaster } from 'react-hot-toast';

interface CreateCalendarFormData {
  name: string;
  location: string;
}

interface CreateCalendarModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const CreateCalendarModal: React.FC<CreateCalendarModalProps> = ({ onClose, onSuccess }) => {
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCalendarFormData>();

  const onSubmit = async (data: CreateCalendarFormData) => {
  try {
    if (!user) throw new Error('User not authenticated');

    // ✅ Buscar limites do usuário
    let { data: limitsData, error: limitsError } = await supabase
      .from('user_plan_limits')
      .select('limits')
      .eq('user_id', user.id)
      .maybeSingle();

    if (limitsError) throw limitsError;

    // ✅ Se não encontrar o usuário, buscar o plano atual e criar registro
    if (!limitsData) {
      console.log('Usuário não encontrado em user_plan_limits, criando registro...');
      
      // Buscar plano atual do usuário
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select(`
          current_plan_id,
          current_plan:subscription_plans!current_plan_id(name, features)
        `)
        .eq('user_id', user.id)
        .single();

      let planName = 'Grátis';
      let planLimits = {
        calendars: 1,
        professionals: 1,
        appointments_per_month: 20
      };

      // Se tem assinatura ativa, usar dados do plano atual
      if (subscriptionData?.current_plan) {
        planName = subscriptionData.current_plan.name;
        planLimits = subscriptionData.current_plan.features || planLimits;
      }

      // Criar registro na tabela user_plan_limits
      const { data: newLimitsData, error: insertError } = await supabase
        .from('user_plan_limits')
        .insert({
          user_id: user.id,
          plan_name: planName,
          limits: planLimits,
          status: 'active'
        })
        .select('limits')
        .single();

      if (insertError) {
        console.error('Erro ao criar registro user_plan_limits:', insertError);
        throw new Error('Erro ao configurar plano do usuário.');
      }

      limitsData = newLimitsData;
      console.log('✅ Registro criado automaticamente em user_plan_limits');
    }

    if (!limitsData) {
      throw new Error('Plano não encontrado para este usuário.');
    }

    const calendarLimit = limitsData?.limits?.calendars;

    const { count: currentCalendars, error: countError } = await supabase
      .from('calendars')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id);

    if (countError) throw countError;

    if (currentCalendars === null) {
      throw new Error('Não foi possível obter a quantidade de calendários existentes.');
    }

    if (calendarLimit !== -1 && currentCalendars >= calendarLimit) {
      toast.error('Você atingiu o limite de calendários do seu plano.');
      return;
    }

    const { error: calendarError } = await supabase
      .from('calendars')
      .insert({
        name: data.name,
        location_id: data.location,
        owner_id: user.id,
      });

    if (calendarError) throw calendarError;

    toast.success('Calendário criado com sucesso');
    reset();
    onSuccess();
    onClose();
  } catch (error: any) {
    toast.error(error.message || 'Erro ao criar calendário.');
    console.error('Erro ao criar calendário:', error);
  }
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Criar calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome do calendário"
              error={errors.name?.message}
              {...register('name', { required: 'Calendar name is required' })}
              disabled={isSubmitting}
            />

            <Input
              label="Local"
              error={errors.location?.message}
              {...register('location', { required: 'Location is required' })}
              disabled={isSubmitting}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
                Criar Calendário
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateCalendarModal;
