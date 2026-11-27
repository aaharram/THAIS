import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Chip, KPI_TONES, KpiCard, KpiStrip, MoneyCell, PrimarySecondary, RowActions, fmtMoney as fmtKpi } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { ASSURANCES_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { AssuranceResponse } from '@/store/features/property-management/assurance-schemas';
import {
  deleteAssurance,
  getAllAssurances,
  resetAssurance,
  setAssurance,
} from '@/store/features/property-management/assurancesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, FileCheck2, Hourglass, Plus, Shield, ShieldCheck } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const statutBadgeClass = (statut: string) => {
  if (statut === 'EnCours') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-300';
};

const Assurances = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.assurancesPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssuranceResponse | null>(null);
  const [search, setSearch] = useState('');
  // Tous les enregistrements (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<AssuranceResponse[] | null>(null);
  const loadStats = useCallback(() => {
    fetchAllPages<AssuranceResponse>('/api/assurances')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    const enCours = stats.filter((a) => a.statut === 'EnCours');
    return {
      total: stats.length,
      enCours: enCours.length,
      autres: stats.length - enCours.length,
      primes: enCours.reduce((s, a) => s + (a.montant ?? 0), 0),
    };
  }, [stats]);

  useEffect(() => {
    dispatch(getAllAssurances({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllAssurances({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: AssuranceResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteAssurance(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<AssuranceResponse>[] = [
    {
      accessorKey: 'numPolice',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Police' sorting />,
      cell: ({ row }) => row.original.numPolice ? <Chip className='font-mono'>{row.original.numPolice}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'nomAssureur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Assureur' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomAssureur} />,
    },
    {
      accessorKey: 'nomCourtier',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Courtier' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomCourtier} />,
    },
    {
      accessorKey: 'typeCouverture',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Couverture' />,
      cell: ({ row }) => row.original.typeCouverture ? <Chip>{row.original.typeCouverture}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      id: 'dateEffetContrat',
      accessorFn: (row) => fmtDate(row.dateEffetContrat),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'effet" />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateEffetContrat)}</span>,
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Montant</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant} />,
    },
    {
      accessorKey: 'statut',
      header: () => <div className='text-center'>Statut</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statutBadgeClass(row.original.statut)}`}
          >
            {row.original.statut}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => {
            dispatch(setAssurance(row.original));
            navigate(`modifier/${row.original.numero}`);
          }}
          onDelete={() => handleDelete(row.original)}
        />
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllAssurances({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllAssurances({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Shield}
            actions={<ImportMenu config={ASSURANCES_IMPORT} onImported={() => dispatch(getAllAssurances({ pageNumber: 1, pageSize, search }))} />}
            title='Assurances'
            description="Gérer les polices d'assurance"
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetAssurance());
                  navigate('ajouter');
                },
              },
            ]}
          />

          <KpiStrip>
            <KpiCard
              icon={ShieldCheck}
              label='Polices'
              value={kpis ? String(kpis.total) : '—'}
              hint={'au total'}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={FileCheck2}
              label='En cours'
              value={kpis ? String(kpis.enCours) : '—'}
              hint={'contrats actifs'}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={Hourglass}
              label='Terminées'
              value={kpis ? String(kpis.autres) : '—'}
              hint={'échues ou résiliées'}
              tone={KPI_TONES.amber}
            />
            <KpiCard
              icon={Banknote}
              label='Primes en cours'
              value={kpis ? `${fmtKpi(kpis.primes)} MAD` : '—'}
              hint={'polices en cours'}
              tone={KPI_TONES.sky}
            />
          </KpiStrip>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'numPolice', title: 'N° Police' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setAssurance(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver cette police "${selectedItem?.numPolice || ''}" ?`}
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

export default Assurances;
