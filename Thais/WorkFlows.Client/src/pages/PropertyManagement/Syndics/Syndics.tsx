import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { PrimarySecondary } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { SyndicImmeubleSummary } from '@/store/features/property-management/syndic-reunion-schemas';
import { getSyndicSummaryByBuilding, resetSyndicReunion } from '@/store/features/property-management/syndicReunionsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// RMANew (ListSyndicImmeuble.aspx) : une ligne par immeuble, le badge "Historique" ouvre
// la liste des réunions de cet immeuble ; "+" crée directement une réunion pour lui.
const Syndics = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { summaryItems, summaryTotalCount, summaryPageNumber, summaryPageSize, summaryLoading } = useAppSelector(
    (state) => state.syndicReunions,
  );
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getSyndicSummaryByBuilding({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getSyndicSummaryByBuilding({ pageNumber: 1, pageSize: summaryPageSize, search: value }));
  };

  const columns: ColumnDef<SyndicImmeubleSummary>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      accessorKey: 'nombreQuotePart',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nombre de quotes-parts' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nombreQuotePart ?? 0}</div>,
    },
    {
      id: 'historique',
      header: () => <div>Historique</div>,
      cell: ({ row }) => (
        <div className='flex items-center gap-2'>
          <button
            className='inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-sky-500/10 text-sky-700 dark:text-sky-400 text-xs font-bold hover:bg-sky-500/20'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/property-management/syndics/${row.original.noBuilding}/reunions`);
            }}
          >
            {row.original.nombreReunions}
          </button>
          <Button
            variant='ghost'
            size='sm'
            className='h-7 w-7 p-0'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(resetSyndicReunion());
              navigate(`/property-management/syndics/${row.original.noBuilding}/reunions/ajouter`);
            }}
          >
            <Plus className='h-4 w-4' />
          </Button>
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: summaryPageNumber - 1,
    pageSize: summaryPageSize,
    onPageChange: (newPage: number) =>
      dispatch(getSyndicSummaryByBuilding({ pageNumber: newPage + 1, pageSize: summaryPageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getSyndicSummaryByBuilding({ pageNumber: 1, pageSize: newSize, search })),
    totalCount: summaryTotalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Users} title='Gestion des syndics' description='Réunions de syndic par actif' />
        </div>

        <DataTable
          columns={columns}
          data={summaryItems}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          onSearchChange={handleSearchChange}
          isLoading={summaryLoading}
          pagination={pagination}
        />
      </CardContent>
    </Card>
  );
};

export default Syndics;
