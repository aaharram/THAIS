import { LucideIcon } from 'lucide-react';
import React from 'react';
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
  // Éléments libres (filtre, menu d'export...) affichés à droite, AVANT les boutons.
  actions?: React.ReactNode;
}

export const Title = ({ icon, img, title, description, buttons = [], actions }: TitleProps) => {
  return (
    <div className='flex items-center justify-between flex-wrap gap-2 py-2'>
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

      {/* Right side: recherche de la liste (déposée ici par DataTable), puis actions et boutons, sur une seule ligne */}
      {
        <div className='flex items-center gap-2 flex-wrap'>
          <div data-title-search-slot className='flex items-center gap-2' />
          {actions}
          {buttons.map((btn, index) =>
            btn.isSwitch ? (
              <div key={index} className='flex items-center space-x-2'>
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
            ) : (
              <Button
                key={index}
                onClick={btn.onClick}
                variant={btn.variant}
                disabled={btn.isDisabled}
                className='h-8'
              >
                {btn.icon && <btn.icon className='mr-2 h-4 w-4' />}
                {btn.label}
              </Button>
            ),
          )}
        </div>
      }
    </div>
  );
};
