import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => {
  return (
    <div
      className={cn('animate-pulse rounded-2xl bg-ink-200/60 dark:bg-ink-800/60', className)}
      {...props}
    />
  );
};
