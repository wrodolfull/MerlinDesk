import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';
import MultiSelect from '../ui/MultiSelect';
import { supabase } from '../../lib/supabase';
import { Calendar } from '../../types';
import { useAllProfessionals } from '../../hooks/useAllProfessionals';
import { useAllSpecialties } from '../../hooks/useAllSpecialties';
import toast, { Toaster } from 'react-hot-toast';

interface EditCalendarFormData {
  name: string;
  location: string;
}

interface EditCalendarModalProps {
  calendar: Calendar;
  onClose: () => void;
  onSuccess: () => void;
}

const EditCalendarModal: React.FC<EditCalendarModalProps> = ({ calendar, onClose, onSuccess }) => {
  const { professionals, loading: professionalsLoading } = useAllProfessionals();
  const { specialties, loading: specialtiesLoading } = useAllSpecialties();
  
  const [selectedProfessionals, setSelectedProfessionals] = useState<any[]>([]);
  const [selectedSpecialties, setSelectedSpecialties] = useState<any[]>([]);
  const [currentCalendarProfessionals, setCurrentCalendarProfessionals] = useState<any[]>([]);
  const [currentCalendarSpecialties, setCurrentCalendarSpecialties] = useState<any[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EditCalendarFormData>({
    defaultValues: {
      name: calendar.name,
      location: calendar.location_id || '',
    },
  });

  // Carregar profissionais e especialidades atuais do calendário
  useEffect(() => {
    const loadCurrentData = async () => {
      try {
        // Buscar profissionais do calendário
        const { data: calendarProfessionals } = await supabase
          .from('professionals')
          .select('*')
          .eq('calendar_id', calendar.id);

        if (calendarProfessionals) {
          setCurrentCalendarProfessionals(calendarProfessionals);
        }

        // Buscar especialidades do calendário
        const { data: calendarSpecialties } = await supabase
          .from('specialties')
          .select('*')
          .eq('calendar_id', calendar.id);

        if (calendarSpecialties) {
          setCurrentCalendarSpecialties(calendarSpecialties);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do calendário:', error);
      }
    };

    loadCurrentData();
  }, [calendar.id]);

  React.useEffect(() => {
    reset({
      name: calendar.name,
      location: calendar.location_id || '',
    });
  }, [calendar, reset]);

  const onSubmit = async (data: EditCalendarFormData) => {
    try {
      // Atualizar dados básicos do calendário
      const { error } = await supabase
        .from('calendars')
        .update({
          name: data.name,
          location_id: data.location,
        })
        .eq('id', calendar.id);

      if (error) throw error;

      // Atualizar profissionais do calendário
      if (selectedProfessionals.length > 0) {
        // Remover profissionais do calendário atual
        const { error: removeError } = await supabase
          .from('professionals')
          .update({ calendar_id: null })
          .eq('calendar_id', calendar.id);

        if (removeError) {
          console.warn('Erro ao remover profissionais do calendário:', removeError);
        }

        // Adicionar novos profissionais selecionados
        for (const professional of selectedProfessionals) {
          const { error: updateError } = await supabase
            .from('professionals')
            .update({ calendar_id: calendar.id })
            .eq('id', professional.id);

          if (updateError) {
            console.warn('Erro ao atualizar profissional:', updateError);
          }
        }
      }

      // Atualizar especialidades do calendário
      if (selectedSpecialties.length > 0) {
        // Remover especialidades do calendário atual
        const { error: removeError } = await supabase
          .from('specialties')
          .update({ calendar_id: null })
          .eq('calendar_id', calendar.id);

        if (removeError) {
          console.warn('Erro ao remover especialidades do calendário:', removeError);
        }

        // Adicionar novas especialidades selecionadas
        for (const specialty of selectedSpecialties) {
          const { error: updateError } = await supabase
            .from('specialties')
            .update({ calendar_id: calendar.id })
            .eq('id', specialty.id);

          if (updateError) {
            console.warn('Erro ao atualizar especialidade:', updateError);
          }
        }
      }

      toast.success('Calendário atualizado com sucesso!');
      onSuccess();
      onClose();
    } catch (error: any) {
      const message = error.message || 'Failed to update calendar';
      toast.error(message);
      console.error('Error updating calendar:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Editar Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome do Calendário"
              error={errors.name?.message}
              {...register('name', { required: 'Nome do calendário é obrigatório' })}
              disabled={isSubmitting}
            />
            
            <Input
              label="Local"
              error={errors.location?.message}
              {...register('location', { required: 'Local é obrigatório' })}
              disabled={isSubmitting}
            />

            <MultiSelect
              label="Profissionais (opcional)"
              options={professionals.filter(p => !p.calendarId || p.calendarId === calendar.id)}
              selectedOptions={selectedProfessionals}
              onSelectionChange={setSelectedProfessionals}
              placeholder="Selecione profissionais para adicionar ao calendário"
              disabled={isSubmitting || professionalsLoading}
            />

            <MultiSelect
              label="Especialidades (opcional)"
              options={specialties.filter(s => !s.calendarId || s.calendarId === calendar.id)}
              selectedOptions={selectedSpecialties}
              onSelectionChange={setSelectedSpecialties}
              placeholder="Selecione especialidades para adicionar ao calendário"
              disabled={isSubmitting || specialtiesLoading}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                Salvar Alterações
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditCalendarModal;
