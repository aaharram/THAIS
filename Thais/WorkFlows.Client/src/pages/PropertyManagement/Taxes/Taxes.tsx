import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Chip, KPI_TONES, KpiCard, KpiStrip, MoneyCell, PrimarySecondary, RowActions, fmtMoney as fmtKpi } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { TAXES_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { TaxeResponse } from '@/store/features/property-management/taxe-schemas';
import { deleteTaxe, getAllTaxes, resetTaxe, setTaxe } from '@/store/features/property-management/taxesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, CheckCircle2, Landmark, Plus, Receipt, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const Taxes = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.taxesPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TaxeResponse | null>(null);
  const [search, setSearch] = useState('');
  // Tous les enregistrements (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<TaxeResponse[] | null>(null);
  const loadStats = useCallback(() => {
    fetchAllPages<TaxeResponse>('/api/taxes')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    const payees = stats.filter((t) => t.paye);
    const ouvertes = stats.filter((t) => !t.paye);
    return {
      total: stats.length,
      montant: stats.reduce((s, t) => s + (t.montantTaxe ?? 0), 0),
      paye: payees.reduce((s, t) => s + (t.montantTaxe ?? 0), 0),
      reste: ouvertes.reduce((s, t) => s + (t.montantTaxe ?? 0), 0),
      nbOuvertes: ouvertes.length,
    };
  }, [stats]);

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
      dispatch(deleteTaxe(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<TaxeResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomLocal} />,
    },
    {
      accessorKey: 'nomType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => row.original.nomType ? <Chip>{row.original.nomType}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'annee',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Année' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.annee}</div>,
    },
    {
      accessorKey: 'montantTaxe',
      header: () => <div className='text-right'>Montant</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantTaxe} />,
    },
    {
      accessorKey: 'paye',
      header: () => <div className='text-center'>Payé</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
              row.original.paye ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-600 dark:text-slate-300'
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
        <RowActions
          onEdit={() => {
            dispatch(setTaxe(row.original));
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

          <KpiStrip>
            <KpiCard
              icon={Receipt}
              label='Taxes'
              value={kpis ? String(kpis.total) : '—'}
              hint={'au total'}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={Banknote}
              label='Montant total'
              value={kpis ? `${fmtKpi(kpis.montant)} MAD` : '—'}
              hint={'toutes années'}
              tone={KPI_TONES.sky}
            />
            <KpiCard
              icon={CheckCircle2}
              label='Payé'
              value={kpis ? `${fmtKpi(kpis.paye)} MAD` : '—'}
              hint={'taxes réglées'}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={Wallet}
              label='Reste à payer'
              value={kpis ? `${fmtKpi(kpis.reste)} MAD` : '—'}
              hint={kpis ? `${kpis.nbOuvertes} taxe(s) impayée(s)` : undefined}
              tone={KPI_TONES.amber}
            />
          </KpiStrip>
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
