import React, { useState, KeyboardEvent } from 'react';
import { X } from 'lucide-react';

interface TagInputProps {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
  name?: string;
  ref?: React.Ref<HTMLInputElement>;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

const TagInput = React.forwardRef<HTMLInputElement, TagInputProps>(
  ({ label, value = [], onChange, name, error, disabled, placeholder = "Digite um e-mail e pressione Enter" }, ref) => {
    const [inputValue, setInputValue] = useState('');

    // Garantir que value seja sempre um array
    const safeValue = Array.isArray(value) ? value : [];
    
    // Log para debug
    console.log('🏷️ TagInput: value recebido:', value);
    console.log('🏷️ TagInput: safeValue processado:', safeValue);

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        const email = inputValue.trim();
        
        // Validação básica de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return;
        }

        // Verificar se o e-mail já existe
        if (!safeValue.includes(email)) {
          onChange([...safeValue, email]);
        }
        setInputValue('');
      } else if (e.key === 'Backspace' && !inputValue && safeValue.length > 0) {
        // Remover último tag quando pressionar Backspace com input vazio
        onChange(safeValue.slice(0, -1));
      }
    };

    const removeTag = (indexToRemove: number) => {
      onChange(safeValue.filter((_, index) => index !== indexToRemove));
    };

    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="min-h-[42px] border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
          <div className="flex flex-wrap gap-2 mb-2">
            {safeValue.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-800 rounded-md"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="text-blue-600 hover:text-blue-800"
                  disabled={disabled}
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
          <input
            ref={ref}
            type="email"
            name={name}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={safeValue.length === 0 ? placeholder : "Adicionar outro e-mail..."}
            className="w-full border-none outline-none text-sm bg-transparent"
            disabled={disabled}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
      </div>
    );
  }
);

TagInput.displayName = 'TagInput';

export default TagInput; 