import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-full font-semibold tracking-[0.08em] uppercase transition duration-300 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--brand-accent)] px-6 py-3 text-[var(--brand-ink)] shadow-[0_0_0_1px_rgba(82,185,208,0.35)] hover:bg-[var(--brand-accent-soft)]',
        secondary: 'border border-[var(--brand-accent)]/40 bg-transparent px-6 py-3 text-[var(--brand-paper)] hover:border-[var(--brand-accent)] hover:bg-[var(--brand-accent)]/10',
        ghost: 'px-4 py-2 text-[var(--brand-paper)] hover:bg-white/6'
      },
      size: {
        default: 'text-xs',
        lg: 'px-7 py-4 text-sm'
      }
    },
    defaultVariants: {
      variant: 'primary',
      size: 'default'
    }
  }
);

function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
