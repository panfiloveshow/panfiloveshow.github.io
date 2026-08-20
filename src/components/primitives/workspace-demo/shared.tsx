import { cn } from '@/lib/cn';

export function ProductMark({ size = 'md' }: { size?: 'sm' | 'md' }) {
  return (
    <span
      className={cn(
        'grid shrink-0 place-items-center rounded-[10px] bg-[#ecfdf5]',
        size === 'md' ? 'h-10 w-10' : 'h-8 w-8',
      )}
    >
      <img
        src="/logo.svg"
        alt=""
        width={size === 'md' ? 30 : 24}
        height={size === 'md' ? 30 : 24}
        className={size === 'md' ? 'h-[30px] w-[30px]' : 'h-6 w-6'}
      />
    </span>
  );
}

export function Avatar({ initials, violet = false }: { initials: string; violet?: boolean }) {
  return (
    <span
      className={cn(
        'grid h-6 w-6 shrink-0 place-items-center rounded-full text-[9px] font-bold',
        violet ? 'bg-[#6366f1] text-white' : 'bg-[#ecfdf5] text-[#10b981]',
      )}
    >
      {initials}
    </span>
  );
}
