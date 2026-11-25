import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  Dialog as DialogPrimitive,
  DialogTitle,
} from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { cn } from '@/utils/lib/utils';
import React from 'react';

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  showCloseButton?: boolean;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

const sizeClasses = {
  sm: 'sm:max-w-[425px]',
  md: 'sm:max-w-[600px]',
  lg: 'sm:max-w-[800px]',
  xl: 'sm:max-w-[1000px]',
  full: 'sm:max-w-[95vw]',
};

export function BaseDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
  onConfirm,
  onCancel,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  loading = false,
  size = 'md',
}: DialogProps) {
  return (
    <DialogPrimitive open={open} onOpenChange={onOpenChange}>
      <DialogContent
        {...(!description && { 'aria-describedby': undefined })}
        className={cn('gap-4 p-6', sizeClasses[size], className)}
      >
        <DialogHeader>
          {title ? (
            <DialogTitle>{title}</DialogTitle>
          ) : (
            <VisuallyHidden asChild>
              <DialogTitle>Boîte de dialogue</DialogTitle>
            </VisuallyHidden>
          )}
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className='flex-1'>{children}</div>

        {(footer || onConfirm || onCancel) &&
          (footer ? (
            <div className='flex justify-center items-center gap-4'>{footer}</div>
          ) : (
            <DialogFooter className='justify-center gap-4 pt-4'>
              {onCancel && (
                <Button variant='outline' onClick={onCancel} disabled={loading}>
                  {cancelText}
                </Button>
              )}
              {onConfirm && (
                <Button onClick={onConfirm} disabled={loading}>
                  {confirmText}
                </Button>
              )}
            </DialogFooter>
          ))}
      </DialogContent>
    </DialogPrimitive>
  );
}
