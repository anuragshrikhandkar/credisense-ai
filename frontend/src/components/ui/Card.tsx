import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className,
  glass = true,
  hoverable = false,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-[28px] border transition-all duration-300 relative overflow-hidden',
        glass
          ? 'bg-white/75 dark:bg-[#181013]/75 backdrop-blur-md border-[#F2E5E8] dark:border-[#2E1D22] shadow-glass'
          : 'bg-white dark:bg-[#181013] border-[#F2E5E8] dark:border-[#2E1D22] shadow-card-soft',
        hoverable && 'hover:-translate-y-0.5 hover:shadow-glass-hover hover:border-crimson-200 dark:hover:border-crimson-900/60',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};
