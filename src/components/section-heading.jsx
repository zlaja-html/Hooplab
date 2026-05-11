import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function SectionHeading({ eyebrow, title, body, align = 'left', className }) {
  return (
    <div className={cn('max-w-3xl space-y-5', align === 'center' && 'mx-auto text-center', className)}>
      <Badge>{eyebrow}</Badge>
      <div className="space-y-4">
        <h2 className="font-display text-4xl uppercase tracking-[0.04em] text-[var(--brand-paper)] md:text-5xl">
          {title}
        </h2>
        {body ? <p className="max-w-2xl text-base leading-7 text-[var(--brand-muted)] md:text-lg">{body}</p> : null}
      </div>
    </div>
  );
}
