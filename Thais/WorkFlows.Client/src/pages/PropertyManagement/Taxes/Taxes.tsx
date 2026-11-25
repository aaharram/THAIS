import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { TAXES_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { TaxeResponse } from '@/store/features/property-management/taxe-schemas';
import { deleteTaxe, getAllTaxes, resetTaxe, setTaxe } from '@/store/features/property-management/taxesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Landmark, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Taxes = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.taxesPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaxeResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllTaxes({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllTaxes({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: TaxeResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteTaxe(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtMoney = (m?: number | null) => (m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2 }));

  const columns: ColumnDef<TaxeResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocal || '-'}</div>,
    },
    {
      accessorKey: 'nomType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomType || '-'}</div>,
    },
    {
      accessorKey: 'annee',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Année' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.annee}</div>,
    },
    {
      accessorKey: 'montantTaxe',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMoney(row.original.montantTaxe)}</div>,
    },
    {
      accessorKey: 'paye',
      header: () => <div className='text-center'>Payé</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              row.original.paye ? 'text-green-700 bg-green-100' : 'text-gray-600 bg-gray-100'
            }`}
          >
            {row.original.paye ? 'Payé' : 'Impayé'}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-yellow-100'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setTaxe(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllTaxes({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllTaxes({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Landmark}
            actions={<ImportMenu config={TAXES_IMPORT} onImported={() => dispatch(getAllTaxes({ pageNumber: 1, pageSize, search }))} />}
            title='Taxes'
            description='Suivi des taxes par actif'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetTaxe());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setTaxe(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description='Êtes-vous sûr de vouloir désactiver cette taxe ?'
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

export default Taxes;
