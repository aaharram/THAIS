import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter';
import { registerToolbarSlot, unregisterToolbarSlot } from '@/components/table/toolbar-slot';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { LucideIcon, Search } from 'lucide-react';
import { useCallback, useRef } from 'react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  onSearchChange?: (value: string) => void;
  onFilterChange?: (columnId: string, values: (string | number | boolean)[]) => void;
  filterableColumns?: {
    id: string;
    title: string;
    options: { label: string; value: string | number | boolean; count?: number }[];
  }[];
  searchableColumns?: {
    id: string;
    title: string;
  }[];
  children?: React.ReactNode;
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
  viewOptions?: boolean;
  name?: string;
  centerToolbar?: React.ReactNode;
  /** Pagination côté serveur (sinon, celle du tableau). */
  pagination?: {
    pageSize: number;
    onPageSizeChange: (newSize: number) => void;
  };
  pageSizes?: number[];
}

/**
 * Barre d'outils d'une liste, sur une seule ligne :
 * [ Recherche ]  [ 10 ▾ Par page ]  [ filtres ]  ……  [ filtre / Import / Export / + de la page ]
 * La partie droite est un emplacement où le Title de la page dépose ses actions et boutons.
 */
export function DataTableToolbar<TData>({
  table,
  onSearchChange,
  onFilterChange,
  filterableColumns = [],
  searchableColumns = [],
  children,
  buttons = [],
  name,
  centerToolbar,
  pagination,
  pageSizes = [4, 10, 20, 30, 50],
}: DataTableToolbarProps<TData>) {
  const globalFilter = table.getState().globalFilter;
  const isFiltered = table.getState().columnFilters.length > 0 || !!globalFilter;
  const handleReset = () => {
    table.resetColumnFilters();
    table.setGlobalFilter('');
    if (onFilterChange) {
      filterableColumns.forEach((column) => {
        onFilterChange(column.id, []);
      });
    }

    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const hasSearch = searchableColumns.length > 0;
  const pageSize = pagination ? pagination.pageSize : table.getState().pagination.pageSize;
  const sizes = pageSizes.includes(pageSize) ? pageSizes : [...pageSizes, pageSize].sort((a, b) => a - b);

  // Réf. callback : enregistre l'emplacement d'actions de la page (voir toolbar-slot.ts).
  const currentSlot = useRef<HTMLDivElement | null>(null);
  const setSlot = useCallback((el: HTMLDivElement | null) => {
    if (el) {
      currentSlot.current = el;
      registerToolbarSlot(el);
    } else if (currentSlot.current) {
      unregisterToolbarSlot(currentSlot.current);
      currentSlot.current = null;
    }
  }, []);

  return (
    <div className='flex flex-wrap items-center gap-3'>
      {hasSearch && (
        <div className='relative'>
          <span className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
            <Search className='h-4 w-4' />
          </span>
          <Input
            placeholder={name ? `Recherche ${name}` : 'Recherche'}
            value={globalFilter ?? ''}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
              if (onSearchChange) {
                onSearchChange(event.target.value);
              }
            }}
            className='h-10 w-64 rounded-lg bg-card pl-9 sm:w-72'
          />
        </div>
      )}

      <div className='flex items-center gap-2'>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            const newSize = Number(value);
            if (pagination) pagination.onPageSizeChange(newSize);
            else table.setPageSize(newSize);
          }}
        >
          <SelectTrigger className='h-10 w-[76px] rounded-lg bg-card' aria-label='Lignes par page'>
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent>
            {sizes.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className='text-sm text-muted-foreground'>Par page</span>
      </div>

      {isFiltered && (
        <Button variant='ghost' onClick={handleReset} className='h-10 px-3'>
          Réinitialiser
          <Cross2Icon className='ml-2 h-4 w-4' />
        </Button>
      )}

      {filterableColumns.map(
        (column) =>
          table.getColumn(column.id) && (
            <DataTableFacetedFilter
              key={column.id}
              column={table.getColumn(column.id)}
              title={column.title}
              options={column.options}
              onFilterChange={(values) => {
                if (onFilterChange) {
                  onFilterChange(column.id, values);
                }
              }}
            />
          ),
      )}

      {centerToolbar && <div className='flex items-center justify-center'>{centerToolbar}</div>}

      {/* Partie droite : actions de la page (via Title) + éléments propres à la liste */}
      <div ref={setSlot} className='ml-auto flex flex-wrap items-center justify-end gap-2'>
        {children}
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
              className='h-10 rounded-lg'
            >
              {btn.icon && <btn.icon className='mr-2 h-4 w-4' />}
              {btn.label}
            </Button>
          ),
        )}
      </div>
    </div>
  );
}
