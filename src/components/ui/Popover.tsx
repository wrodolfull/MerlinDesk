// src/components/ui/Popover.tsx
import React, { useState, useRef, useEffect } from 'react';

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Popover: React.FC<PopoverProps> = ({ 
  open: controlledOpen, 
  onOpenChange,
  children 
}) => {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = (newOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(newOpen);
    }
    onOpenChange?.(newOpen);
  };

  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            open,
            onOpenChange: handleOpenChange
          });
        }
        return child;
      })}
    </div>
  );
};

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export const PopoverTrigger: React.FC<PopoverTriggerProps> = ({ 
  asChild, 
  children,
  open,
  onOpenChange
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onOpenChange?.(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick
    });
  }

  return (
    <button type="button" onClick={handleClick}>
      {children}
    </button>
  );
};

interface PopoverContentProps {
  children: React.ReactNode;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export const PopoverContent: React.FC<PopoverContentProps> = ({ 
  children, 
  className = '',
  open,
  onOpenChange,
  align = 'center',
  side = 'bottom'
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && open) {
        onOpenChange?.(false);
      }
    };

    // Calcular posição para evitar que o popover saia da tela
    const calculatePosition = () => {
      if (!ref.current || !open) return;
      
      const rect = ref.current.getBoundingClientRect();
      const parentRect = ref.current.parentElement?.getBoundingClientRect() || { top: 0, left: 0, width: 0, height: 0 };
      
      // Verificar se o popover sai da tela
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let top = 0;
      let left = 0;
      
      // Posicionamento vertical
      if (side === 'bottom') {
        top = parentRect.height;
      } else if (side === 'top') {
        top = -rect.height;
      } else if (side === 'left' || side === 'right') {
        top = (align === 'start') ? 0 : (align === 'end') ? parentRect.height - rect.height : (parentRect.height - rect.height) / 2;
      }
      
      // Posicionamento horizontal
      if (side === 'right') {
        left = parentRect.width;
      } else if (side === 'left') {
        left = -rect.width;
      } else if (side === 'top' || side === 'bottom') {
        left = (align === 'start') ? 0 : (align === 'end') ? parentRect.width - rect.width : (parentRect.width - rect.width) / 2;
      }
      
      // Prevenir que saia da tela horizontalmente
      const rightEdge = parentRect.left + left + rect.width;
      if (rightEdge > viewportWidth) {
        left -= (rightEdge - viewportWidth + 8); // 8px de margem
      }
      
      // Prevenir que saia da tela pela esquerda
      const leftEdge = parentRect.left + left;
      if (leftEdge < 0) {
        left -= leftEdge - 8; // 8px de margem
      }
      
      // Prevenir que saia da tela verticalmente
      const bottomEdge = parentRect.top + top + rect.height;
      if (bottomEdge > viewportHeight) {
        // Se estiver saindo por baixo, posicionar acima do elemento
        if (side === 'bottom') {
          top = -rect.height;
        } else {
          top -= (bottomEdge - viewportHeight + 8);
        }
      }
      
      // Prevenir que saia da tela por cima
      const topEdge = parentRect.top + top;
      if (topEdge < 0) {
        top -= topEdge - 8;
      }
      
      setPosition({ top, left });
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', calculatePosition);
    
    if (open) {
      // Usar setTimeout para garantir que o elemento esteja renderizado
      setTimeout(calculatePosition, 0);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', calculatePosition);
    };
  }, [open, onOpenChange, align, side]);

  if (!open) return null;

  return (
    <div 
      ref={ref}
      className={`absolute z-50 bg-white rounded-md shadow-lg p-4 ${className}`}
      style={{ 
        minWidth: '10rem',
        top: `${position.top}px`,
        left: `${position.left}px`
      }}
    >
      {children}
    </div>
  );
};
