import { ExportMenu, fetchAllPages } from '@/components/export/export-menu';
import { ImportMenu } from '@/components/import/import-menu';
import { LOCAUX_IMPORT } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
  fmtMoney,
  IconTile,
  KPI_TONES,
  KpiCard,
  KpiStrip,
  MoneyCell,
  PrimarySecondary,
  RowActions,
  StatusPill,
} from '@/components/table/list-cells';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { LocalResponse } from '@/store/features/patrimoine/local-schemas';
import { getAllLocaux, resetLocal, setLocal } from '@/store/features/patrimoine/locauxSlice';
import { getBuildingById } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { downloadAttachment } from '@/store/services/attachments';
import { formatSurface } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, DoorClosed, DoorOpen, FileImage, Home, LayoutGrid, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const fmtMontant = (m?: number | null) => fmtMoney(m);

/**
 * Liste des locaux, sur le modèle de RMANew (ListLocal.aspx) : Local, Etage, Type, Titre Foncier, Superficie,
 * Occupation (Loué / Vacant), Locataire et Montant (CC/TC) du bail en cours, Plan, et le crayon « Détails ».
 * Les informations sont regroupées par cellule (local + étage/type, superficie + parking) et complétées d'un bandeau
 * d'occupation. Ouverte depuis la liste des actifs (?building=), elle montre les locaux de cet actif comme dans RMA.
 */
const Locaux = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.locaux);
  const buildingFilter = useAppSelector((state) => state.buildings.item);
  const [search, setSearch] = useState('');
  // Tous les locaux (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<LocalResponse[] | null>(null);

  const buildingId = Number(searchParams.get('building')) || 0;
  const filters = useMemo(() => (buildingId ? { NoBuilding: [buildingId] } : undefined), [buildingId]);

  const loadStats = useCallback(() => {
    fetchAllPages<LocalResponse>('/api/locaux', '', filters)
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
      getAllLocaux({
        pageNumber: 1,
        pageSize: 10,
        search,
        filters: buildingId ? { NoBuilding: [buildingId] } : undefined,
      }),
    );
  }, [dispatch, search, buildingId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllLocaux({ pageNumber: 1, pageSize, search: value, filters }));
  };

  const clearBuildingFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('building');
      return next;
    });
  };

  const openLocal = (local: LocalResponse, mode: 'details' | 'modifier') => {
    dispatch(setLocal(local));
    navigate(`${mode}/${local.numero}`);
  };

  const kpis = useMemo(() => {
    if (!stats) return null;
    const loues = stats.filter((l) => l.occupe);
    return {
      total: stats.length,
      surface: stats.reduce((s, l) => s + (l.surface ?? 0), 0),
      loues: loues.length,
      vacants: stats.length - loues.length,
      taux: stats.length ? Math.round((loues.length / stats.length) * 100) : 0,
      loyers: loues.reduce((s, l) => s + (l.montantLoyer ?? 0), 0),
    };
  }, [stats]);

  const columns: ColumnDef<LocalResponse>[] = [
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' sorting />,
      cell: ({ row }) => {
        const l = row.original;
        return (
          <div className='flex min-w-[200px] items-center gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary'>
              <Home className='h-4 w-4' />
            </div>
            <PrimarySecondary
              primary={l.designation}
              // RMANew (ListLocal) : Etage, Type et Titre Foncier ; dans la liste générale, le titre foncier est sous l'actif.
              secondary={[l.etage ? `Étage ${l.etage}` : null, l.nomLocalType, buildingId && l.titreFoncier ? `TF ${l.titreFoncier}` : null]
                .filter(Boolean)
                .join(' · ')}
            />
          </div>
        );
      },
    },
    // Hors du contexte d'un actif (liste générale), on indique l'actif de chaque local.
    ...(buildingId
      ? []
      : [
          {
            accessorKey: 'nomBuilding',
            header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
            cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} secondary={row.original.titreFoncier} />,
          } as ColumnDef<LocalResponse>,
        ]),
    {
      accessorKey: 'surface',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie' />,
      cell: ({ row }) => {
        const l = row.original;
        return (
          <PrimarySecondary
            primary={l.surface != null ? `${formatSurface(l.surface)} m²` : '—'}
            // Spécifique THAIS (pas dans RMA) : le champ « Nb Pièces » sert au nombre de places de parking.
            secondary={l.nbrePiece != null && l.nbrePiece > 0 ? `${l.nbrePiece} place(s) de parking` : null}
          />
        );
      },
    },
    {
      id: 'occupation',
      accessorFn: (row) => (row.occupe ? 'Loué' : 'Vacant'),
      header: () => <div>Occupation</div>,
      cell: ({ row }) => <StatusPill label={row.original.occupe ? 'Loué' : 'Vacant'} tone={row.original.occupe ? 'success' : 'warning'} />,
    },
    {
      id: 'locataire',
      accessorFn: (row) => (row.occupe ? (row.locataire ?? '') : ''),
      header: () => <div>Locataire</div>,
      cell: ({ row }) => <PrimarySecondary primary={row.original.occupe ? row.original.locataire : ''} />,
    },
    {
      id: 'montant',
      accessorFn: (row) => (row.occupe ? String(row.montantLoyer ?? '') : ''),
      header: () => <div className='text-right'>Montant (CC/TC) (MAD)</div>,
      cell: ({ row }) =>
        row.original.occupe && row.original.montantLoyer ? (
          <MoneyCell value={row.original.montantLoyer} />
        ) : (
          <div className='text-right text-muted-foreground'>—</div>
        ),
    },
    {
      id: 'plan',
      header: () => <div className='text-center'>Plan</div>,
      cell: ({ row }) =>
        row.original.planLocal ? (
          <IconTile
            icon={FileImage}
            label='Télécharger le plan'
            tone='primary'
            onClick={() => downloadAttachment('locaux', row.original.planLocal!, `Plan - ${row.original.designation}`)}
          />
        ) : (
          <div className='text-center text-muted-foreground'>—</div>
        ),
    },
    {
      id: 'details',
      size: 96,
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions onEdit={() => openLocal(row.original, 'modifier')} />
      ),
    },
  ];

  // Export : mêmes colonnes que RMANew (ListLocal.ExcelHeader).
  const EXPORT_HEADER = ['Local', 'Etage', 'Type', 'Titre Foncier', 'Superficie (m²)', 'Nbr place parking', 'Occupation', 'Locataire', 'Montant (CC/TC)(MAD)'];
  const getExportRows = async () =>
    (await fetchAllPages<LocalResponse>('/api/locaux', search, filters)).map((l) => [
      l.designation ?? '',
      l.etage ?? '',
      l.nomLocalType ?? '',
      l.titreFoncier ?? '',
      l.surface != null ? formatSurface(l.surface) : '0',
      l.nbrePiece != null ? String(l.nbrePiece) : '',
      l.occupe ? 'Loué' : 'Vacant',
      l.occupe ? l.locataire ?? '' : '',
      l.occupe ? fmtMontant(l.montantLoyer) : '0',
    ]);

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllLocaux({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) => dispatch(getAllLocaux({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  // RMANew : titre « Locaux de <actif> (<ville>) » quand la liste est ouverte depuis un actif.
  const titre =
    buildingId && buildingFilter
      ? `Locaux de ${buildingFilter.designation}${buildingFilter.nomCity ? ` (${buildingFilter.nomCity})` : ''}`
      : 'Locaux';
  const fichier = buildingId && buildingFilter ? `Locaux de ${buildingFilter.designation}` : 'Locaux';

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Home}
            title={titre}
            actions={
              <>
                <ExportMenu fileName={fichier} pdfTitle={fichier} header={EXPORT_HEADER} getRows={getExportRows} />
                <ImportMenu
                  config={LOCAUX_IMPORT}
                  onImported={() => {
                    dispatch(getAllLocaux({ pageNumber: 1, pageSize, search, filters }));
                    loadStats();
                  }}
                />
              </>
            }
            description={buildingId ? undefined : 'Gérer les locaux (lots) rattachés aux immeubles'}
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetLocal());
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
              Voir tous les locaux
              <X className='h-3.5 w-3.5' />
            </button>
          )}

          <KpiStrip>
            <KpiCard
              icon={LayoutGrid}
              label='Locaux'
              value={kpis ? String(kpis.total) : '—'}
              hint={kpis ? `${fmtMoney(kpis.surface)} m² au total` : undefined}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={DoorClosed}
              label='Locaux loués'
              value={kpis ? String(kpis.loues) : '—'}
              hint={kpis ? `taux d'occupation ${kpis.taux} %` : undefined}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={DoorOpen}
              label='Locaux vacants'
              value={kpis ? String(kpis.vacants) : '—'}
              hint='disponibles à la location'
              tone={KPI_TONES.amber}
            />
            <KpiCard
              icon={Banknote}
              label='Loyers (CC/TC)'
              value={kpis ? `${fmtMoney(kpis.loyers)} MAD` : '—'}
              hint='baux en cours'
              tone={KPI_TONES.sky}
            />
          </KpiStrip>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'designation', title: 'Local' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowClick={(local) => openLocal(local, 'details')}
          pagination={pagination}
        />
      </CardContent>
    </Card>
  );
};

export default Locaux;
