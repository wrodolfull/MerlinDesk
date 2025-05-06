import React from 'react';
import { Specialty } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Clock, DollarSign } from 'lucide-react';

interface SpecialtySelectionProps {
  specialties: Specialty[];
  onSelect: (specialty: Specialty) => void;
}

export const SpecialtySelection = ({ specialties, onSelect }: SpecialtySelectionProps) => {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Select a Service</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specialties.map((specialty) => (
          <Card 
            key={specialty.id}
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 border-transparent hover:border-primary-100"
            onClick={() => onSelect(specialty)}
          >
            <CardContent className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{specialty.name}</h3>
              
              <div className="flex items-center text-gray-500 mb-2">
                <Clock size={16} className="mr-2" />
                <span>{specialty.duration} minutes</span>
              </div>
              
              {specialty.price && (
                <div className="flex items-center text-gray-500">
                  <DollarSign size={16} className="mr-2" />
                  <span>${specialty.price}</span>
                </div>
              )}
              
              {specialty.description && (
                <p className="mt-2 text-sm text-gray-600">{specialty.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};