import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { RevisionLoyerResponse, RevisionLoyerSummary } from '@/store/features/leasing/revision-loyer-schemas';
import { getRevisionsLoyerHistorique, getRevisionsLoyerSummary } from '@/store/features/leasing/revisionsLoyerSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const RevisionsLoyers = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, historique, historiqueTotalCount, loading } = useAppSelector(
    (state) => state.revisionsLoyer,
  );
  const [search, setSearch] = useState('');

  const noLocation = Number(searchParams.get('bail')) || 0;
  const drillDown = noLocation > 0;
  const current = allItems.find((s) => s.noLocation === noLocation);

  useEffect(() => {
    if (!drillDown) {
      dispatch(getRevisionsLoyerSummary({ pageNumber: 1, pageSize: 10, search }));
    }
  }, [dispatch, search, drillDown]);

  useEffect(() => {
    if (drillDown) {
      dispatch(getRevisionsLoyerHistorique({ pageNumber: 1, pageSize: 100, filters: { NoLocation: [noLocation] } }));
    }
  }, [dispatch, drillDown, noLocation]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getRevisionsLoyerSummary({ pageNumber: 1, pageSize, search: value }));
  };

  const backToSummary = () => setSearchParams({});

  const summaryColumns: ColumnDef<RevisionLoyerSummary>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding}</div>,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocal || '-'}</div>,
    },
    {
      accessorKey: 'loyerActuel',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer actuel (MAD)' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.loyerActuel)}</div>,
    },
    {
      accessorKey: 'tauxApplicable',
      header: () => <div className='text-center'>Taux</div>,
      cell: ({ row }) => <div className='text-center font-medium'>{row.original.tauxApplicable}%</div>,
    },
    {
      accessorKey: 'loyerApresRevision',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer après révision' />,
      cell: ({ row }) => (
        <div className='font-medium text-sky-700 dark:text-sky-400'>{fmtMontant(row.original.loyerApresRevision)}</div>
      ),
    },
    {
      id: 'dateDerniereRevision',
      accessorFn: (row) => fmtDate(row.dateDerniereRevision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Dernière révision' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateDerniereRevision)}</div>,
    },
    {
      id: 'dateProchaineRevision',
      accessorFn: (row) => fmtDate(row.dateProchaineRevision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prochaine échéance' />,
      cell: ({ row }) => (
        <span
          className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
            row.original.eligibleRevision ? 'bg-red-500/10 text-red-700 dark:text-red-400' : 'text-gray-600 bg-gray-100'
          }`}
        >
          {fmtDate(row.original.dateProchaineRevision)}
        </span>
      ),
    },
    {
      id: 'historique',
      header: () => <div className='text-center'>Historique</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20'
            onClick={(e) => {
              e.stopPropagation();
              setSearchParams({ bail: String(row.original.noLocation) });
            }}
          >
            {row.original.nombreRevisions}
          </button>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <Button
            size='sm'
            variant={row.original.eligibleRevision ? 'default' : 'secondary'}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`ajouter?noLocation=${row.original.noLocation}`);
            }}
          >
            Réviser
          </Button>
        </div>
      ),
    },
  ];

  const historiqueColumns: ColumnDef<RevisionLoyerResponse>[] = [
    {
      id: 'dateRevision',
      accessorFn: (row) => fmtDate(row.dateRevision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date révision' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateRevision)}</div>,
    },
    {
      accessorKey: 'ancienLoyer',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ancien loyer' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.ancienLoyer)}</div>,
    },
    {
      accessorKey: 'nouveauLoyer',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nouveau loyer' />,
      cell: ({ row }) => <div className='font-medium text-sky-700 dark:text-sky-400'>{fmtMontant(row.original.nouveauLoyer)}</div>,
    },
    {
      accessorKey: 'tauxRevision',
      header: () => <div className='text-center'>Taux</div>,
      cell: ({ row }) => <div className='text-center font-medium'>{row.original.tauxRevision ?? '-'}%</div>,
    },
    {
      id: 'dateProchaineRevision',
      accessorFn: (row) => fmtDate(row.dateProchaineRevision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prochaine échéance' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateProchaineRevision)}</div>,
    },
    {
      accessorKey: 'reliquat',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reliquat' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.reliquat)}</div>,
    },
    {
      accessorKey: 'notes',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Notes' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.notes || '-'}</div>,
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getRevisionsLoyerSummary({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getRevisionsLoyerSummary({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={TrendingUp}
            title='Révisions loyers'
            description={
              drillDown
                ? `Historique des révisions — ${current?.nomLocataire ?? ''}`
                : 'Suivi des révisions triennales de loyer par bail actif'
            }
            buttons={
              drillDown
                ? [{ label: 'Retour', icon: ArrowLeft, variant: 'secondary', onClick: backToSummary }]
                : []
            }
          />
        </div>

        {drillDown ? (
          <DataTable
            columns={historiqueColumns}
            data={historique}
            isLoading={loading}
            name={`${historiqueTotalCount} révision(s)`}
          />
        ) : (
          <DataTable
            columns={summaryColumns}
            data={allItems}
            searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
            onSearchChange={handleSearchChange}
            isLoading={loading}
            pagination={pagination}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default RevisionsLoyers;
