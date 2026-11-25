import Logo from '@/assets/images/SCM.png';
import { cn } from '@/utils/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        warning: 'text-warning-foreground bg-warning border-warning',
        success: 'text-success-foreground bg-success border-success',
        info: 'text-info-foreground bg-info border-info',
        light: 'text-light-foreground bg-light border-light hover:bg-config',
        dark: 'text-dark-foreground bg-dark border-dark',
        muted: 'text-muted-foreground bg-muted border-muted',
        primary: 'text-primary-foreground bg-primary border-primary',
        priorite1: 'text-priorite1-foreground bg-priorite1 border-priorite1',
        priorite2: 'text-priorite2-foreground bg-priorite2 border-priorite2',
        priorite3: 'text-priorite3-foreground bg-priorite3 border-priorite3',
        card: 'bg-config text-config-foreground shadow-sm hover:bg-card/80',

        infoOutline: 'border border-info text-info hover:bg-info/10',
        successOutline: 'border border-success text-success hover:bg-success/10',
        warningOutline: 'border border-warning text-warning hover:bg-warning/10',
        destructiveOutline: 'border border-destructive text-destructive hover:bg-destructive/10',
        primaryOutline: 'border border-primary text-primary hover:bg-primary/10',
        mutedOutline: 'border border-muted text-muted hover:bg-muted/10',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, isLoading = false, disabled, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          isLoading && 'cursor-not-allowed opacity-75',
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <img src={Logo} alt='Loading' className='animate-spin w-4 h-4 mr-2' />}
        {children}
      </Comp>
    );
  },
);
Button.displayName = 'Button';

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants };
