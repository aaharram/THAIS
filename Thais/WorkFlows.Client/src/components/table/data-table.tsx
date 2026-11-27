import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/lib/utils';
import { Inbox, LucideIcon, Search } from 'lucide-react';
import React from 'react';
import { DataTablePagination } from './pagination';
import { DataTableToolbar } from './toolbar';

export interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  onSearchChange?: (value: string) => void;
  onFilterChange?: (columnId: string, values: (string | number | boolean)[]) => void;
  isLoading?: boolean;
  pagination?: {
    pageIndex: number;
    pageSize: number;
    onPageChange: (newPage: number) => void;
    onPageSizeChange: (newSize: number) => void;
    totalCount: number;
  };
  toolbar?: React.ReactNode;
  // Contenu affiché entre le bloc recherche/filtres et le bloc toolbar/boutons - pour
  // reproduire une barre d'outils RMANew où un élément (ex: dropdown de validation) est
  // centré entre les deux, plutôt que collé à droite avec le reste de `toolbar`.
  centerToolbar?: React.ReactNode;
  filterableColumns?: {
    id: string;
    title: string;
    options: { label: string; value: string | number | boolean; count?: number }[];
  }[];
  searchableColumns?: {
    id: string;
    title: string;
  }[];
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
  onRowClick?: (row: TData) => void;
  onRowDoubleClick?: (row: TData) => void;
  viewOptions?: boolean;
  name?: string;
  // RMANew (thead.filters) : une ligne de filtres, un champ texte par colonne, sous
  // l'en-tête - activée par défaut sur toutes les listes. Filtre les lignes chargées
  // (côté client) ; pour une liste paginée côté serveur, cela ne filtre donc que la page
  // affichée - pas un filtre serveur par colonne (voir la recherche globale existante pour
  // ça). Un ColumnDef peut se retirer via `enableColumnFilter: false`.
  columnFilterRow?: boolean;
}

export function DataTable<TData>({
  data,
  columns,
  pagination,
  toolbar,
  centerToolbar,
  onSearchChange,
  onFilterChange,
  isLoading = false,
  filterableColumns = [],
  searchableColumns = [],
  buttons = [],
  onRowClick,
  onRowDoubleClick,
  viewOptions,
  name,
  columnFilterRow = true,
}: DataTableProps<TData>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = React.useState<SortingState>([]);

  // Largeur de colonne opt-in : seules les colonnes qui déclarent explicitement `size`
  // dans leur ColumnDef (ex: Buildings.tsx) sont figées à cette largeur - les autres
  // tables de l'app gardent leur layout auto actuel inchangé. Le libellé d'en-tête peut
  // toujours retomber sur deux lignes (comportement par défaut, pas de nowrap forcé) -
  // c'est justement ce qui permet de garder les colonnes étroites quand seul l'en-tête
  // est long ("Charges annuelles (MAD)") mais pas le contenu des cellules ; le contenu
  // des cellules gère lui-même son propre nowrap/troncature (voir Buildings.tsx).
  const getColumnWidthStyle = (columnDef: ColumnDef<TData>) =>
    columnDef.size !== undefined ? { width: columnDef.size, minWidth: columnDef.size } : undefined;

  const table = useReactTable({
    data,
    columns,
    // TanStack's per-column default filter ('auto') picks a strategy from the raw
    // value's type - for numbers that's inNumberRange (expects a [min, max] tuple), not
    // substring search, so a plain typed value like "18" silently matched nothing on
    // numeric columns (e.g. Montant). Force substring search everywhere by default,
    // like RMANew's per-column boxes - a column can still opt out via `filterFn` in its
    // own ColumnDef.
    defaultColumn: { filterFn: 'includesString' },
    manualPagination: !!pagination,
    pageCount: pagination ? Math.ceil(pagination.totalCount / pagination.pageSize) : undefined,
    state: {
      pagination: pagination
        ? { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }
        : { pageIndex: 0, pageSize: 10 },
      sorting,
      columnVisibility,
      columnFilters,
      rowSelection,
    },
    onPaginationChange: pagination
      ? (updater) => {
          if (typeof updater === 'function') {
            const newState = updater({
              pageIndex: pagination.pageIndex,
              pageSize: pagination.pageSize,
            });
            pagination.onPageChange(newState.pageIndex);
            pagination.onPageSizeChange(newState.pageSize);
          } else {
            pagination.onPageChange(updater.pageIndex);
            pagination.onPageSizeChange(updater.pageSize);
          }
        }
      : undefined,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });
  // Hauteur de la zone de défilement : de son bord haut jusqu'au bas de la fenêtre, moins la place de la
  // pagination collée en bas (≈ 56 px) , de la marge de la carte et du pied de page de l'application. Mesurée à chaque rendu (l'en-tête de page
  // change de hauteur d'un écran à l'autre : filtre actif, description longue...) et à chaque redimensionnement.
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [zoneHeight, setZoneHeight] = React.useState<number | undefined>(undefined);
  const measureZone = React.useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const h = Math.max(240, Math.round(window.innerHeight - top - 172));
    setZoneHeight((prev) => (prev === h ? prev : h));
  }, []);
  React.useLayoutEffect(() => {
    measureZone();
  });
  React.useEffect(() => {
    window.addEventListener('resize', measureZone);
    return () => window.removeEventListener('resize', measureZone);
  }, [measureZone]);

  return (
    <div className='mt-5 space-y-4 border-t border-border/60 pt-5'>
      <DataTableToolbar
          table={table}
          filterableColumns={filterableColumns}
          searchableColumns={searchableColumns}
          buttons={buttons}
          viewOptions={viewOptions}
          onSearchChange={onSearchChange}
          onFilterChange={onFilterChange}
          name={name}
          centerToolbar={centerToolbar}
          pagination={pagination}
        >
          {toolbar}
      </DataTableToolbar>
      {/* Les listes larges (beaucoup de colonnes, ex: Actifs) débordaient de la page
          entière plutôt que de rester contenues dans leur propre zone de défilement - la
          page (et la sidebar/le header avec elle) défilait horizontalement au lieu du seul
          tableau. Pas de overflow-x-auto ici : <Table> l'applique déjà sur son propre div
          interne (voir components/ui/table.tsx) - l'empiler ici n'aurait fait qu'imbriquer
          deux zones de défilement pour rien. Cette div n'apporte que la bordure visuelle. */}
      <div ref={wrapRef} className='overflow-hidden rounded-xl border bg-card shadow-sm'>
        {/* Zone de défilement à hauteur limitée (hauteur de la fenêtre moins l'en-tête de page et la pagination) :
            la barre de défilement horizontale reste visible en bas de l'écran même avec 20 lignes, et l'en-tête
            des colonnes reste collé en haut pendant le défilement vertical. */}
        <Table containerClassName='overflow-auto' containerStyle={{ maxHeight: zoneHeight }}>
          <TableHeader className='sticky top-0 z-10'>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    style={getColumnWidthStyle(header.column.columnDef)}
                    className={cn(
                      'h-11 border-b bg-muted/70 px-3 text-xs font-semibold tracking-wide text-muted-foreground',
                      header.column.columnDef.size !== undefined && 'leading-tight',
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
            {columnFilterRow &&
              table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={`${headerGroup.id}-filters`} className='hover:bg-transparent'>
                  {headerGroup.headers.map((header, headerIndex) => {
                    // getCanFilter() checks TanStack's own resolved `accessorFn` (populated
                    // for both accessorKey- and accessorFn-based columns) rather than the
                    // raw ColumnDef shape, so accessorFn columns (e.g. a badge whose
                    // displayed text is computed/derived) still get a working filter box.
                    const canFilter = !header.isPlaceholder && header.column.getCanFilter();
                    // RMANew (thead.filters, `.not(":eq(0),:eq(1),:eq(14)")`) skips only the
                    // very first (image/select) and very last (actions) column when adding a
                    // filter box to every column - everything else gets one, even columns
                    // with no real data yet (ex: Rendement), purely for visual alignment.
                    const isEdgeColumn = headerIndex === 0 || headerIndex === headerGroup.headers.length - 1;

                    return (
                      <TableHead
                        key={`${header.id}-filter`}
                        style={getColumnWidthStyle(header.column.columnDef)}
                        className='bg-muted/30 px-3 py-1.5'
                      >
                        {!header.isPlaceholder &&
                          (canFilter ? (
                            <div className='relative'>
                              <span className='pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground'>
                                <Search className='h-3 w-3' />
                              </span>
                              <Input
                                value={(header.column.getFilterValue() as string) ?? ''}
                                onChange={(e) => header.column.setFilterValue(e.target.value || undefined)}
                                className='h-7 w-full border-border/60 bg-background/70 pl-6 text-xs shadow-none focus-visible:ring-1'
                              />
                            </div>
                          ) : (
                            !isEdgeColumn && (
                              <div className='relative'>
                                <span className='pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/50'>
                                  <Search className='h-3 w-3' />
                                </span>
                                <Input
                                  disabled
                                  className='h-7 w-full border-border/40 bg-background/40 pl-6 text-xs shadow-none'
                                />
                              </div>
                            )
                          ))}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Lignes fantômes : la liste garde sa forme pendant le chargement (au lieu d'un grand logo qui tourne).
              Array.from({ length: Math.min(pagination?.pageSize ?? 8, 8) }, (_, rowIndex) => (
                <TableRow key={`skeleton-${rowIndex}`} className='hover:bg-transparent'>
                  {table.getVisibleLeafColumns().map((column, colIndex) => (
                    <TableCell key={column.id} className='px-3 py-3.5'>
                      <Skeleton
                        className='h-4 rounded-full'
                        style={{ width: `${colIndex === 0 ? 70 : 45 + ((rowIndex * 7 + colIndex * 11) % 40)}%` }}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={cn(
                    'border-border/60 transition-colors last:border-b-0 hover:bg-primary/[0.04]',
                    (onRowClick || onRowDoubleClick) && 'cursor-pointer',
                  )}
                  onClick={onRowClick ? () => onRowClick(row.original) : undefined}
                  onDoubleClick={
                    onRowDoubleClick ? () => onRowDoubleClick(row.original) : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={getColumnWidthStyle(cell.column.columnDef)} className='px-3 py-2.5'>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className='h-48 text-center'>
                  <div className='flex flex-col items-center justify-center gap-2 text-muted-foreground'>
                    <div className='rounded-full bg-muted p-3'>
                      <Inbox className='h-6 w-6' />
                    </div>
                    <p className='text-sm font-medium'>Aucune donnée disponible</p>
                    <p className='text-xs'>Aucun élément à afficher pour le moment.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} pagination={pagination} isLoading={isLoading} />
    </div>
  );
}
