import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Chip, KPI_TONES, KpiCard, KpiStrip, MoneyCell, PrimarySecondary, RowActions, fmtMoney as fmtKpi } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { CHARGES_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { ChargeResponse } from '@/store/features/property-management/charge-schemas';
import { deleteCharge, getAllCharges, resetCharge, setCharge } from '@/store/features/property-management/chargesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, Plus, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const ecartClass = (ecart?: number | null) => {
  if (ecart == null) return 'text-gray-500';
  return ecart > 0 ? 'text-red-600' : 'text-emerald-700 dark:text-emerald-400';
};

const Charges = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.chargesPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ChargeResponse | null>(null);
  const [search, setSearch] = useState('');
  // Tous les enregistrements (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<ChargeResponse[] | null>(null);
  const loadStats = useCallback(() => {
    fetchAllPages<ChargeResponse>('/api/charges')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    const prevu = stats.reduce((s, c) => s + (c.montant ?? 0), 0);
    const reel = stats.reduce((s, c) => s + (c.realisation ?? 0), 0);
    // Même règle que la colonne « Écart » : seules les lignes déjà réalisées comptent.
    return { total: stats.length, prevu, reel, ecart: stats.reduce((s, c) => s + (c.ecart ?? 0), 0) };
  }, [stats]);

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
      dispatch(deleteCharge(selectedItem.numero)).then(() => loadStats());
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
      cell: ({ row }) => row.original.codeCharge ? <Chip className='font-mono'>{row.original.codeCharge}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      accessorKey: 'nomTypologieCharge',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Typologie' />,
      cell: ({ row }) => row.original.nomTypologieCharge ? <Chip>{row.original.nomTypologieCharge}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'annee',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Année' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.annee}</div>,
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Prévu</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant} />,
    },
    {
      accessorKey: 'realisation',
      header: () => <div className='text-right'>Réel</div>,
      cell: ({ row }) => <MoneyCell value={row.original.realisation} />,
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
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateDecaissement)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => {
            dispatch(setCharge(row.original));
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
            actions={<ImportMenu config={CHARGES_IMPORT} onImported={() => dispatch(getAllCharges({ pageNumber: 1, pageSize, search }))} />}
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

          <KpiStrip>
            <KpiCard
              icon={Receipt}
              label='Lignes de charges'
              value={kpis ? String(kpis.total) : '—'}
              hint={'au total'}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={Wallet}
              label='Budget prévu'
              value={kpis ? `${fmtKpi(kpis.prevu)} MAD` : '—'}
              hint={'toutes années'}
              tone={KPI_TONES.sky}
            />
            <KpiCard
              icon={Banknote}
              label='Réalisé'
              value={kpis ? `${fmtKpi(kpis.reel)} MAD` : '—'}
              hint={'montants décaissés'}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={TrendingUp}
              label='Écart'
              value={kpis ? `${fmtKpi(kpis.ecart)} MAD` : '—'}
              hint={kpis && kpis.ecart > 0 ? 'dépassement du budget' : 'sous le budget'}
              tone={kpis && kpis.ecart > 0 ? KPI_TONES.red : KPI_TONES.green}
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
