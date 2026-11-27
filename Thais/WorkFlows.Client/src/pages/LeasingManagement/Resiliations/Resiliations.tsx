import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
  AvatarCell,
  Chip,
  fmtDate,
  fmtMoney,
  KPI_TONES,
  KpiCard,
  KpiStrip,
  MoneyCell,
  PrimarySecondary,
  RowActions,
  StatusPill,
  Tone,
} from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { ResiliationResponse } from '@/store/features/leasing/resiliation-schemas';
import {
  deleteResiliation,
  getAllResiliations,
  resetResiliation,
  setResiliation,
} from '@/store/features/leasing/resiliationsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, CalendarX2, FileX, Hourglass, Plus, XCircle } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const STATUT_TONE: Record<string, Tone> = {
  Nouveau: 'info',
  'En instance': 'warning',
  Validée: 'success',
};

const Resiliations = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.resiliations,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ResiliationResponse | null>(null);
  const [search, setSearch] = useState('');
  // Toutes les résiliations (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<ResiliationResponse[] | null>(null);

  const loadStats = useCallback(() => {
    fetchAllPages<ResiliationResponse>('/api/resiliations')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    dispatch(getAllResiliations({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllResiliations({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: ResiliationResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteResiliation(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const openResiliation = (item: ResiliationResponse, mode: 'details' | 'modifier') => {
    dispatch(setResiliation(item));
    navigate(`${mode}/${item.numero}`);
  };

  const kpis = useMemo(() => {
    if (!stats) return null;
    const annee = new Date().getFullYear();
    const cetteAnnee = stats.filter((r) => r.dateResiliation && new Date(r.dateResiliation).getFullYear() === annee);
    const enAttente = stats.filter((r) => r.statutValidation !== 'Validée');
    return {
      total: stats.length,
      cetteAnnee: cetteAnnee.length,
      loyerPerdu: cetteAnnee.reduce((s, r) => s + (r.loyerMensuel ?? 0), 0),
      enAttente: enAttente.length,
      annee,
    };
  }, [stats]);

  const columns: ColumnDef<ResiliationResponse>[] = [
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => (
        <AvatarCell
          name={row.original.nomLocataire}
          secondary={row.original.numContratLocations ? `Contrat ${row.original.numContratLocations}` : null}
        />
      ),
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => (
        <PrimarySecondary primary={row.original.nomBuilding} secondary={row.original.etage ? `Étage ${row.original.etage}` : null} />
      ),
    },
    {
      id: 'dateResiliation',
      accessorFn: (row) => fmtDate(row.dateResiliation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Résiliation' sorting />,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className='min-w-[170px]'>
            <div className='whitespace-nowrap font-medium'>{fmtDate(r.dateResiliation) || '—'}</div>
            <div className='whitespace-nowrap text-xs text-muted-foreground'>
              Location depuis le {fmtDate(r.dateDebutLocation) || '—'}
            </div>
            {r.dateReception && (
              <div className='whitespace-nowrap text-xs text-muted-foreground'>Demande reçue le {fmtDate(r.dateReception)}</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'loyerMensuel',
      header: () => <div className='text-right'>Loyer mensuel</div>,
      cell: ({ row }) => <MoneyCell value={row.original.loyerMensuel} />,
    },
    {
      id: 'cumulPertesLoyers',
      header: () => <div className='text-right'>Cumul pertes de loyers</div>,
      cell: () => (
        <div className='text-right text-muted-foreground' title='Module Facturation bientôt disponible'>
          —
        </div>
      ),
    },
    {
      accessorKey: 'motifResiliation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Motif' />,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <div className='min-w-[180px] space-y-1'>
            <div className='line-clamp-2 text-sm'>{r.motifResiliation || <span className='text-muted-foreground'>—</span>}</div>
            <div className='flex flex-wrap gap-1'>
              <Chip>{r.typeResiliation}</Chip>
              <Chip>Origine : {r.origineResiliation}</Chip>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'durePreavis',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Préavis' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{row.original.durePreavis || '—'}</span>,
    },
    {
      id: 'piecesJointes',
      header: () => <div>Pièces jointes</div>,
      cell: () => <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'statutValidation',
      header: () => <div>Statut</div>,
      cell: ({ row }) => <StatusPill label={row.original.statutValidation} tone={STATUT_TONE[row.original.statutValidation] ?? 'neutral'} />,
    },
    {
      id: 'details',
      size: 96,
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => openResiliation(row.original, 'modifier')}
          onDelete={() => handleDelete(row.original)}
          deleteLabel='Désactiver'
        />
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllResiliations({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllResiliations({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={XCircle}
            title='Résiliation'
            description='Gérer les résiliations de baux'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetResiliation());
                  navigate('ajouter');
                },
              },
            ]}
          />

          <KpiStrip>
            <KpiCard
              icon={FileX}
              label='Résiliations'
              value={kpis ? String(kpis.total) : '—'}
              hint='au total'
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={CalendarX2}
              label={kpis ? `Résiliations ${kpis.annee}` : 'Cette année'}
              value={kpis ? String(kpis.cetteAnnee) : '—'}
              hint="prenant effet cette année"
              tone={KPI_TONES.amber}
            />
            <KpiCard
              icon={Banknote}
              label='Loyer mensuel résilié'
              value={kpis ? `${fmtMoney(kpis.loyerPerdu)} MAD` : '—'}
              hint={kpis ? `sur les résiliations ${kpis.annee}` : undefined}
              tone={KPI_TONES.red}
            />
            <KpiCard
              icon={Hourglass}
              label='En attente de validation'
              value={kpis ? String(kpis.enAttente) : '—'}
              hint='nouvelles ou en instance'
              tone={KPI_TONES.sky}
            />
          </KpiStrip>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowClick={(item) => openResiliation(item, 'details')}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver cette résiliation pour "${selectedItem?.nomLocataire || ''}" ?`}
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

export default Resiliations;
