import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
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
import { Lock, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

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

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<SuspensionResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° contrats' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
    },
    {
      id: 'dateSuspension',
      accessorFn: (row) => fmtDate(row.dateSuspension),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date suspension' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateSuspension)}</div>,
    },
    {
      accessorKey: 'statutValidation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Statut' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.statutValidation}</div>,
    },
    {
      id: 'dateArretSuspension',
      accessorFn: (row) => fmtDate(row.dateArretSuspension),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date reprise' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateArretSuspension)}</div>,
    },
    {
      id: 'details',
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-yellow-100'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setSuspension(row.original));
              navigate(`modifier/${row.original.numero}`);
            }}
          >
            <Pencil className='h-4 w-4 text-yellow-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-red-100'
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original);
            }}
          >
            <Trash2 className='h-4 w-4 text-red-600' />
          </Button>
        </div>
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
          onRowDoubleClick={(item) => {
            dispatch(setSuspension(item));
            navigate(`details/${item.numero}`);
          }}
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
