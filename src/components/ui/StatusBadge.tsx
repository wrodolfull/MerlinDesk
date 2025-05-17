import React from 'react';
import Badge from './Badge';
import { AppointmentStatus } from '../../types';

interface StatusBadgeProps {
  status: AppointmentStatus;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const statusConfig = {
    confirmed: {
      variant: 'primary' as const,
      label: 'Confirmed',
    },
    pending: {
      variant: 'warning' as const,
      label: 'Pending',
    },
    completed: {
      variant: 'success' as const,
      label: 'Completed',
    },
    canceled: {
      variant: 'error' as const,
      label: 'Canceled',
    },
  };

  const { variant, label } = statusConfig[status];

  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;