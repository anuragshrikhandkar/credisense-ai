import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'crimson' | 'success' | 'amber' | 'neutral' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'crimson',
  children,
  ...props
}) => {
  const variants = {
    crimson: 'bg-crimson-50 text-crimson-700 dark:bg-crimson-950/50 dark:text-crimson-300 border-crimson-100 dark:border-crimson-900/50',
    success: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40',
    amber: 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-900/40',
    neutral: 'bg-ink-100 text-ink-700 dark:bg-ink-800/60 dark:text-ink-300 border-ink-200 dark:border-ink-700',
    outline: 'bg-transparent text-ink-600 dark:text-ink-400 border-ink-200 dark:border-ink-700',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
