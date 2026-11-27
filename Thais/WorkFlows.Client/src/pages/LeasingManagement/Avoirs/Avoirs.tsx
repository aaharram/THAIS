import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
  AvatarCell,
  Chip,
  fmtDate,
  KPI_TONES,
  KpiCard,
  KpiStrip,
  MoneyCell,
  PrimarySecondary,
  StatusPill,
  fmtMoney,
} from '@/components/table/list-cells';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { AvoirResponse } from '@/store/features/leasing/avoir-schemas';
import { getAllAvoirs } from '@/store/features/leasing/avoirsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { CheckCircle2, Plus, Receipt, Wallet } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

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

  // Synthèse de la page affichée (la liste est courte ; pas de requête supplémentaire).
  const kpis = useMemo(
    () => ({
      total: totalCount,
      montant: allItems.reduce((s, a) => s + (a.montant ?? 0), 0),
      soldees: allItems.filter((a) => a.etatFactureApres === 'Payée').length,
    }),
    [allItems, totalCount],
  );

  // Colonnes de RMANew (ListEleaseAvoir) : Contrat, Locataire, Actif, Date avoir, Montant avoir, Solde restant, État facture.
  const columns: ColumnDef<AvoirResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' sorting />,
      cell: ({ row }) =>
        row.original.numContratLocations ? (
          <Chip className='font-mono'>{row.original.numContratLocations}</Chip>
        ) : (
          <span className='text-muted-foreground'>—</span>
        ),
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <AvatarCell name={row.original.nomLocataire} />,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      id: 'dateAvoir',
      accessorFn: (row) => fmtDate(row.dateAvoir),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date avoir' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateAvoir) || '—'}</span>,
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Montant avoir</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant} tone='success' />,
    },
    {
      accessorKey: 'montantFactureApres',
      header: () => <div className='text-right'>Solde restant</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantFactureApres} />,
    },
    {
      accessorKey: 'etatFactureApres',
      header: () => <div>État facture</div>,
      cell: ({ row }) => (
        <StatusPill label={row.original.etatFactureApres} tone={row.original.etatFactureApres === 'Payée' ? 'success' : 'info'} />
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

          <KpiStrip>
            <KpiCard icon={Receipt} label='Avoirs émis' value={String(kpis.total)} hint='au total' tone={KPI_TONES.primary} />
            <KpiCard
              icon={Wallet}
              label='Montant des avoirs'
              value={`${fmtMoney(kpis.montant)} MAD`}
              hint='sur la page affichée'
              tone={KPI_TONES.sky}
            />
            <KpiCard
              icon={CheckCircle2}
              label='Factures soldées'
              value={String(kpis.soldees)}
              hint='par un avoir, sur la page affichée'
              tone={KPI_TONES.green}
            />
          </KpiStrip>
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
