import { BaseDialog } from '@/components/dialog/dialog';
import { ImportMenu } from '@/components/import/import-menu';
import { FILIALES_IMPORT } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { ActionButton } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { FilialeResponse } from '@/store/features/configuration/filiale-schemas';
import {
  deleteFiliale,
  getAllFiliales,
  resetFiliale,
  setFiliale,
} from '@/store/features/configuration/filialesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Filiales = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.cfgFiliales,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FilialeResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllFiliales({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllFiliales({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: FilialeResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteFiliale(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<FilialeResponse>[] = [
    {
      accessorKey: 'nom',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Filiale' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('nom')}</div>,
    },
    {
      accessorKey: 'numeroReference',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Numero de Référence' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numeroReference || '-'}</div>,
    },
    {
      id: 'date',
      accessorFn: (row) => (row.date ? new Date(row.date).toLocaleDateString('fr-FR') : ''),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) =>
        row.original.date ? (
          <div className='font-medium'>
            {new Date(row.original.date).toLocaleDateString('fr-FR')}
          </div>
        ) : (
          '-'
        ),
    },
    {
      accessorKey: 'rib',
      header: ({ column }) => <DataTableColumnHeader column={column} title='RIB' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.rib || '-'}</div>,
    },
    {
      accessorKey: 'nomBanque',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Banque' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBanque || '-'}</div>,
    },
    {
      accessorKey: 'modeReglement',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Mode de règlement' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.modeReglement || '-'}</div>,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <ActionButton
            icon={Pencil}
            label="Modifier"
            onClick={() => {
              dispatch(setFiliale(row.original));
              navigate(`modifier/${row.original.numero}`);
            }}
            className='text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600'
          />
          <ActionButton
            icon={Trash2}
            label="Supprimer"
            onClick={() => {
              handleDelete(row.original);
            }}
            className='text-red-600 hover:bg-red-500/10 hover:text-red-600'
          />
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) =>
      dispatch(getAllFiliales({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllFiliales({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Building2}
            title='Filiales'
            actions={<ImportMenu config={FILIALES_IMPORT} onImported={() => dispatch(getAllFiliales({ pageNumber: 1, pageSize, search }))} />}
            description='Gérer les filiales'
            buttons={[
              {
                label: 'Ajouter une filiale',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetFiliale());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nom', title: 'Filiale' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setFiliale(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer "${selectedItem?.nom || ''}" ?`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Supprimer
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default Filiales;
