import { fetchAllPages } from '@/components/export/export-menu';
import { ExportTiles } from '@/components/export/export-tiles';
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
} from '@/components/table/list-cells';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { getDashboardActifs } from '@/store/features/dashboard/dashboardSlice';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { BuildingResponse } from '@/store/features/patrimoine/building-schemas';
import {
  getAllBuildings,
  resetBuilding,
  setBuilding,
} from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { ImportMenu } from '@/components/import/import-menu';
import { ACTIFS_IMPORT } from '@/utils/import/import-configs';
import { formatSurface } from '@/utils/formatters';
import { generateFicheSignaletique } from '@/utils/reports/ficheSignaletique';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, Building2, CirclePlus, FileDown, Home, Percent, Plus, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { BuildingThumb } from './BuildingThumb';

const Buildings = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.buildings,
  );
  const [search, setSearch] = useState('');
  const [noProprietaire, setNoProprietaire] = useState<string>(searchParams.get('proprietaire') ?? '0'); // ?proprietaire= : filtre d'Asset Management
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { actifs } = useAppSelector((state) => state.dashboard);

  const prospectionId = Number(searchParams.get('prospection')) || 0;
  const actifId = Number(searchParams.get('actif')) || 0; // ?actif= : venu du filtre d'Asset Management
  // Filtre prospection (?prospection=) + filtre "Propriétaire" (liste déroulante), cumulables.
  const filterMap: Record<string, number[]> = {
    ...(prospectionId ? { NoProspection: [prospectionId] } : {}),
    ...(actifId ? { Numero: [actifId] } : {}),
    ...(noProprietaire !== '0' ? { NoProprietaire: [Number(noProprietaire)] } : {}),
  };
  const filters = Object.keys(filterMap).length > 0 ? filterMap : undefined;

  // Tous les actifs (hors pagination, mêmes filtres) pour le bandeau de synthèse.
  const [stats, setStats] = useState<BuildingResponse[] | null>(null);
  const statsKey = JSON.stringify(filterMap);
  const loadStats = useCallback(() => {
    fetchAllPages<BuildingResponse>('/api/buildings', '', JSON.parse(statsKey))
      .then(setStats)
      .catch(() => setStats([]));
  }, [statsKey]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    const locaux = stats.reduce((sum, b) => sum + b.nbLocaux, 0);
    const baux = stats.reduce((sum, b) => sum + b.nbBaux, 0);
    return {
      actifs: stats.length,
      surface: stats.reduce((sum, b) => sum + (b.surfaceUtile ?? 0), 0),
      locaux,
      baux,
      taux: locaux > 0 ? Math.round((baux / locaux) * 100) : 0,
      revenu: stats.reduce((sum, b) => sum + b.revenuAnnuel, 0),
    };
  }, [stats]);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(getDashboardActifs({}));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllBuildings({ pageNumber: 1, pageSize: 10, search, filters }));
  }, [dispatch, search, prospectionId, actifId, noProprietaire]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllBuildings({ pageNumber: 1, pageSize, search: value, filters }));
  };

  const clearProspectionFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('prospection');
      return next;
    });
  };


  // Export : toute la liste (recherche + filtres inclus), pas seulement la page affichée.
  // Le backend plafonne pageSize à 100, donc on parcourt les pages.
  const fetchAllBuildings = async (): Promise<BuildingResponse[]> => {
    const all: BuildingResponse[] = [];
    let page = 1;
    let total = 0;
    do {
      const urlParams = new URLSearchParams({ pageNumber: String(page), pageSize: '100' });
      if (search) urlParams.append('search', search);
      Object.entries(filterMap).forEach(([field, values], i) => {
        urlParams.append(`Filters[${i}].Field`, field);
        values.forEach((value, j) => urlParams.append(`Filters[${i}].Values[${j}]`, String(value)));
      });
      const { data } = await api.get<{ items: BuildingResponse[]; totalCount: number }>(
        `${API_BASE_URL}/api/buildings?${urlParams.toString()}`,
      );
      all.push(...data.items);
      total = data.totalCount;
      page += 1;
    } while (all.length < total && page < 1000);
    return all;
  };

  const EXPORT_HEADER = [
    'Code Analytique',
    'Actif',
    'Typologie',
    'Titre Foncier',
    'Ville',
    'Superficie (m²)',
    'Locaux',
    'Baux',
    "Taux d'occupation (%)",
    'Revenu annuel (MAD)',
  ];

  const fmtNumber = (v: number, decimals?: number) =>
    v
      .toLocaleString('fr-FR', decimals === undefined ? undefined : { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
      .replace(/\s/g, ' ');

  const toExportRows = (items: BuildingResponse[]) =>
    items.map((b) => [
      b.codeImmeuble ?? '',
      b.designation ?? '',
      b.nomBuildingType ?? '',
      b.titreFoncier ?? '',
      b.nomCity ?? '',
      b.surfaceUtile != null ? formatSurface(b.surfaceUtile) : '',
      String(b.nbLocaux),
      String(b.nbBaux),
      `${fmtNumber(b.nbLocaux > 0 ? (b.nbBaux / b.nbLocaux) * 100 : 0)}%`,
      fmtNumber(b.revenuAnnuel, 2),
    ]);

  const handleExportExcel = async () => {
    const rows = toExportRows(await fetchAllBuildings());
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Actifs');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    rows.forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `Actifs-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    const rows = toExportRows(await fetchAllBuildings());
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Liste des Actifs', doc.internal.pageSize.getWidth() / 2, 14, { align: 'center' });
    // Largeurs fixes (mm) : sans elles, jspdf-autotable laisse les longs "Titre Foncier"
    // monopoliser la place et coupe les en-têtes étroits au milieu d'un mot. Total ≈ 269 mm
    // = largeur utile d'un A4 paysage avec des marges de 14 mm.
    autoTable(doc, {
      startY: 22,
      head: [EXPORT_HEADER],
      body: rows,
      margin: { left: 14, right: 14 },
      styles: { fontSize: 8, cellPadding: 1.8, valign: 'middle', overflow: 'linebreak' },
      headStyles: { fillColor: [160, 160, 160], textColor: 255, fontStyle: 'bold' },
      columnStyles: {
        0: { cellWidth: 26 }, // Code Analytique
        1: { cellWidth: 40 }, // Actif
        2: { cellWidth: 28 }, // Typologie
        3: { cellWidth: 48 }, // Titre Foncier
        4: { cellWidth: 26 }, // Ville
        5: { cellWidth: 20, halign: 'right' }, // Superficie
        6: { cellWidth: 16, halign: 'center' }, // Locaux
        7: { cellWidth: 16, halign: 'center' }, // Baux
        8: { cellWidth: 22, halign: 'center' }, // Taux d'occupation
        9: { cellWidth: 27, halign: 'right' }, // Revenu annuel
      },
    });
    doc.save(`Actifs-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // Ordre dans l'en-tête (comme RMANew) : filtre propriétaire -> Export -> Ajouter.
  const headerActions = (
    <>
      <div className='w-56'>
        <Select value={noProprietaire} onValueChange={setNoProprietaire}>
          <SelectTrigger className='h-10 rounded-lg bg-card'>
            <SelectValue placeholder='Tous les propriétaires' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>Tous les propriétaires</SelectItem>
            {proprietaires.map((p) => (
              <SelectItem key={p.numero} value={p.numero.toString()}>
                {p.designation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
      <ImportMenu
        config={ACTIFS_IMPORT}
        onImported={() => {
          dispatch(getAllBuildings({ pageNumber: 1, pageSize, search, filters }));
          loadStats();
        }}
      />
    </>
  );

  const openBuilding = (building: BuildingResponse, mode: 'details' | 'modifier') => {
    dispatch(setBuilding(building));
    navigate(`${mode}/${building.numero}`);
  };

  // Compteur cliquable (locaux / baux) suivi du « + » d'ajout : mêmes liens que RMANew.
  const CountLink = ({
    label,
    count,
    to,
    addTo,
    addLabel,
  }: {
    label: string;
    count: number;
    to: string;
    addTo: string;
    addLabel: string;
  }) => (
    <div className='flex items-center gap-1.5'>
      <button
        type='button'
        className='inline-flex h-6 items-center gap-1 rounded-full bg-primary/10 px-2.5 text-xs font-semibold text-primary hover:bg-primary/20 disabled:cursor-default disabled:hover:bg-primary/10'
        disabled={count === 0}
        onClick={(e) => {
          e.stopPropagation();
          navigate(to);
        }}
      >
        {count} <span className='font-normal'>{label}</span>
      </button>
      <button
        type='button'
        className='text-primary hover:text-primary/70'
        title={addLabel}
        aria-label={addLabel}
        onClick={(e) => {
          e.stopPropagation();
          navigate(addTo);
        }}
      >
        <CirclePlus className='h-4 w-4' />
      </button>
    </div>
  );

  const columns: ColumnDef<BuildingResponse>[] = [
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => {
        const b = row.original;
        return (
          // RMANew (ListBuilding.vb) : désignation sur une ligne (ellipse + tooltip) ; code, typologie et ville dessous.
          <div className='flex min-w-[240px] items-center gap-3'>
            <BuildingThumb fileName={b.buildingImage} />
            <PrimarySecondary
              primary={b.designation}
              secondary={[b.codeImmeuble, b.nomBuildingType, b.nomCity].filter(Boolean).join(' · ')}
            />
          </div>
        );
      },
    },
    {
      accessorKey: 'titreFoncier',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Titre foncier' />,
      cell: ({ row }) => (
        <div className='max-w-[180px] truncate' title={row.original.titreFoncier ?? undefined}>
          {row.original.titreFoncier || <span className='text-muted-foreground'>—</span>}
        </div>
      ),
    },
    {
      accessorKey: 'surfaceUtile',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap font-medium tabular-nums'>
          {row.original.surfaceUtile != null ? `${formatSurface(row.original.surfaceUtile)} m²` : '—'}
        </span>
      ),
    },
    {
      id: 'patrimoine',
      accessorFn: (row) => `${row.nbLocaux} locaux ${row.nbBaux} baux`,
      header: () => <div>Locaux / Baux</div>,
      cell: ({ row }) => (
        <div className='space-y-1.5'>
          <CountLink
            label='locaux'
            count={row.original.nbLocaux}
            to={`/patrimoine/locaux?building=${row.original.numero}`}
            addTo={`/patrimoine/locaux/ajouter?building=${row.original.numero}`}
            addLabel='Ajouter un local'
          />
          <CountLink
            label='baux'
            count={row.original.nbBaux}
            to={`/leasing-management/baux?building=${row.original.numero}`}
            addTo={`/leasing-management/baux/ajouter?building=${row.original.numero}`}
            addLabel='Ajouter un bail'
          />
        </div>
      ),
    },
    {
      // RMANew (ListBuilding.vb) : Taux = (NbBaux / NbLots) * 100 - la même formule simple qui alimente réellement
      // cette colonne, pas le taux pondéré par surface calculé ailleurs dans ce même fichier mais jamais utilisé ici.
      id: 'tauxOccupation',
      accessorFn: (row) => (row.nbLocaux > 0 ? (row.nbBaux / row.nbLocaux) * 100 : 0),
      header: () => <div>Taux d&apos;occupation</div>,
      cell: ({ row }) => {
        const { nbBaux, nbLocaux } = row.original;
        const taux = nbLocaux > 0 ? (nbBaux / nbLocaux) * 100 : 0;
        const barre = taux >= 90 ? 'bg-emerald-500' : taux >= 60 ? 'bg-amber-500' : 'bg-red-500';
        return (
          <div className='min-w-[130px] space-y-1.5'>
            <div className='flex items-baseline justify-between gap-2'>
              <span className='font-semibold tabular-nums'>{taux.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %</span>
              <span className='whitespace-nowrap text-xs text-muted-foreground'>
                {nbBaux}/{nbLocaux} locaux
              </span>
            </div>
            <div className='h-1.5 w-full overflow-hidden rounded-full bg-muted'>
              <div className={`h-full rounded-full ${barre}`} style={{ width: `${Math.min(100, taux)}%` }} />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'revenuAnnuel',
      header: () => <div className='text-right'>Revenu annuel</div>,
      cell: ({ row }) => (
        <MoneyCell
          value={row.original.revenuAnnuel}
          secondary={row.original.revenuAnnuel > 0 ? `${fmtMoney(row.original.revenuAnnuel / 12)} / mois` : null}
        />
      ),
    },
    {
      // RMANew (ListBuilding.vb) : colonne « Rendement » - le calcul n'est pas encore migré.
      id: 'rendement',
      header: () => <div className='text-right'>Rendement (%)</div>,
      cell: () => <div className='text-right text-muted-foreground'>—</div>,
    },
    {
      // RMANew (ListBuilding.vb) : colonne « Charges annuelles » - le module Charges n'alimente pas encore cette liste.
      id: 'chargesAnnuelles',
      header: () => <div className='text-right'>Charges annuelles (MAD)</div>,
      cell: () => <div className='text-right text-muted-foreground'>—</div>,
    },
    {
      id: 'ficheSignaletique',
      header: () => <div className='text-center'>Fiche signalétique</div>,
      cell: ({ row }) => (
        <IconTile icon={FileDown} label='Télécharger la fiche signalétique' tone='sky' onClick={() => generateFicheSignaletique(row.original)} />
      ),
    },
    {
      id: 'details',
      size: 100,
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <RowActions onEdit={() => openBuilding(row.original, 'modifier')} />
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) =>
      dispatch(getAllBuildings({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllBuildings({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Building2}
            title={prospectionId ? 'Biens' : 'Actifs'}
            description={
              prospectionId
                ? 'Biens rattachés à cette prospection'
                : 'Gérer le patrimoine immobilier (actifs et biens)'
            }
            actions={headerActions}
            buttons={[
              {
                label: prospectionId ? 'Ajouter un bien' : 'Ajouter un actif',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetBuilding());
                  navigate(prospectionId ? `ajouter?prospection=${prospectionId}` : 'ajouter');
                },
              },
            ]}
          />
          {actifId > 0 && (
            <button
              type='button'
              onClick={() =>
                setSearchParams((prev) => {
                  const next = new URLSearchParams(prev);
                  next.delete('actif');
                  return next;
                })
              }
              className='inline-flex items-center gap-1.5 text-sm text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-3 py-1'
            >
              Filtré par actif : {actifs.find((b) => b.numero === actifId)?.designation ?? actifId}
              <X className='h-3.5 w-3.5' />
            </button>
          )}
          {prospectionId > 0 && (
            <button
              type='button'
              onClick={clearProspectionFilter}
              className='inline-flex items-center gap-1.5 text-sm text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-3 py-1'
            >
              Filtré par prospection
              <X className='h-3.5 w-3.5' />
            </button>
          )}

          <KpiStrip>
            <KpiCard
              icon={Building2}
              label={prospectionId ? 'Biens' : 'Actifs'}
              value={kpis ? String(kpis.actifs) : '—'}
              hint={kpis ? `${fmtMoney(kpis.surface)} m² de superficie` : undefined}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={Home}
              label='Locaux'
              value={kpis ? String(kpis.locaux) : '—'}
              hint={kpis ? `${kpis.baux} sous bail` : undefined}
              tone={KPI_TONES.sky}
            />
            <KpiCard
              icon={Percent}
              label="Taux d'occupation"
              value={kpis ? `${kpis.taux} %` : '—'}
              hint='baux / locaux'
              tone={kpis && kpis.taux < 60 ? KPI_TONES.red : kpis && kpis.taux < 90 ? KPI_TONES.amber : KPI_TONES.green}
            />
            <KpiCard
              icon={Banknote}
              label='Revenu annuel'
              value={kpis ? `${fmtMoney(kpis.revenu)} MAD` : '—'}
              hint={kpis ? `soit ${fmtMoney(kpis.revenu / 12)} MAD / mois` : undefined}
              tone={KPI_TONES.green}
            />
          </KpiStrip>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'designation', title: 'Actif' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowClick={(building) => openBuilding(building, 'details')}
          pagination={pagination}
        />

      </CardContent>
    </Card>
  );
};

export default Buildings;
