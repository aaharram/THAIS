import { useToolbarSlot } from '@/components/table/toolbar-slot';
import { LucideIcon, Plus } from 'lucide-react';
import React from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
import { Switch } from './switch';

interface TitleProps {
  icon?: LucideIcon;
  img?: string;
  title: string | React.ReactNode;
  description?: string;
  buttons?: {
    label: string;
    icon?: LucideIcon;
    variant:
      | 'default'
      | 'link'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | null
      | undefined;
    isDisabled?: boolean;
    onClick?: () => void;
    isSwitch?: boolean;
    isSwitchOn?: boolean;
  }[];
  // Éléments libres (filtre, menus Import / Export...) affichés à droite, dans la barre d'outils de la liste.
  actions?: React.ReactNode;
}

export const Title = ({ icon, img, title, description, buttons = [], actions }: TitleProps) => {
  // Si la page contient une liste, les actions et boutons vont dans sa barre d'outils (sous le titre) ;
  // sinon, ils restent à droite du titre.
  const toolbarSlot = useToolbarSlot();

  const right = (
    <>
      {actions}
      {buttons.map((btn, index) =>
        btn.isSwitch ? (
          <div key={index} className='order-4 flex items-center space-x-2'>
            {btn.icon && <btn.icon className='h-4 w-4' />}
            <label htmlFor={`switch-${index}`} className='text-sm font-medium leading-none'>
              {btn.label}
            </label>
            <Switch
              id={`switch-${index}`}
              checked={btn.isSwitchOn}
              onCheckedChange={btn.onClick}
              disabled={btn.isDisabled}
            />
          </div>
        ) : btn.icon === Plus && btn.variant === 'default' ? (
          // Ajout : bouton « + » carré, comme sur la liste des actifs.
          <Button
            key={index}
            onClick={btn.onClick}
            variant={btn.variant}
            disabled={btn.isDisabled}
            title={btn.label}
            aria-label={btn.label}
            className='order-4 h-10 w-10 rounded-lg p-0 shadow-sm'
          >
            <Plus className='h-5 w-5' />
          </Button>
        ) : (
          <Button
            key={index}
            onClick={btn.onClick}
            variant={btn.variant}
            disabled={btn.isDisabled}
            className='order-4 h-10 rounded-lg'
          >
            {btn.icon && <btn.icon className='mr-2 h-4 w-4' />}
            {btn.label}
          </Button>
        ),
      )}
    </>
  );

  return (
    <div className='flex items-center flex-wrap gap-x-4 gap-y-2 py-2'>
      {/* Left side: icon + title + description */}
      <div className='flex items-center gap-3 flex-wrap'>
        {icon && (
          <div className='rounded-full bg-config p-3'>
            {React.createElement(icon, { className: 'w-6 h-6' })}
          </div>
        )}
        {img && (
          <div className='rounded-full bg-config p-3'>
            <img src={img} alt='THAIS Logo' className='w-6 h-6' />
          </div>
        )}
        <div className='flex flex-col'>
          <h2 className='text-lg font-bold tracking-tight text-title'>{title}</h2>
          {description && <p className='text-muted-foreground text-xs'>{description}</p>}
        </div>
      </div>

      {toolbarSlot ? (
        createPortal(right, toolbarSlot)
      ) : (
        <div className='ml-auto flex items-center gap-2 flex-wrap'>{right}</div>
      )}
    </div>
  );
};
