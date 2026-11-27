import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { AvatarCell, Chip, IconTile, KPI_TONES, KpiCard, KpiStrip, MoneyCell, PrimarySecondary, RowActions, fmtMoney as fmtKpi } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { SINISTRES_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { SinistreResponse } from '@/store/features/property-management/sinistre-schemas';
import {
  deleteSinistre,
  downloadSinistreAttachment,
  getAllSinistres,
  resetSinistre,
  setSinistre,
} from '@/store/features/property-management/sinistresSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Banknote, CheckCircle2, FileDown, Hourglass, Plus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const etapeBadgeClass = (etape: string) => {
  switch (etape) {
    case 'Clôturé':
      return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
    case 'Remboursement':
      return 'bg-sky-500/10 text-sky-700 dark:text-sky-400';
    case 'Expertise':
    case 'Réclamation':
      return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
    default:
      return 'bg-slate-500/10 text-slate-600 dark:text-slate-300';
  }
};

// RMANew (ListSinistre.vb, cHeader) : mêmes colonnes que la liste legacy, à l'exception
// des pièces jointes (PV d'expertise, Fiche Sinistre PDF) - pas d'infra d'upload/génération
// de document dans Smart-Building pour l'instant.
const Sinistres = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.sinistresPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SinistreResponse | null>(null);
  const [search, setSearch] = useState('');
  // Tous les enregistrements (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<SinistreResponse[] | null>(null);
  const loadStats = useCallback(() => {
    fetchAllPages<SinistreResponse>('/api/sinistres')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    const rembourses = stats.filter((x) => x.dateRemboursement);
    return {
      total: stats.length,
      enCours: stats.length - rembourses.length,
      rembourses: rembourses.length,
      montant: stats.reduce((s, x) => s + (x.montantRemuneration ?? 0), 0),
    };
  }, [stats]);

  useEffect(() => {
    dispatch(getAllSinistres({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllSinistres({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: SinistreResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteSinistre(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
  const fmtNum = (n?: number | null) => (n === null || n === undefined ? '-' : n.toLocaleString('fr-FR'));

  const [downloadingAttachment, setDownloadingAttachment] = useState<string | null>(null);

  const handleDownloadPV = async (item: SinistreResponse) => {
    if (!item.cheminPVExpertise) return;
    setDownloadingAttachment(String(item.numero));
    try {
      await downloadSinistreAttachment(item.numero, 'pv-expertise', item.cheminPVExpertise);
    } finally {
      setDownloadingAttachment(null);
    }
  };

  // Colonnes alignées sur ListSinistre.aspx (RMANew). Note : "Date du Sinistre" y affiche en
  // réalité dateReclamation (pas dateDeclaration) - une inversion de libellé propre au code
  // RMANew d'origine, reproduite ici pour rester fidèle à ce qui s'affiche côté RMANew.
  const columns: ColumnDef<SinistreResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <AvatarCell name={row.original.nomLocataire} />,
    },
    {
      accessorKey: 'nomTypeSinistre',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nature Reclamation' />,
      cell: ({ row }) => row.original.nomTypeSinistre ? <Chip>{row.original.nomTypeSinistre}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'dateReclamation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date du Sinistre' sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateReclamation)}</span>,
    },
    {
      accessorKey: 'dateDeclaration',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date de déclaration' sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateDeclaration)}</span>,
    },
    {
      accessorKey: 'etapeSuivi',
      header: () => <div className='text-center'>Étapes du suivi</div>,
      cell: ({ row }) => (
        <div className='flex justify-center min-w-[120px]'>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap whitespace-nowrap ${etapeBadgeClass(row.original.etapeSuivi)}`}
          >
            {row.original.etapeSuivi}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'cumul',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Cumul en nombre des dossiers remis' />,
      cell: ({ row }) => <div className='font-medium text-center'>{fmtNum(row.original.cumul)}</div>,
    },
    {
      accessorKey: 'noSinistre',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Sinistre' />,
      cell: ({ row }) => row.original.noSinistre ? <Chip className='font-mono'>{row.original.noSinistre}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'numPoliceAssurance',
      header: ({ column }) => <DataTableColumnHeader column={column} title="N° Police d'assurance" />,
      cell: ({ row }) => row.original.numPoliceAssurance ? <Chip className='font-mono'>{row.original.numPoliceAssurance}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'nomAssureur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Assurance' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomAssureur} />,
    },
    {
      accessorKey: 'nomCourtier',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Courtier d'assurance" />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomCourtier} />,
    },
    {
      accessorKey: 'dateExpertise',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'expertise" sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateExpertise)}</span>,
    },
    {
      id: 'pvExpertise',
      header: () => <div className='text-center'>PV d&apos;expertise</div>,
      cell: ({ row }) =>
        row.original.cheminPVExpertise ? (
          <IconTile
            icon={FileDown}
            label="Télécharger le PV d'expertise"
            tone='primary'
            disabled={downloadingAttachment === String(row.original.numero)}
            onClick={() => handleDownloadPV(row.original)}
          />
        ) : (
          <div className='text-center text-muted-foreground'>-</div>
        ),
    },
    {
      accessorKey: 'montantRemuneration',
      header: () => <div className='text-right'>Montant de remboursement</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantRemuneration} />,
    },
    {
      accessorKey: 'dateRemboursement',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date de remboursement' sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateRemboursement)}</span>,
    },
    {
      accessorKey: 'referenceDossierDAG',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reference Dossier DAG' />,
      cell: ({ row }) => row.original.referenceDossierDAG ? <Chip className='font-mono'>{row.original.referenceDossierDAG}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'refDossierAssurance',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reference Dossier Assurance' />,
      cell: ({ row }) => row.original.refDossierAssurance ? <Chip className='font-mono'>{row.original.refDossierAssurance}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'nomExpert',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Nom de l'Expert" />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomExpert} />,
    },
    {
      accessorKey: 'montantExpert',
      header: () => <div className='text-right'>Montant de l&apos;Expert</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantExpert} />,
    },
    {
      accessorKey: 'montantFacture',
      header: () => <div className='text-right'>Montant de facture</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantFacture} />,
    },
    {
      id: 'ficheSinistre',
      header: () => <div className='text-center'>Fiche Sinistre</div>,
      cell: () => <IconTile icon={FileDown} label='Fiche sinistre : génération PDF non disponible' tone='sky' disabled />,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => {
            dispatch(setSinistre(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllSinistres({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllSinistres({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={AlertTriangle}
            actions={<ImportMenu config={SINISTRES_IMPORT} onImported={() => dispatch(getAllSinistres({ pageNumber: 1, pageSize, search }))} />}
            title='Gestion des sinistres'
            description='Suivi des sinistres par actif'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetSinistre());
                  navigate('ajouter');
                },
              },
            ]}
          />

          <KpiStrip>
            <KpiCard
              icon={AlertTriangle}
              label='Sinistres'
              value={kpis ? String(kpis.total) : '—'}
              hint={'dossiers au total'}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={Hourglass}
              label='En cours'
              value={kpis ? String(kpis.enCours) : '—'}
              hint={'sans remboursement'}
              tone={KPI_TONES.amber}
            />
            <KpiCard
              icon={CheckCircle2}
              label='Remboursés'
              value={kpis ? String(kpis.rembourses) : '—'}
              hint={'dossiers soldés'}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={Banknote}
              label='Montant remboursé'
              value={kpis ? `${fmtKpi(kpis.montant)} MAD` : '—'}
              hint={'tous dossiers'}
              tone={KPI_TONES.sky}
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
            dispatch(setSinistre(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer ce sinistre "${selectedItem?.idSinistre || ''}" ?`}
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

export default Sinistres;
