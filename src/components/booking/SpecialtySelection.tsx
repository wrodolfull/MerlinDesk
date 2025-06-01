import React, { useState } from 'react';
import { Specialty } from '../../types';
import { Clock, DollarSign } from 'lucide-react';

interface SpecialtySelectionProps {
  specialties: Specialty[];
  onSelect: (specialty: Specialty) => void;
}

export const SpecialtySelection = ({ specialties, onSelect }: SpecialtySelectionProps) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (specialty: Specialty) => {
    setSelectedId(specialty.id);
    onSelect(specialty);
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Agendar uma consulta</h2>
      <p className="text-gray-600 mb-8 text-base">
        Escolha um horário que funcione melhor para você.
      </p>

      <div className="space-y-4 max-w-xl">
        {specialties.map((specialty) => {
          const isSelected = specialty.id === selectedId;
          return (
            <div
              key={specialty.id}
              onClick={() => handleSelect(specialty)}
              className={`p-5 border rounded-lg cursor-pointer transition-all group ${
                isSelected
                  ? 'border-[#6D3FC4] bg-[#F6F0FD]'
                  : 'border-gray-200 hover:border-[#6D3FC4]'
              }`}
            >
              <div className="flex items-center mb-1 text-[#6D3FC4] font-medium text-sm">
                <Clock className="w-4 h-4 mr-2" />
                {specialty.name}
              </div>

              <p className="text-gray-600 text-sm mb-1">
                {specialty.description || 'Descrição não informada.'}
              </p>

              <div className="text-sm text-gray-500 flex items-center">
                <DollarSign className="w-4 h-4 mr-1" />
                {specialty.price ? `R$ ${specialty.price}` : 'Gratuito'}
                <span className="ml-4 flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {specialty.duration} min
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
 