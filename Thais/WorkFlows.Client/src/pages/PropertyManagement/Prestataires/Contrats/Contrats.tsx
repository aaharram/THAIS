import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { AvatarCell, Chip, KPI_TONES, KpiCard, KpiStrip, MoneyCell, RowActions, fmtMoney as fmtKpi } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { CONTRATS_PRESTATAIRES_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { PrestataireContratResponse } from '@/store/features/property-management/prestataire-contrat-schemas';
import {
  deletePrestataireContrat,
  getAllPrestataireContrats,
  resetPrestataireContrat,
  setPrestataireContrat,
} from '@/store/features/property-management/prestataireContratsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, CalendarClock, FileCheck2, FileSignature, FileText, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const backPath = '/property-management/prestataires';

const Contrats = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.prestataireContrats);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PrestataireContratResponse | null>(null);
  const [search, setSearch] = useState('');
  // Tous les enregistrements (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<PrestataireContratResponse[] | null>(null);
  const loadStats = useCallback(() => {
    fetchAllPages<PrestataireContratResponse>('/api/prestataire-contrats')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    const jours = (d?: string | null) => (d ? Math.round((new Date(d).getTime() - Date.now()) / 86_400_000) : null);
    const enCours = stats.filter((c) => c.dateFin == null || (jours(c.dateFin) ?? 0) >= 0);
    const bientot = enCours.filter((c) => {
      const j = jours(c.dateFin);
      return j != null && j <= 90;
    });
    return {
      total: stats.length,
      enCours: enCours.length,
      bientot: bientot.length,
      montant: enCours.reduce((s, c) => s + (c.montant ?? 0), 0),
    };
  }, [stats]);

  useEffect(() => {
    dispatch(getAllPrestataireContrats({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllPrestataireContrats({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: PrestataireContratResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deletePrestataireContrat(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<PrestataireContratResponse>[] = [
    {
      accessorKey: 'numeroContrat',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' sorting />,
      cell: ({ row }) => row.original.numeroContrat ? <Chip className='font-mono'>{row.original.numeroContrat}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'nomPrestataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prestataire' />,
      cell: ({ row }) => <AvatarCell name={row.original.nomPrestataire} />,
    },
    {
      accessorKey: 'objet',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Objet' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.objet || '-'}</div>,
    },
    {
      id: 'dateDebut',
      accessorFn: (row) => fmtDate(row.dateDebut),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date début' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateDebut)}</span>,
    },
    {
      id: 'dateFin',
      accessorFn: (row) => fmtDate(row.dateFin),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date fin' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateFin)}</span>,
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Montant</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant} />,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => {
            dispatch(setPrestataireContrat(row.original));
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
    onPageChange: (newPage: number) =>
      dispatch(getAllPrestataireContrats({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllPrestataireContrats({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileText}
            actions={<ImportMenu config={CONTRATS_PRESTATAIRES_IMPORT} onImported={() => dispatch(getAllPrestataireContrats({ pageNumber: 1, pageSize, search }))} />}
            title='Contrats prestataires'
            description='Gérer les contrats rattachés aux prestataires'
            buttons={[
              {
                label: 'Retour aux prestataires',
                icon: undefined,
                variant: 'secondary',
                onClick: () => navigate(backPath),
              },
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetPrestataireContrat());
                  navigate('ajouter');
                },
              },
            ]}
          />

          <KpiStrip>
            <KpiCard
              icon={FileSignature}
              label='Contrats'
              value={kpis ? String(kpis.total) : '—'}
              hint={'au total'}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={FileCheck2}
              label='En cours'
              value={kpis ? String(kpis.enCours) : '—'}
              hint={'non échus'}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={CalendarClock}
              label='Échéance sous 90 j'
              value={kpis ? String(kpis.bientot) : '—'}
              hint={'à renouveler'}
              tone={KPI_TONES.amber}
            />
            <KpiCard
              icon={Banknote}
              label='Montant en cours'
              value={kpis ? `${fmtKpi(kpis.montant)} MAD` : '—'}
              hint={'contrats non échus'}
              tone={KPI_TONES.sky}
            />
          </KpiStrip>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomPrestataire', title: 'Prestataire' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setPrestataireContrat(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver ce contrat "${selectedItem?.numeroContrat || ''}" ?`}
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

export default Contrats;
