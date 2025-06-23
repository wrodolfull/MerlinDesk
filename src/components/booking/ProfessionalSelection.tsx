import React from 'react';
import { Professional, Specialty } from '../../types';
import { Card, CardContent } from '../ui/Card';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { ChevronLeft } from 'lucide-react';

interface ProfessionalSelectionProps {
  professionals: Professional[];
  specialty?: Specialty;
  onSelect: (professional: Professional) => void;
  onBack: () => void;
}

export const ProfessionalSelection = ({
  professionals = [],
  specialty,
  onSelect,
  onBack,
}: ProfessionalSelectionProps) => {
  // Verificação de segurança
  if (!Array.isArray(professionals)) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ChevronLeft size={16} />}
            onClick={onBack}
            className="mr-2"
          >
            Voltar
          </Button>
          <h2 className="text-2xl font-bold text-gray-900">
            Escolha o Profissional
            {specialty && (
              <span className="text-gray-500 text-lg ml-2">
                para {specialty.name}
              </span>
            )}
          </h2>
        </div>
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">Erro ao carregar profissionais.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<ChevronLeft size={16} />}
          onClick={onBack}
          className="mr-2"
        >
          Voltar
        </Button>
        <h2 className="text-2xl font-bold text-gray-900">
          Escolha o Profissional
          {specialty && (
            <span className="text-gray-500 text-lg ml-2">
              para {specialty.name}
            </span>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {professionals.map((professional) => (
          <div
            key={professional.id}
            onClick={() => onSelect(professional)}
            className="cursor-pointer"
          >
            <Card className="hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-100">
              <CardContent className="p-5">
                <div className="flex items-center mb-3">
                  <Avatar
                    src={professional.avatar}
                    alt={professional.name}
                    size="lg"
                    className="mr-4"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{professional.name}</h3>
                    {professional.email && (
                      <p className="text-sm text-gray-500">{professional.email}</p>
                    )}
                  </div>
                </div>
                {professional.bio && (
                  <p className="text-sm text-gray-600 line-clamp-3">{professional.bio}</p>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

      {professionals.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No professionals available for this specialty.</p>
        </div>
      )}
    </div>
  );
};
