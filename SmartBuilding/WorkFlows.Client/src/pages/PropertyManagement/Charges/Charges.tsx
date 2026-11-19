import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { ChargeResponse } from '@/store/features/property-management/charge-schemas';
import { deleteCharge, getAllCharges, resetCharge, setCharge } from '@/store/features/property-management/chargesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const ecartClass = (ecart?: number | null) => {
  if (ecart == null) return 'text-gray-500';
  return ecart > 0 ? 'text-red-600' : 'text-green-700';
};

const Charges = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.chargesPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChargeResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllCharges({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllCharges({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: ChargeResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteCharge(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
  const fmtMoney = (m?: number | null) => (m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2 }));

  const columns: ColumnDef<ChargeResponse>[] = [
    {
      accessorKey: 'codeCharge',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Code' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.codeCharge || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomTypologieCharge',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Typologie' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomTypologieCharge || '-'}</div>,
    },
    {
      accessorKey: 'annee',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Année' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.annee}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prévu' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMoney(row.original.montant)}</div>,
    },
    {
      accessorKey: 'realisation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Réel' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMoney(row.original.realisation)}</div>,
    },
    {
      accessorKey: 'ecart',
      header: () => <div className='text-center'>Écart</div>,
      cell: ({ row }) => (
        <div className={`text-center font-semibold ${ecartClass(row.original.ecart)}`}>
          {fmtMoney(row.original.ecart)}
        </div>
      ),
    },
    {
      id: 'dateDecaissement',
      accessorFn: (row) => fmtDate(row.dateDecaissement),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Décaissement' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateDecaissement)}</div>,
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
              dispatch(setCharge(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllCharges({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllCharges({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Banknote}
            title='Charges / Budgets'
            description='Suivi des charges prévues et réelles par actif'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetCharge());
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
            dispatch(setCharge(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver cette charge "${selectedItem?.codeCharge || ''}" ?`}
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

export default Charges;
