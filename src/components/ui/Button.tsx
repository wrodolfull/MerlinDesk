import React from 'react';
import { cn } from '../../utils/cn';

// Componente Slot para implementar o padrão asChild
const Slot = React.forwardRef<HTMLElement, { children: React.ReactElement, className?: string }>(
  ({ children, className, ...props }, ref) => {
    return React.cloneElement(children, {
      ...props,
      ...children.props,
      ref,
      className: cn(className, children.props.className),
    });
  }
);

Slot.displayName = 'Slot';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean; // Adicionar a propriedade asChild
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  className,
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  asChild = false,
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-500 text-white hover:bg-secondary-600 focus:ring-secondary-400',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-300',
    link: 'bg-transparent text-primary-600 hover:text-primary-700 underline-offset-4 hover:underline focus:ring-primary-500 p-0',
  };
  
  const sizes = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-sm px-4 py-2',
    lg: 'text-base px-6 py-3',
    icon: 'p-2',
  };

  const buttonClasses = cn(
    baseClasses,
    variants[variant],
    variant !== 'link' && sizes[size],
    className
  );

  // Se asChild for true, o primeiro filho deve ser um elemento React válido
  if (asChild) {
    if (!React.Children.only(children) || !React.isValidElement(children)) {
      console.error('Button with asChild prop must have exactly one React element child');
      return null;
    }

    return React.cloneElement(children as React.ReactElement, {
      className: cn(buttonClasses, (children as React.ReactElement).props.className),
      disabled: disabled || isLoading,
      ref,
      ...props,
    });
  }

  // Caso contrário, renderize um botão normal
  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      ref={ref}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
      {children}
      {!isLoading && rightIcon && <span className="ml-2">{rightIcon}</span>}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
