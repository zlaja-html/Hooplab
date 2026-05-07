import React from 'react';
import { cn } from '@/lib/utils';

export function Badge({ className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[var(--brand-accent)]/25 bg-[var(--brand-accent)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent)]',
        className
      )}
      {...props}
    />
  );
}
