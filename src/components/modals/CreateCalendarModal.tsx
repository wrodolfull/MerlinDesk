import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import MultiSelect from '../ui/MultiSelect';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useAllProfessionals } from '../../hooks/useAllProfessionals';
import { useAllSpecialties } from '../../hooks/useAllSpecialties';
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
  const { professionals, loading: professionalsLoading } = useAllProfessionals();
  const { specialties, loading: specialtiesLoading } = useAllSpecialties();
  
  const [selectedProfessionals, setSelectedProfessionals] = useState<any[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateCalendarFormData>();

  // Logs para debug
  useEffect(() => {
    console.log('🔍 CreateCalendarModal: Profissionais carregados:', professionals);
    console.log('🔍 CreateCalendarModal: Especialidades carregadas:', specialties);
    console.log('🔍 CreateCalendarModal: Profissionais sem calendário:', professionals.filter(p => !p.calendarId));
    console.log('🔍 CreateCalendarModal: Especialidades sem calendário:', specialties.filter(s => !s.calendarId));
  }, [professionals, specialties]);

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

        if (insertError) throw insertError;
        limitsData = newLimitsData;
      }

      // ✅ Verificar limite de calendários
      const currentCalendars = await supabase
        .from('calendars')
        .select('id')
        .eq('owner_id', user.id);

      if (currentCalendars.error) throw currentCalendars.error;

      const calendarLimit = limitsData.limits.calendars || 1;
      
      // ✅ Verificar se o limite não é ilimitado (-1) e se foi atingido
      if (calendarLimit !== -1 && currentCalendars.data.length >= calendarLimit) {
        throw new Error(`Você atingiu o limite de ${calendarLimit} calendário(s) do seu plano atual. Faça um upgrade para criar mais calendários.`);
      }

      // ✅ Criar o calendário
      const { data: newCalendar, error: createError } = await supabase
        .from('calendars')
        .insert({
          name: data.name,
          location_id: data.location,
          owner_id: user.id,
        })
        .select()
        .single();

      if (createError) throw createError;

      // ✅ Associar profissionais selecionados ao novo calendário
      if (selectedProfessionals.length > 0) {
        const professionalUpdates = selectedProfessionals.map(professional => ({
          id: professional.id,
          calendar_id: newCalendar.id
        }));

        for (const update of professionalUpdates) {
          const { error: updateError } = await supabase
            .from('professionals')
            .update({ calendar_id: update.calendar_id })
            .eq('id', update.id);

          if (updateError) {
            console.warn('Erro ao atualizar profissional:', updateError);
          }
        }
      }

      // ✅ Associar especialidades selecionadas ao novo calendário
      if (selectedSpecialties.length > 0) {
        const specialtyUpdates = selectedSpecialties.map(specialty => ({
          id: specialty.id,
          calendar_id: newCalendar.id
        }));

        for (const update of specialtyUpdates) {
          const { error: updateError } = await supabase
            .from('specialties')
            .update({ calendar_id: update.calendar_id })
            .eq('id', update.id);

          if (updateError) {
            console.warn('Erro ao atualizar especialidade:', updateError);
          }
        }
      }

      toast.success('Calendário criado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.message || 'Failed to create calendar';
      toast.error(message);
      console.error('Error creating calendar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Criar calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome do calendário"
              error={errors.name?.message}
              {...register('name', { required: 'Nome do calendário é obrigatório' })}
              disabled={isSubmitting}
              placeholder="Ex: Consultório Dr. Silva"
            />

            <Input
              label="Local"
              error={errors.location?.message}
              {...register('location', { required: 'Local é obrigatório' })}
              disabled={isSubmitting}
              placeholder="Ex: Rua das Flores, 123 - Centro"
            />

            <MultiSelect
              label="Profissionais (opcional)"
              options={professionals.filter(p => !p.calendarId || p.calendarId === null || p.calendarId === '')}
              selectedOptions={selectedProfessionals}
              onSelectionChange={setSelectedProfessionals}
              placeholder="Selecione profissionais para adicionar ao calendário"
              disabled={isSubmitting || professionalsLoading}
            />

            <MultiSelect
              label="Especialidades (opcional)"
              options={specialties.filter(s => !s.calendarId || s.calendarId === null || s.calendarId === '')}
              selectedOptions={selectedSpecialties}
              onSelectionChange={setSelectedSpecialties}
              placeholder="Selecione especialidades para adicionar ao calendário"
              disabled={isSubmitting || specialtiesLoading}
            />

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="w-full sm:w-auto order-2 sm:order-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                isLoading={isSubmitting} 
                disabled={isSubmitting}
                className="w-full sm:w-auto order-1 sm:order-2"
              >
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