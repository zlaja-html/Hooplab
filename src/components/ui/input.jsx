import React from 'react';
import { cn } from '@/lib/utils';

export const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        'h-12 w-full rounded-2xl border border-white/10 bg-[var(--brand-slate-soft)] px-4 text-sm text-[var(--brand-paper)] outline-none transition placeholder:text-[var(--brand-muted)] focus:border-[var(--brand-accent)]/70 focus:ring-2 focus:ring-[var(--brand-accent)]/20',
        className
      )}
      {...props}
    />
  );
});
