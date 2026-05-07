import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(49,59,80,0.78),rgba(17,22,31,0.96))] shadow-[0_24px_60px_rgba(0,0,0,0.32)]',
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6 md:p-8', className)} {...props} />;
}
