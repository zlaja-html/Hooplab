import React from 'react';
import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(58,71,96,0.82),rgba(34,44,60,0.92))] shadow-[0_24px_60px_rgba(9,14,22,0.22)]',
        className
      )}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-6 md:p-8', className)} {...props} />;
}
