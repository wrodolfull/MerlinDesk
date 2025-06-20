import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: Option[];
  label?: string;
  error?: string;
  helperText?: string;
  value?: string;
  onChange?: (event: React.ChangeEvent<HTMLSelectElement> | string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({
  className,
  options,
  label,
  error,
  helperText,
  required,
  id,
  value = '',
  name,
  onChange,
  ...props
}: SelectProps, ref) => {
  const selectId = id || Math.random().toString(36).substring(2, 9);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (!onChange) return;

    if (event?.target) {
      if (typeof onChange === 'function' && event.target.name) {
        onChange(event);
      } else {
        onChange(event.target.value);
      }
    }
  };

  const safeOptions = Array.isArray(options) ? options : [];

  const isValidValue = value === '' || safeOptions.some(option => option.value === value);
  const currentValue = isValidValue ? value : '';

  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={selectId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          name={name}
          className={cn(
            "w-full appearance-none px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 bg-white",
            error
              ? "border-error-500 focus:ring-error-500 focus:border-error-500"
              : "border-gray-300 focus:ring-primary-500 focus:border-primary-500",
            className
          )}
          ref={ref}
          value={currentValue}
          onChange={handleChange}
          {...props}
        >
          <option value="" disabled>Selecione uma opção</option>
          {safeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {/* <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
          <ChevronDown size={16} className="text-gray-500" />
        </div> */}
      </div>
      {(error || helperText) && (
        <div className="mt-1 text-sm">
          {error ? (
            <p className="text-error-500">{error}</p>
          ) : helperText ? (
            <p className="text-gray-500">{helperText}</p>
          ) : null}
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;