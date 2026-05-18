import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Tone = 'brand' | 'neutral' | 'dark' | 'glass';

const tones: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-700 border border-brand-100',
  neutral: 'bg-ink-50 text-ink-500 border border-ink-100',
  dark: 'bg-white/5 text-white/70 border border-white/10 backdrop-blur',
  glass: 'glass-light text-ink-100',
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
}

export function Badge({ tone = 'brand', icon, children, className, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium tracking-tight',
        tones[tone],
        className,
      )}
      {...rest}
    >
      {icon && <span className="-ml-0.5 flex h-3.5 w-3.5 items-center justify-center">{icon}</span>}
      {children}
    </span>
  );
}
