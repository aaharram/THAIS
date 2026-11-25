import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MoreVertical } from 'lucide-react';
import { MouseEvent } from 'react';

export interface ActionButton {
  label: string;
  icon: React.ReactNode;
  onClick: (e: MouseEvent<Element>) => void;
  disabled?: boolean;
}

interface ActionButtonsProps {
  actions: ActionButton[];
}

export const ActionButtons = ({ actions }: ActionButtonsProps) => {
  const visibleActions = actions.slice(0, 2);
  const extraActions = actions.length > 2 ? actions.slice(2) : [];

  return (
    <div className='flex justify-end items-center h-full py-2'>
      <div className='flex items-center gap-6'>
        {visibleActions.map((action, index) => (
          <TooltipProvider key={index}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={(e) => {
                    e.stopPropagation(); 
                    action.onClick(e);
                  }}
                  className='hover:opacity-80'
                  disabled={action.disabled}
                >
                  {action.icon}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

        {extraActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button>
                <MoreVertical className='h-5 w-5' />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {extraActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(e);
                  }}
                >
                  <div className='flex items-center gap-2'>
                    {action.icon}
                    {action.label}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
};
