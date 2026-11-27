import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { AvatarCell, KPI_TONES, KpiCard, KpiStrip, PrimarySecondary, RowActions } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { RECLAMATIONS_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { ReclamationResponse } from '@/store/features/property-management/reclamation-schemas';
import {
  deleteReclamation,
  getAllReclamations,
  resetReclamation,
  setReclamation,
} from '@/store/features/property-management/reclamationsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, CheckCircle2, Hourglass, MessageSquareWarning, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const etatBadgeClass = (etat: string) => {
  switch (etat) {
    case 'Résolue':
    case 'Fermée':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    case 'En traitement':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-300';
  }
};

const Reclamations = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.reclamationsPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReclamationResponse | null>(null);
  const [search, setSearch] = useState('');
  // Tous les enregistrements (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<ReclamationResponse[] | null>(null);
  const loadStats = useCallback(() => {
    fetchAllPages<ReclamationResponse>('/api/reclamations')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    const closes = stats.filter((r) => r.etat === 'Résolue' || r.etat === 'Fermée');
    return {
      total: stats.length,
      ouvertes: stats.length - closes.length,
      enTraitement: stats.filter((r) => r.etat === 'En traitement').length,
      closes: closes.length,
    };
  }, [stats]);

  useEffect(() => {
    dispatch(getAllReclamations({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllReclamations({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: ReclamationResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteReclamation(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<ReclamationResponse>[] = [
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
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <AvatarCell name={row.original.nomLocataire} />,
    },
    {
      accessorKey: 'objet',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Objet' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.objet || '-'}</div>,
    },
    {
      id: 'dateReclamation',
      accessorFn: (row) => fmtDate(row.dateReclamation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateReclamation)}</span>,
    },
    {
      accessorKey: 'etat',
      header: () => <div className='text-center'>État</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${etatBadgeClass(row.original.etat)}`}
          >
            {row.original.etat}
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
            dispatch(setReclamation(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllReclamations({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllReclamations({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={MessageSquareWarning}
            actions={<ImportMenu config={RECLAMATIONS_IMPORT} onImported={() => dispatch(getAllReclamations({ pageNumber: 1, pageSize, search }))} />}
            title='Suivi Réclamation'
            description='Réclamations des locataires'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetReclamation());
                  navigate('ajouter');
                },
              },
            ]}
          />

          <KpiStrip>
            <KpiCard
              icon={MessageSquareWarning}
              label='Réclamations'
              value={kpis ? String(kpis.total) : '—'}
              hint={'au total'}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={AlertTriangle}
              label='Ouvertes'
              value={kpis ? String(kpis.ouvertes) : '—'}
              hint={'à traiter'}
              tone={KPI_TONES.red}
            />
            <KpiCard
              icon={Hourglass}
              label='En traitement'
              value={kpis ? String(kpis.enTraitement) : '—'}
              hint={'prises en charge'}
              tone={KPI_TONES.amber}
            />
            <KpiCard
              icon={CheckCircle2}
              label='Résolues ou fermées'
              value={kpis ? String(kpis.closes) : '—'}
              hint={'clôturées'}
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
          onRowDoubleClick={(item) => {
            dispatch(setReclamation(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer cette réclamation ?`}
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

export default Reclamations;
