import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Chip, fmtDate, RowActions, StatusPill, Tone } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { SuspensionResponse } from '@/store/features/leasing/suspension-schemas';
import {
  deleteSuspension,
  getAllSuspensions,
  resetSuspension,
  setSuspension,
} from '@/store/features/leasing/suspensionsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Lock, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const STATUT_TONE: Record<string, Tone> = {
  Nouveau: 'info',
  'En instance': 'warning',
  Validée: 'success',
};

const Suspensions = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.suspensions,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SuspensionResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllSuspensions({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllSuspensions({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: SuspensionResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteSuspension(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const openSuspension = (item: SuspensionResponse, mode: 'details' | 'modifier') => {
    dispatch(setSuspension(item));
    navigate(`${mode}/${item.numero}`);
  };

  // Colonnes de RMANew (ListGestionSuspension) : N° contrats, Date suspension, Statut, Date reprise, Détails.
  const columns: ColumnDef<SuspensionResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° contrats' sorting />,
      cell: ({ row }) =>
        row.original.numContratLocations ? (
          <Chip className='font-mono'>{row.original.numContratLocations}</Chip>
        ) : (
          <span className='text-muted-foreground'>—</span>
        ),
    },
    {
      id: 'dateSuspension',
      accessorFn: (row) => fmtDate(row.dateSuspension),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date suspension' />,
      cell: ({ row }) => <span className='whitespace-nowrap font-medium'>{fmtDate(row.original.dateSuspension) || '—'}</span>,
    },
    {
      accessorKey: 'statutValidation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Statut' />,
      cell: ({ row }) => (
        <StatusPill label={row.original.statutValidation} tone={STATUT_TONE[row.original.statutValidation] ?? 'neutral'} />
      ),
    },
    {
      id: 'dateArretSuspension',
      accessorFn: (row) => fmtDate(row.dateArretSuspension),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date reprise' />,
      cell: ({ row }) =>
        row.original.dateArretSuspension ? (
          <span className='whitespace-nowrap'>{fmtDate(row.original.dateArretSuspension)}</span>
        ) : (
          <span className='text-muted-foreground'>En cours</span>
        ),
    },
    {
      id: 'details',
      size: 96,
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => openSuspension(row.original, 'modifier')}
          onDelete={() => handleDelete(row.original)}
          deleteLabel='Désactiver'
        />
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllSuspensions({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllSuspensions({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Lock}
            title='Gestion suspension'
            description='Gérer les suspensions de baux'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetSuspension());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'numContratLocations', title: 'N° contrat' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowClick={(item) => openSuspension(item, 'details')}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver cette suspension pour "${selectedItem?.numContratLocations || ''}" ?`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Désactiver
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default Suspensions;
