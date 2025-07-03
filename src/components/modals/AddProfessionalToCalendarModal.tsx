import React, { useState, useEffect } from 'react';
import { useAllProfessionals } from '../../hooks/useAllProfessionals';
import Button from '../ui/Button';
import MultiSelect from '../ui/MultiSelect';
import toast from 'react-hot-toast';
import QuickCreateProfessionalModal from './QuickCreateProfessionalModal';

interface AddProfessionalToCalendarModalProps {
  calendarId: string;
  onClose: () => void;
}

const AddProfessionalToCalendarModal: React.FC<AddProfessionalToCalendarModalProps> = ({ calendarId, onClose }) => {
  const { professionals, loading: professionalsLoading, refetch } = useAllProfessionals();
  const [selectedProfessionals, setSelectedProfessionals] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkedProfessionals, setLinkedProfessionals] = useState<any[]>([]);
  const [showCreateProfessional, setShowCreateProfessional] = useState(false);

  // Buscar profissionais já vinculados ao calendário
  useEffect(() => {
    if (!professionals) return;
    setLinkedProfessionals(professionals.filter(p => p.calendarIds.includes(calendarId)));
  }, [professionals, calendarId]);

  const handleAddProfessionals = async () => {
    if (selectedProfessionals.length === 0) {
      toast.error('Selecione pelo menos um profissional');
      return;
    }
    setIsSubmitting(true);
    try {
      const relations = selectedProfessionals.map(professional => ({
        professional_id: professional.id,
        calendar_id: calendarId
      }));
      const { error: relError } = await window.supabase
        .from('professional_calendars')
        .upsert(relations, { onConflict: ['professional_id', 'calendar_id'] });
      if (relError) throw relError;
      toast.success('Profissional(is) adicionado(s) ao calendário!');
      setSelectedProfessionals([]);
      refetch();
    } catch (err: any) {
      toast.error('Erro ao adicionar profissional');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg relative">
        <button className="absolute top-2 right-2 text-gray-500 hover:text-gray-700" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-semibold mb-4">Adicionar profissional ao calendário</h2>
        <div className="mb-4">
          <MultiSelect
            label="Profissionais"
            options={professionals}
            selectedOptions={selectedProfessionals}
            onSelectionChange={setSelectedProfessionals}
            placeholder={professionalsLoading ? 'Carregando profissionais...' : 'Selecione profissionais'}
            disabled={professionalsLoading || isSubmitting}
          />
          <Button type="button" variant="outline" className="mt-2 w-full" onClick={() => setShowCreateProfessional(true)}>
            + Criar novo profissional
          </Button>
          {showCreateProfessional && (
            <QuickCreateProfessionalModal
              onClose={() => setShowCreateProfessional(false)}
              onSuccess={() => { setShowCreateProfessional(false); refetch(); }}
            />
          )}
        </div>
        <Button onClick={handleAddProfessionals} isLoading={isSubmitting} disabled={isSubmitting || selectedProfessionals.length === 0} className="w-full mb-4">
          Adicionar ao calendário
        </Button>
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Profissionais já vinculados</h3>
          {linkedProfessionals.length === 0 ? (
            <div className="text-gray-500">Nenhum profissional vinculado ainda.</div>
          ) : (
            <ul className="space-y-2">
              {linkedProfessionals.map((pro: any) => (
                <li key={pro.id} className="border rounded p-2 flex flex-col">
                  <span className="font-medium">{pro.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Modal de criar profissional pode ser implementado aqui futuramente */}
      </div>
    </div>
  );
};

export default AddProfessionalToCalendarModal; 