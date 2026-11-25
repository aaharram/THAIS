import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { AvoirResponse } from '@/store/features/leasing/avoir-schemas';
import { getAllAvoirs } from '@/store/features/leasing/avoirsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Receipt } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const etatBadgeClass = (etat: string) => {
  if (etat === 'Payée') return 'text-green-700 bg-green-100';
  return 'text-blue-700 bg-blue-100';
};

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Avoirs = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.avoirs);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllAvoirs({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllAvoirs({ pageNumber: 1, pageSize, search: value }));
  };

  const columns: ColumnDef<AvoirResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      id: 'dateAvoir',
      accessorFn: (row) => fmtDate(row.dateAvoir),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date avoir' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateAvoir)}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant avoir (MAD)' />,
      cell: ({ row }) => <div className='font-medium text-blue-700'>{fmtMontant(row.original.montant)}</div>,
    },
    {
      accessorKey: 'montantFactureApres',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Solde restant (MAD)' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.montantFactureApres)}</div>,
    },
    {
      accessorKey: 'etatFactureApres',
      header: () => <div className='text-center'>État facture</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${etatBadgeClass(row.original.etatFactureApres)}`}
          >
            {row.original.etatFactureApres}
          </span>
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllAvoirs({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllAvoirs({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Receipt}
            title='Gestion des Avoirs'
            description='Notes de crédit émises sur des factures impayées'
            buttons={[
              {
                label: 'Émettre un avoir',
                icon: Plus,
                variant: 'default',
                onClick: () => navigate('ajouter'),
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
          pagination={pagination}
        />
      </CardContent>
    </Card>
  );
};

export default Avoirs;
