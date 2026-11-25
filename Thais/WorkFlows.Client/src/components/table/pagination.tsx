import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { Table } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newSize: number) => void;
    totalCount: number;
  };
  pageSizes?: number[];
}

export function DataTablePagination<TData>({
  table,
  pageSizes = [4, 10, 20, 30],
  pagination,
}: DataTablePaginationProps<TData>) {
  const pageIndex = pagination ? pagination.pageIndex : table.getState().pagination.pageIndex;
  const pageSize = pagination ? pagination.pageSize : table.getState().pagination.pageSize;
  const totalCount = pagination ? pagination.totalCount : table.getFilteredRowModel().rows.length;
  const pageCount = Math.ceil(totalCount / pageSize);

  return (
    // sticky bottom-0 : la pagination reste collée en bas de l'écran tant que la liste est plus
    // haute que la fenêtre (ex. 20 lignes), au lieu d'obliger à descendre jusqu'au pied de page.
    // Elle reprend sa place normale sous le tableau quand on arrive en bas de la liste.
    <div className='sticky bottom-0 z-10 flex items-center justify-between rounded-b-md border-t bg-white px-2 py-2 shadow-[0_-2px_6px_-4px_rgba(0,0,0,0.15)]'>
      <div className='text-sm text-muted-foreground'>
        {table.getFilteredSelectedRowModel().rows.length} sur{' '}
        {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
      </div>

      <div className='flex items-center justify-center space-x-6 lg:space-x-8'>
        <div className='flex items-center space-x-2'>
          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => {
              if (pagination) {
                pagination.onPageChange(0);
              } else {
                table.setPageIndex(0);
              }
            }}
            disabled={pageIndex === 0}
          >
            <span className='sr-only'>Première page</span>
            <DoubleArrowLeftIcon className='h-4 w-4' />
          </Button>

          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => {
              if (pagination) {
                pagination.onPageChange(pageIndex - 1);
              } else {
                table.previousPage();
              }
            }}
            disabled={pageIndex === 0}
          >
            <span className='sr-only'>Page précédente</span>
            <ChevronLeftIcon className='h-4 w-4' />
          </Button>

          <div className='text-sm font-medium'>
            Page {pageIndex + 1} sur {pageCount}
          </div>

          <Button
            variant='outline'
            className='h-8 w-8 p-0'
            onClick={() => {
              if (pagination) {
                pagination.onPageChange(pageIndex + 1);
              } else {
                table.nextPage();
              }
            }}
            disabled={pageIndex + 1 >= pageCount}
          >
            <span className='sr-only'>Page suivante</span>
            <ChevronRightIcon className='h-4 w-4' />
          </Button>

          <Button
            variant='outline'
            className='hidden h-8 w-8 p-0 lg:flex'
            onClick={() => {
              if (pagination) {
                pagination.onPageChange(pageCount - 1);
              } else {
                table.setPageIndex(pageCount - 1);
              }
            }}
            disabled={pageIndex + 1 >= pageCount}
          >
            <span className='sr-only'>Dernière page</span>
            <DoubleArrowRightIcon className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <p className='text-sm font-medium'>Lignes par page</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => {
            const newSize = Number(value);
            if (pagination) {
              pagination.onPageSizeChange(newSize);
            } else {
              table.setPageSize(newSize);
            }
          }}
        >
          <SelectTrigger className='h-8 w-[70px]'>
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side='top'>
            {pageSizes.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
