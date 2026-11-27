import { BaseDialog } from '@/components/dialog/dialog';
import { ImportMenu } from '@/components/import/import-menu';
import { TYPOLOGIES_CHARGE_IMPORT } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { ActionButton } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { TypologieChargeResponse } from '@/store/features/configuration/typologieCharge-schemas';
import {
  deleteTypologieCharge,
  getAllTypologiesCharge,
  resetTypologieCharge,
  setTypologieCharge,
} from '@/store/features/configuration/typologiesChargeSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { DollarSign, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const TypologiesCharge = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.cfgTypologiesCharge,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TypologieChargeResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllTypologiesCharge({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllTypologiesCharge({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: TypologieChargeResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteTypologieCharge(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<TypologieChargeResponse>[] = [
    {
      accessorKey: 'compte',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Compte' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.compte || '-'}</div>,
    },
    {
      accessorKey: 'typologie',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Typologie' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('typologie')}</div>,
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Description' />,
      cell: ({ row }) => (
        <div className='font-medium max-w-md truncate'>{row.original.description || '-'}</div>
      ),
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
              dispatch(setTypologieCharge(row.original));
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
      dispatch(getAllTypologiesCharge({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllTypologiesCharge({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={DollarSign}
            title='Typologies de charge'
            actions={<ImportMenu config={TYPOLOGIES_CHARGE_IMPORT} onImported={() => dispatch(getAllTypologiesCharge({ pageNumber: 1, pageSize, search }))} />}
            description='Gérer les typologies de charge'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetTypologieCharge());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'typologie', title: 'Typologie' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setTypologieCharge(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer "${selectedItem?.typologie || ''}" ?`}
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

export default TypologiesCharge;
