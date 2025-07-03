import React from 'react';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Spinner } from './Spinner';

interface ProcessStep {
  id: string;
  title: string;
  status: 'pending' | 'loading' | 'completed' | 'error';
  description?: string;
}

interface ProcessStatusProps {
  steps: ProcessStep[];
  currentStep?: string;
}

const ProcessStatus: React.FC<ProcessStatusProps> = ({ steps, currentStep }) => {
  const getStepIcon = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'loading':
        return <Spinner size="sm" className="text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStepClass = (step: ProcessStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'loading':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-500 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`flex items-center gap-3 p-3 rounded-lg border ${getStepClass(step)} ${
            currentStep === step.id ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
          }`}
        >
          <div className="flex-shrink-0">
            {getStepIcon(step)}
          </div>
          <div className="flex-1">
            <h4 className="font-medium">{step.title}</h4>
            {step.description && (
              <p className="text-sm opacity-75 mt-1">{step.description}</p>
            )}
          </div>
          {index < steps.length - 1 && step.status === 'completed' && (
            <div className="absolute left-6 top-12 w-0.5 h-8 bg-green-200"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ProcessStatus; 