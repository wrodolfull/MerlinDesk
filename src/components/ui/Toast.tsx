// src/components/ui/Toast.tsx
import React, { useState, useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onClose: () => void;
}

export const ToastComponent: React.FC<ToastProps> = ({ 
  message, 
  type, 
  duration = 3000, 
  onClose 
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  };

  return (
    <div className={`fixed top-4 right-4 z-50 rounded-md shadow-md p-4 text-white ${bgColor[type]} flex items-center`}>
      <span>{message}</span>
      <button 
        onClick={onClose} 
        className="ml-4 text-white hover:text-gray-200"
      >
        &times;
      </button>
    </div>
  );
};

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastState {
  open: boolean;
  message: string;
  type: ToastType;
}

let toastState: ToastState = {
  open: false,
  message: '',
  type: 'info'
};

let setToastState: React.Dispatch<React.SetStateAction<ToastState>> | null = null;

export const ToastContainer: React.FC = () => {
  const [state, setState] = useState<ToastState>({
    open: false,
    message: '',
    type: 'info'
  });

  useEffect(() => {
    setToastState = setState;
    return () => {
      setToastState = null;
    };
  }, []);

  const handleClose = () => {
    setState(prev => ({ ...prev, open: false }));
  };

  if (!state.open) return null;

  return (
    <ToastComponent
      message={state.message}
      type={state.type}
      onClose={handleClose}
    />
  );
};

export const toast = {
  success: (message: string) => {
    if (setToastState) {
      setToastState({ open: true, message, type: 'success' });
    }
  },
  error: (message: string) => {
    if (setToastState) {
      setToastState({ open: true, message, type: 'error' });
    }
  },
  info: (message: string) => {
    if (setToastState) {
      setToastState({ open: true, message, type: 'info' });
    }
  },
  warning: (message: string) => {
    if (setToastState) {
      setToastState({ open: true, message, type: 'warning' });
    }
  }
};
