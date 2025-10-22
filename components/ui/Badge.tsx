import { clsx } from 'clsx';
import type { ObligationStatus } from '@/types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: ObligationStatus | 'default';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'default', size = 'md' }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-medium',
        {
          // Variants
          'bg-yellow-100 text-yellow-800': variant === 'pending',
          'bg-blue-100 text-blue-800': variant === 'in_progress',
          'bg-green-100 text-green-800': variant === 'completed',
          'bg-red-100 text-red-800': variant === 'overdue',
          'bg-gray-100 text-gray-800': variant === 'default',
          // Sizes
          'px-2 py-0.5 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
        }
      )}
    >
      {children}
    </span>
  );
}

export function getStatusLabel(status: ObligationStatus): string {
  const labels: Record<ObligationStatus, string> = {
    pending: 'Pendente',
    in_progress: 'Em Andamento',
    completed: 'Concluída',
    overdue: 'Atrasada',
  };
  return labels[status] || status;
}

