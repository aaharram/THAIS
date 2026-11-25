import { DataTableFacetedFilter } from '@/components/table/data-table-faceted-filter';
import { Input } from '@/components/ui/input';
import { Cross2Icon } from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';
import { LucideIcon, Search } from 'lucide-react';
import { createPortal } from 'react-dom';
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
  /**
   * Si renseigné, la recherche et « Réinitialiser » s'affichent dans cet élément (la ligne du titre de la page)
   * au lieu de la barre d'outils : tout tient alors sur une seule ligne.
   */
  searchSlot?: HTMLElement | null;
}

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
  searchSlot,
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

  // Champ de recherche + bouton « Réinitialiser » : un seul bloc, déplaçable dans l'en-tête de la page.
  const searchNode = (
    <>
      {hasSearch && (
        <div className={searchSlot ? 'relative' : 'relative mr-2'}>
          <span className='absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground'>
            <Search className='h-4 w-4' />
          </span>
          <Input
            placeholder={name ? `Recherché ${name} ...` : 'Recherché ...'}
            value={globalFilter ?? ''}
            onChange={(event) => {
              table.setGlobalFilter(event.target.value);
              if (onSearchChange) {
                onSearchChange(event.target.value);
              }
            }}
            className={searchSlot ? 'h-8 w-60 pl-8' : 'h-8 pl-8 min-w-96'}
          />
        </div>
      )}
      {isFiltered && (
        <Button variant='ghost' onClick={handleReset} className='h-8 px-2 lg:px-3'>
          Réinitialiser
          <Cross2Icon className='ml-2 h-4 w-4' />
        </Button>
      )}
    </>
  );

  const slotted = searchSlot && (hasSearch || isFiltered) ? createPortal(searchNode, searchSlot) : null;
  const hasRight = !!children || buttons.length > 0 || !!centerToolbar;
  const hasLeft = filterableColumns.length > 0 || (!searchSlot && (hasSearch || isFiltered));

  // Recherche déposée dans l'en-tête et rien d'autre à afficher : pas de barre d'outils vide.
  if (searchSlot && !hasRight && !hasLeft) return slotted;

  return (
    <>
      {slotted}
      <div className='flex items-center justify-between gap-2'>
        <div className='flex flex-1 items-center space-x-2'>
          {!searchSlot && searchNode}
          {filterableColumns.length > 0 &&
            filterableColumns.map(
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
        </div>
        {centerToolbar && <div className='flex items-center justify-center'>{centerToolbar}</div>}
        <div className='flex items-center space-x-2'>
          {children}
          {buttons.length > 0 &&
            buttons.map((btn, index) =>
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
      </div>
    </>
  );
}
