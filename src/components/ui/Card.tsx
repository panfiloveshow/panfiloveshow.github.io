import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'light' | 'dark' | 'glass-light' | 'glass-dark';

const variants: Record<Variant, string> = {
  light: 'bg-white border border-ink-100/8 shadow-card',
  dark: 'bg-ink-800 border border-white/8',
  'glass-light': 'glass-light',
  'glass-dark': 'glass-dark',
};

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: Variant;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'light', className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('rounded-3xl', variants[variant], className)}
      {...props}
    />
  ),
);
Card.displayName = 'Card';
