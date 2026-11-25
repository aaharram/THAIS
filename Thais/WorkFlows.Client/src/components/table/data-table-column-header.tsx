import { Column } from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,

} from '@/components/ui/dropdown-menu';
import { cn } from '@/utils/lib/utils';

interface DataTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
  sorting?: boolean;
  onSortChange?: (field: string, order: number) => void;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
  sorting,
  onSortChange,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort() || !sorting) {
    return <div className={cn(className)}>{title}</div>;
  }

  const handleSortChange = (order: number) => {
    if (onSortChange) {
      onSortChange(column.id, order);
    }
    if (order === 0) {
      column.clearSorting();
    } else {
      column.toggleSorting(order === 2);
    }
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className='flex items-center cursor-pointer select-none gap-1 '>
            <span>{title}</span>
            {column.getIsSorted() === 'asc' ? (
              <ArrowUp className='w-4 h-4' />
            ) : column.getIsSorted() === 'desc' ? (
              <ArrowDown className='w-4 h-4' />
            ) : (
              <ChevronsUpDown className='w-4 h-4' />
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='start'>
          <DropdownMenuItem onClick={() => handleSortChange(1)}>
            <ArrowUp className='h-3.5 w-3.5 text-muted-foreground/70' />
            Ascendante
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange(2)}>
            <ArrowDown className='h-3.5 w-3.5 text-muted-foreground/70' />
            Descendante
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleSortChange(0)}>
            <ChevronsUpDown className='h-3.5 w-3.5 text-muted-foreground/70' />
            
            Non trié
          </DropdownMenuItem>
          {/*<DropdownMenuSeparator />*/}
          {/*<DropdownMenuItem onClick={() => column.toggleVisibility(false)}>*/}
          {/*  <EyeOff className='h-3.5 w-3.5 text-muted-foreground/70' />*/}
          {/*  Masquer*/}
          {/*</DropdownMenuItem>*/}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
