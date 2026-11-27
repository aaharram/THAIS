import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { KPI_TONES, KpiCard, KpiStrip, MoneyCell, PrimarySecondary, RowActions, fmtMoney as fmtKpi } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { ProvisionResponse } from '@/store/features/patrimoine/provision-schemas';
import {
  deleteProvision,
  getAllProvisions,
  resetProvision,
} from '@/store/features/patrimoine/provisionsSlice';
import { getBuildingById } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, Building2, Landmark, Plus, Wallet, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const Provisions = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.provisions,
  );
  const buildingFilter = useAppSelector((state) => state.buildings.item);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProvisionResponse | null>(null);
  const [search, setSearch] = useState('');
  // Tous les enregistrements (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<ProvisionResponse[] | null>(null);
  const loadStats = useCallback(() => {
    fetchAllPages<ProvisionResponse>('/api/provisions')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    return {
      total: stats.length,
      montant: stats.reduce((s, p) => s + (p.montantProvision ?? 0), 0),
      actifs: new Set(stats.map((p) => p.noBuilding)).size,
    };
  }, [stats]);

  const buildingId = Number(searchParams.get('building')) || 0;

  useEffect(() => {
    if (buildingId) {
      dispatch(getBuildingById(buildingId));
    }
  }, [buildingId, dispatch]);

  useEffect(() => {
    dispatch(
      getAllProvisions({
        pageNumber: 1,
        pageSize: 10,
        search,
        filters: buildingId ? { NoBuilding: [buildingId] } : undefined,
      }),
    );
  }, [dispatch, search, buildingId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(
      getAllProvisions({
        pageNumber: 1,
        pageSize,
        search: value,
        filters: buildingId ? { NoBuilding: [buildingId] } : undefined,
      }),
    );
  };

  const clearBuildingFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('building');
      return next;
    });
  };

  const handleDelete = (item: ProvisionResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteProvision(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<ProvisionResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      accessorKey: 'montantProvision',
      header: () => <div className='text-right'>Montant Provision</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantProvision} />,
    },
    {
      id: 'dateProvision',
      accessorFn: (row) => fmtDate(row.dateProvision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Commité' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateProvision)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions onEdit={() => navigate(`modifier/${row.original.numero}`)} onDelete={() => handleDelete(row.original)} />
      ),
    },
  ];

  const filters = buildingId ? { NoBuilding: [buildingId] } : undefined;

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) =>
      dispatch(getAllProvisions({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllProvisions({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Wallet}
            title='Provisions'
            description={
              buildingId && buildingFilter
                ? `Provisions rattachées à "${buildingFilter.designation}"`
                : 'Gérer les provisions par actif'
            }
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetProvision());
                  navigate(buildingId ? `ajouter?building=${buildingId}` : 'ajouter');
                },
              },
            ]}
          />
          {buildingId > 0 && (
            <button
              type='button'
              onClick={clearBuildingFilter}
              className='inline-flex items-center gap-1.5 text-sm text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-3 py-1'
            >
              Filtré par actif
              <X className='h-3.5 w-3.5' />
            </button>
          )}

          <KpiStrip>
            <KpiCard
              icon={Landmark}
              label='Provisions'
              value={kpis ? String(kpis.total) : '—'}
              hint={'au total'}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={Banknote}
              label='Montant provisionné'
              value={kpis ? `${fmtKpi(kpis.montant)} MAD` : '—'}
              hint={'toutes provisions'}
              tone={KPI_TONES.sky}
            />
            <KpiCard
              icon={Building2}
              label='Actifs concernés'
              value={kpis ? String(kpis.actifs) : '—'}
              hint={'avec au moins une provision'}
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
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description='Êtes-vous sûr de vouloir supprimer cette provision ?'
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

export default Provisions;
