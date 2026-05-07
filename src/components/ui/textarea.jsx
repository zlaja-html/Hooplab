import React from 'react';
import { cn } from '@/lib/utils';

export const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[140px] w-full rounded-[24px] border border-white/12 bg-[rgba(255,255,255,0.06)] px-4 py-3 text-sm text-[var(--brand-paper)] outline-none transition placeholder:text-[var(--brand-muted)] focus:border-[var(--brand-accent)]/70 focus:ring-2 focus:ring-[var(--brand-accent)]/20',
        className
      )}
      {...props}
    />
  );
});
