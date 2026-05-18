import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export const Container = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('box-border mx-auto w-full max-w-7xl px-5 sm:px-8 lg:px-10', className)}
      {...props}
    />
  ),
);
Container.displayName = 'Container';
