import React, { useState } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';

interface Option {
  id: string;
  name: string;
  [key: string]: any;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selectedOptions: Option[];
  onSelectionChange: (options: Option[]) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selectedOptions,
  onSelectionChange,
  placeholder = "Selecione as opções...",
  disabled = false,
  error
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedOptions.some(selected => selected.id === option.id)
  );

  const handleToggleOption = (option: Option) => {
    const isSelected = selectedOptions.some(selected => selected.id === option.id);
    
    if (isSelected) {
      onSelectionChange(selectedOptions.filter(selected => selected.id !== option.id));
    } else {
      onSelectionChange([...selectedOptions, option]);
    }
  };

  const handleRemoveOption = (optionId: string) => {
    onSelectionChange(selectedOptions.filter(selected => selected.id !== optionId));
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="relative">
        {/* Campo de seleção */}
        <div
          className={`min-h-[42px] border rounded-md px-3 py-2 cursor-pointer transition-colors ${
            disabled 
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
              : 'bg-white border-gray-300 hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <div className="flex flex-wrap gap-1">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(option => (
                <span
                  key={option.id}
                  className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md"
                >
                  {option.name}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveOption(option.id);
                      }}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={12} />
                    </button>
                  )}
                </span>
              ))
            ) : (
              <span className="text-gray-500">{placeholder}</span>
            )}
          </div>
          
          <ChevronDown 
            className={`absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </div>

        {/* Dropdown */}
        {isOpen && !disabled && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {/* Campo de busca */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Lista de opções */}
            <div className="py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <div
                    key={option.id}
                    className="flex items-center px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleToggleOption(option)}
                  >
                    <div className="flex-1">{option.name}</div>
                    {selectedOptions.some(selected => selected.id === option.id) && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Nenhuma opção encontrada
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default MultiSelect; 