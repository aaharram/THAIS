import { ExportMenu, fetchAllPages } from '@/components/export/export-menu';
import { ImportMenu } from '@/components/import/import-menu';
import { BAUX_IMPORT } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
  daysFromToday,
  fmtDate,
  fmtMoney,
  InitialsAvatar,
  KPI_TONES,
  KpiCard,
  KpiStrip,
  RowActions,
  StatusPill,
  Tone,
} from '@/components/table/list-cells';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { BailResponse } from '@/store/features/leasing/bail-schemas';
import { getAllBaux, resetBail, setBail } from '@/store/features/leasing/bauxSlice';
import { getBuildingById } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatSurface } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, CalendarClock, FileCheck2, FileSignature, Plus, TrendingUp, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const ETAT_EN_COURS = 'En cours de location';
const ETAT_TONE: Record<string, Tone> = {
  [ETAT_EN_COURS]: 'success',
  'Location Terminée': 'neutral',
  Suspendu: 'warning',
};

const fmtMontant = (m?: number | null) => fmtMoney(m);

// Durée du bail : dates, barre d'avancement et temps restant (rouge si expiré, orange sous 6 mois).
const PeriodeCell = ({ bail }: { bail: BailResponse }) => {
  if (!bail.dateDebut) return null;
  const debut = new Date(bail.dateDebut).getTime();
  const fin = bail.dateFin ? new Date(bail.dateFin).getTime() : null;
  const joursRestants = daysFromToday(bail.dateFin);
  const progression = fin && fin > debut ? Math.min(100, Math.max(0, ((Date.now() - debut) / (fin - debut)) * 100)) : 0;

  let statut = { texte: 'Durée indéterminée', couleur: 'text-muted-foreground', barre: 'bg-primary' };
  if (joursRestants != null) {
    const mois = Math.max(1, Math.round(Math.abs(joursRestants) / 30.4));
    if (joursRestants < 0) {
      statut = { texte: `Expiré depuis ${mois} mois`, couleur: 'text-red-600 dark:text-red-400', barre: 'bg-red-500' };
    } else if (joursRestants <= 183) {
      statut = {
        texte: joursRestants < 31 ? `Reste ${joursRestants} j` : `Reste ${mois} mois`,
        couleur: 'text-amber-600 dark:text-amber-400',
        barre: 'bg-amber-500',
      };
    } else {
      statut = { texte: `Reste ${mois} mois`, couleur: 'text-muted-foreground', barre: 'bg-primary' };
    }
  }

  return (
    <div className='min-w-[170px] space-y-1.5'>
      <div className='whitespace-nowrap text-sm'>
        {fmtDate(bail.dateDebut)}
        <span className='mx-1.5 text-muted-foreground'>→</span>
        {bail.dateFin ? fmtDate(bail.dateFin) : '—'}
      </div>
      <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
        <div className={`h-full rounded-full ${statut.barre}`} style={{ width: `${progression}%` }} />
      </div>
      <div className={`text-xs ${statut.couleur}`}>{statut.texte}</div>
    </div>
  );
};

// Prochaine révision de loyer : en retard (rouge), à venir sous 90 jours (orange), sinon neutre.
const RevisionCell = ({ bail }: { bail: BailResponse }) => {
  const jours = daysFromToday(bail.dateProchaineRevision);
  if (!bail.dateProchaineRevision && !bail.dateDerniereRevision) return <span className='text-muted-foreground'>—</span>;

  let pastille: React.ReactNode = null;
  if (jours != null) {
    if (jours < 0) {
      pastille = (
        <span className='rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400'>
          En retard
        </span>
      );
    } else if (jours <= 90) {
      pastille = (
        <span className='rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400'>
          Dans {jours} j
        </span>
      );
    }
  }

  return (
    <div className='space-y-1'>
      <div className='flex items-center gap-2 whitespace-nowrap text-sm'>
        {bail.dateProchaineRevision ? fmtDate(bail.dateProchaineRevision) : '—'}
        {pastille}
      </div>
      {bail.dateDerniereRevision && (
        <div className='whitespace-nowrap text-xs text-muted-foreground'>Dernière : {fmtDate(bail.dateDerniereRevision)}</div>
      )}
    </div>
  );
};

/**
 * Liste des baux, sur le modèle de RMANew (ListLocation.aspx) : Contrat, Locataire, Adresse de locataire, Local, Type,
 * Superficie, Loyer de base, Montant de location (TC/CC), Début de bail, Date révision loyer, Date prochaine
 * révision. Les mêmes informations sont regroupées par cellule (locataire + adresse + contrat, actif + local + surface,
 * période de bail, loyer, révision) et complétées d'indicateurs (statut, temps restant, révision à venir) et d'un
 * bandeau de synthèse. Ouverte depuis la liste des actifs (?building=), elle montre les baux de cet actif.
 */
const Baux = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.baux);
  const buildingFilter = useAppSelector((state) => state.buildings.item);
  const [search, setSearch] = useState('');
  // Tous les baux (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<BailResponse[] | null>(null);

  const buildingId = Number(searchParams.get('building')) || 0;
  const filters = useMemo(() => (buildingId ? { NoBuilding: [buildingId] } : undefined), [buildingId]);

  const loadStats = useCallback(() => {
    fetchAllPages<BailResponse>('/api/baux', '', filters)
      .then(setStats)
      .catch(() => setStats([]));
  }, [filters]);

  useEffect(() => {
    if (buildingId) {
      dispatch(getBuildingById(buildingId));
    }
  }, [buildingId, dispatch]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    dispatch(
      getAllBaux({
        pageNumber: 1,
        pageSize: 10,
        search,
        filters: buildingId ? { NoBuilding: [buildingId] } : undefined,
      }),
    );
  }, [dispatch, search, buildingId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllBaux({ pageNumber: 1, pageSize, search: value, filters }));
  };

  const clearBuildingFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('building');
      return next;
    });
  };

  const openBail = (bail: BailResponse, mode: 'details' | 'modifier') => {
    dispatch(setBail(bail));
    navigate(`${mode}/${bail.numero}`);
  };

  // Bandeau de synthèse : calculé sur tous les baux (pas seulement la page affichée).
  const kpis = useMemo(() => {
    if (!stats) return null;
    const enCours = stats.filter((b) => b.etat === ETAT_EN_COURS);
    const echeances = enCours.filter((b) => {
      const j = daysFromToday(b.dateFin);
      return j != null && j >= 0 && j <= 183;
    });
    const revisions = enCours.filter((b) => {
      const j = daysFromToday(b.dateProchaineRevision);
      return j != null && j <= 90;
    });
    return {
      total: stats.length,
      enCours: enCours.length,
      loyers: enCours.reduce((s, b) => s + (b.montant ?? 0), 0),
      echeances: echeances.length,
      revisions: revisions.length,
    };
  }, [stats]);

  const columns: ColumnDef<BailResponse>[] = [
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className='flex min-w-[220px] items-center gap-3'>
            <InitialsAvatar name={b.nomLocataire} />
            <div className='min-w-0'>
              <div className='truncate font-medium'>{b.nomLocataire || '—'}</div>
              <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                {b.numContratLocations && (
                  <span className='rounded bg-muted px-1.5 py-0.5 font-mono text-[11px]'>{b.numContratLocations}</span>
                )}
                {b.adresseLocataire && <span className='max-w-[220px] truncate'>{b.adresseLocataire}</span>}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: 'bien',
      accessorFn: (row) => [row.nomBuilding, row.nomLocal, row.usage, row.surface].filter(Boolean).join(' '),
      header: () => <div>{buildingId ? 'Local' : 'Actif / Local'}</div>,
      cell: ({ row }) => {
        const b = row.original;
        return (
          <div className='min-w-[170px]'>
            <div className='font-medium'>{buildingId ? b.nomLocal || '—' : b.nomBuilding || '—'}</div>
            <div className='text-xs text-muted-foreground'>
              {[buildingId ? null : b.nomLocal, b.usage, b.surface != null ? `${formatSurface(b.surface)} m²` : null]
                .filter(Boolean)
                .join(' · ')}
            </div>
          </div>
        );
      },
    },
    {
      id: 'periode',
      accessorFn: (row) => `${fmtDate(row.dateDebut)} ${fmtDate(row.dateFin)}`,
      header: () => <div>Période de bail</div>,
      cell: ({ row }) => <PeriodeCell bail={row.original} />,
    },
    {
      id: 'loyer',
      accessorFn: (row) => String(row.montant ?? ''),
      header: () => <div className='text-right'>Loyer (TC/CC)</div>,
      cell: ({ row }) => {
        const b = row.original;
        if (!b.montant) return <div className='text-right text-muted-foreground'>—</div>;
        return (
          <div className='text-right tabular-nums'>
            <div className='whitespace-nowrap font-semibold'>
              {fmtMontant(b.montant)} <span className='text-xs font-normal text-muted-foreground'>MAD</span>
            </div>
            {(b.loyerNet ?? 0) > 0 && (
              <div className='whitespace-nowrap text-xs text-muted-foreground'>Base {fmtMontant(b.loyerNet)}</div>
            )}
          </div>
        );
      },
    },
    {
      id: 'revision',
      accessorFn: (row) => `${fmtDate(row.dateProchaineRevision)} ${fmtDate(row.dateDerniereRevision)}`,
      header: () => <div>Prochaine révision</div>,
      cell: ({ row }) => <RevisionCell bail={row.original} />,
    },
    {
      id: 'statut',
      accessorFn: (row) => row.etat ?? '',
      header: () => <div>Statut</div>,
      cell: ({ row }) => <StatusPill label={row.original.etat} tone={ETAT_TONE[row.original.etat ?? ''] ?? 'neutral'} />,
    },
    {
      id: 'details',
      size: 96,
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions onEdit={() => openBail(row.original, 'modifier')} />
      ),
    },
  ];

  // Export : mêmes colonnes que RMANew (ListLocation.ExcelHeader).
  const EXPORT_HEADER = [
    'Contrat',
    'Locataire',
    'Adresse de Locataire',
    'Local',
    'Type',
    'Superficie (m²)',
    'Loyer de base',
    'Montant de location (MAD) (TC/CC)',
    'Début de bail',
    'Date révision loyer',
    'Date prochaine revision',
    'Encaisseur',
  ];
  const getExportRows = async () =>
    (await fetchAllPages<BailResponse>('/api/baux', search, filters)).map((b) => [
      b.numContratLocations ?? '',
      b.nomLocataire ?? '',
      b.adresseLocataire ?? '',
      b.nomLocal ?? '',
      b.usage ?? '',
      b.surface != null ? formatSurface(b.surface) : '0',
      fmtMontant(b.loyerNet),
      fmtMontant(b.montant),
      fmtDate(b.dateDebut),
      fmtDate(b.dateDerniereRevision),
      fmtDate(b.dateProchaineRevision),
      b.nomEncaisseur ?? '',
    ]);

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllBaux({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) => dispatch(getAllBaux({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  const titre =
    buildingId && buildingFilter
      ? `Baux de ${buildingFilter.designation}${buildingFilter.nomCity ? ` (${buildingFilter.nomCity})` : ''}`
      : 'Baux';

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileSignature}
            title={titre}
            actions={
              <>
                <ExportMenu fileName={titre} pdfTitle={titre} header={EXPORT_HEADER} getRows={getExportRows} />
                <ImportMenu
                  config={BAUX_IMPORT}
                  onImported={() => {
                    dispatch(getAllBaux({ pageNumber: 1, pageSize, search, filters }));
                    loadStats();
                  }}
                />
              </>
            }
            description={buildingId ? undefined : 'Gérer les baux'}
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetBail());
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
              Voir tous les baux
              <X className='h-3.5 w-3.5' />
            </button>
          )}

          {/* Bandeau de synthèse */}
          <KpiStrip>
            <KpiCard
              icon={FileCheck2}
              label='Baux en cours'
              value={kpis ? String(kpis.enCours) : '—'}
              hint={kpis ? `sur ${kpis.total} baux au total` : undefined}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={Banknote}
              label='Loyers cumulés (TC/CC)'
              value={kpis ? `${fmtMontant(kpis.loyers)} MAD` : '—'}
              hint='baux en cours, par période de facturation'
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={CalendarClock}
              label='Échéances sous 6 mois'
              value={kpis ? String(kpis.echeances) : '—'}
              hint='baux arrivant à terme'
              tone={KPI_TONES.amber}
            />
            <KpiCard
              icon={TrendingUp}
              label='Révisions à prévoir'
              value={kpis ? String(kpis.revisions) : '—'}
              hint='en retard ou sous 90 jours'
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
          pagination={pagination}
          onRowClick={(bail) => openBail(bail, 'details')}
        />
      </CardContent>
    </Card>
  );
};

export default Baux;
