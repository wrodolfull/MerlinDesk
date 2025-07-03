import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
import { Calendar, Lock, Unlock } from 'lucide-react';

interface CloseCalendarModalProps {
  professionalId: string;
  professionalName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const CloseCalendarModal: React.FC<CloseCalendarModalProps> = ({
  professionalId,
  professionalName,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isCalendarActive, setIsCalendarActive] = useState(true);

  useEffect(() => {
    const fetchProfessionalStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('professionals')
          .select('is_active')
          .eq('id', professionalId)
          .single();

        if (error) throw error;

        setIsCalendarActive(data?.is_active ?? true);
      } catch (error) {
        console.error('Erro ao carregar status do profissional:', error);
        setIsCalendarActive(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessionalStatus();
  }, [professionalId]);

  const handleToggleCalendar = async () => {
    setSaving(true);
    try {
      const newStatus = !isCalendarActive;
      
      const { error } = await supabase
        .from('professionals')
        .update({ is_active: newStatus })
        .eq('id', professionalId);

      if (error) throw error;

      setIsCalendarActive(newStatus);
      toast.success(
        newStatus 
          ? 'Agenda aberta com sucesso!' 
          : 'Agenda fechada com sucesso!'
      );
      onSuccess();
    } catch (error) {
      console.error('Erro ao atualizar status da agenda:', error);
      toast.error('Erro ao atualizar status da agenda');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Carregando status da agenda...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Toaster />
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {isCalendarActive ? 'Fechar Agenda' : 'Abrir Agenda'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="mb-4">
              {isCalendarActive ? (
                <Unlock className="h-16 w-16 text-green-500 mx-auto mb-2" />
              ) : (
                <Lock className="h-16 w-16 text-red-500 mx-auto mb-2" />
              )}
            </div>
            
            <p className="text-gray-600 mb-4">
              {isCalendarActive ? (
                <>
                  A agenda de <strong>{professionalName}</strong> está atualmente <strong>aberta</strong>.
                  <br />
                  Os clientes podem fazer agendamentos normalmente.
                </>
              ) : (
                <>
                  A agenda de <strong>{professionalName}</strong> está atualmente <strong>fechada</strong>.
                  <br />
                  Os clientes não conseguirão fazer novos agendamentos.
                </>
              )}
            </p>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Status atual:</strong> {isCalendarActive ? 'Aberta' : 'Fechada'}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleToggleCalendar}
              disabled={saving}
              className="flex-1"
              variant={isCalendarActive ? "destructive" : "primary"}
            >
              {saving ? (
                'Salvando...'
              ) : (
                <>
                  {isCalendarActive ? (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Fechar Agenda
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4 mr-2" />
                      Abrir Agenda
                    </>
                  )}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CloseCalendarModal; 