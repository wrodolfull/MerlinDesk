import React from 'react';
import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  className,
  label,
  error,
  helperText,
  required,
  id,
  ...props
}, ref) => {
  const inputId = id || Math.random().toString(36).substring(2, 9);
  
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2",
          error
            ? "border-error-500 focus:ring-error-500 focus:border-error-500"
            : "border-gray-300 focus:ring-primary-500 focus:border-primary-500",
          className
        )}
        ref={ref}
        {...props}
      />
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

Input.displayName = 'Input';

export default Input;