import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'soft' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-crimson-500/30 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 min-h-[44px]';

    const variants = {
      primary:
        'bg-crimson-500 hover:bg-crimson-600 text-white shadow-crimson-sm hover:shadow-crimson-md',
      secondary:
        'bg-ink-950 dark:bg-white text-white dark:text-ink-950 hover:bg-ink-800 dark:hover:bg-ink-100',
      outline:
        'border border-crimson-100 dark:border-ink-700 bg-white/80 dark:bg-surface-dark-card/80 hover:bg-crimson-50 dark:hover:bg-ink-800 text-ink-950 dark:text-ink-50 shadow-sm backdrop-blur-sm',
      soft:
        'bg-crimson-50 dark:bg-crimson-950/40 text-crimson-700 dark:text-crimson-300 hover:bg-crimson-100 dark:hover:bg-crimson-950/60 border border-crimson-100/60 dark:border-crimson-900/30',
      ghost:
        'text-ink-700 dark:text-ink-200 hover:bg-crimson-50/70 dark:hover:bg-ink-800/60',
      danger:
        'bg-red-600 text-white hover:bg-red-700 shadow-sm',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 rounded-xl min-h-[38px]',
      md: 'text-sm px-5 py-2.5 rounded-2xl min-h-[44px]',
      lg: 'text-base px-6 py-3.5 rounded-2xl min-h-[48px] font-semibold',
      icon: 'w-11 h-11 p-0 rounded-2xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2 shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
