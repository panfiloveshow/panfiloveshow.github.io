import { forwardRef, type ButtonHTMLAttributes, type AnchorHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'dark';
type Size = 'sm' | 'md' | 'lg';

const base =
  'group relative inline-flex select-none items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-[0.95rem]',
  lg: 'h-14 min-h-14 px-6 text-[15px] sm:px-7 sm:text-base',
};

const variants: Record<Variant, string> = {
  primary:
    'overflow-hidden bg-gradient-to-b from-brand-400 via-brand-500 to-brand-600 text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_8px_22px_-8px_rgba(44,186,102,0.7),0_22px_50px_-22px_rgba(44,186,102,0.55)] hover:from-brand-300 hover:via-brand-400 hover:to-brand-500 hover:shadow-[0_1px_0_rgba(255,255,255,0.35)_inset,0_12px_28px_-8px_rgba(44,186,102,0.85),0_30px_60px_-22px_rgba(44,186,102,0.65)]',
  secondary:
    'bg-white text-ink-100 border border-ink-100/10 shadow-card hover:border-ink-100/20 hover:shadow-card-hover',
  ghost:
    'text-ink-100 hover:bg-ink-100/5',
  outline:
    'border border-ink-100/15 bg-white/70 backdrop-blur-sm text-ink-100 hover:border-brand-500/40 hover:bg-white',
  dark:
    'bg-ink-900 text-white border border-white/10 hover:bg-ink-800 hover:border-white/20',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
}

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { as?: 'button' };
type AnchorProps = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { as: 'a'; href: string };

export type ButtonOrAnchorProps = ButtonProps | AnchorProps;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonOrAnchorProps>(
  (props, ref) => {
    const { variant = 'primary', size = 'md', className, children, iconLeft, iconRight } = props;
    const cls = cn(base, sizes[size], variants[variant], className);

    if (props.as === 'a') {
      const { as: _as, variant: _v, size: _s, className: _c, iconLeft: _il, iconRight: _ir, children: _ch, ...rest } = props;
      void _as; void _v; void _s; void _c; void _il; void _ir; void _ch;
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={cls}
          {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {variant === 'primary' && (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/35 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-hover:animate-[beam-sweep_1.4s_ease-in-out]"
            />
          )}
          {iconLeft}
          <span className="relative">{children}</span>
          {iconRight}
        </a>
      );
    }

    const { as: _as, variant: _v, size: _s, className: _c, iconLeft: _il, iconRight: _ir, children: _ch, ...rest } = props;
    void _as; void _v; void _s; void _c; void _il; void _ir; void _ch;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={cls}
        {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {iconLeft}
        <span className="relative">{children}</span>
        {iconRight}
      </button>
    );
  },
);
Button.displayName = 'Button';
