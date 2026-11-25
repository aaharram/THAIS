import { ExportTiles } from '@/components/export/export-tiles';
import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { getDashboardActifs } from '@/store/features/dashboard/dashboardSlice';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { BuildingResponse } from '@/store/features/patrimoine/building-schemas';
import {
  deleteBuilding,
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
import { Building2, CirclePlus, Download, ImageOff, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const Buildings = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.buildings,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BuildingResponse | null>(null);
  const [search, setSearch] = useState('');
  const [noProprietaire, setNoProprietaire] = useState<string>('0');
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

  const handleDelete = (item: BuildingResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteBuilding(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
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
      <div className='w-52'>
        <Select
          value={actifId ? actifId.toString() : '0'}
          onValueChange={(v) =>
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              if (v === '0') next.delete('actif');
              else next.set('actif', v);
              return next;
            })
          }
        >
          <SelectTrigger className='h-8'>
            <SelectValue placeholder='Tous les actifs' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>Tous les actifs</SelectItem>
            {actifs.map((b) => (
              <SelectItem key={b.numero} value={b.numero.toString()}>
                {b.designation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className='w-52'>
        <Select value={noProprietaire} onValueChange={setNoProprietaire}>
          <SelectTrigger className='h-8'>
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
        onImported={() => dispatch(getAllBuildings({ pageNumber: 1, pageSize, search, filters }))}
      />
    </>
  );

  const columns: ColumnDef<BuildingResponse>[] = [
    {
      id: 'image',
      size: 70,
      header: 'Image',
      cell: () => (
        <div className='flex items-center justify-center h-9 w-9 rounded-md bg-gray-100 text-gray-400'>
          <ImageOff className='h-4 w-4' />
        </div>
      ),
    },
    {
      accessorKey: 'codeImmeuble',
      size: 120,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Code Analytique' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('codeImmeuble')}</div>,
    },
    {
      accessorKey: 'designation',
      size: 180,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => (
        // RMANew (ListBuilding.vb, GenerateTable) : colonne "Immeuble" en
        // white-space:nowrap + text-overflow:ellipsis (tooltip natif via title) plutôt
        // que du texte qui retombe à la ligne.
        <div className='font-medium truncate' title={row.getValue('designation')}>
          {row.getValue('designation')}
        </div>
      ),
    },
    {
      accessorKey: 'nomBuildingType',
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Typologie' />,
      cell: ({ row }) => <div className='font-medium truncate'>{row.original.nomBuildingType || '-'}</div>,
    },
    {
      accessorKey: 'titreFoncier',
      size: 140,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Titre Foncier' />,
      cell: ({ row }) => (
        <div className='font-medium truncate' title={row.original.titreFoncier ?? undefined}>
          {row.original.titreFoncier || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'nomCity',
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ville' />,
      cell: ({ row }) => <div className='font-medium truncate'>{row.original.nomCity || '-'}</div>,
    },
    {
      accessorKey: 'surfaceUtile',
      size: 100,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie (m²)' />,
      cell: ({ row }) => <div className='font-medium'>{formatSurface(row.original.surfaceUtile)}</div>,
    },
    {
      accessorKey: 'nbLocaux',
      size: 90,
      header: () => <div className='text-center'>Locaux</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:cursor-default disabled:hover:bg-primary/10'
            disabled={row.original.nbLocaux === 0}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/locaux?building=${row.original.numero}`);
            }}
          >
            {row.original.nbLocaux}
          </button>
          <button
            type='button'
            className='text-primary hover:text-primary/70'
            title='Ajouter un local'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/locaux/ajouter?building=${row.original.numero}`);
            }}
          >
            <CirclePlus className='h-4 w-4' />
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'nbBaux',
      size: 90,
      header: () => <div className='text-center'>Baux</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:cursor-default disabled:hover:bg-primary/10'
            disabled={row.original.nbBaux === 0}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/leasing-management/baux?building=${row.original.numero}`);
            }}
          >
            {row.original.nbBaux}
          </button>
          <button
            type='button'
            className='text-primary hover:text-primary/70'
            title='Ajouter un bail'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/leasing-management/baux/ajouter?building=${row.original.numero}`);
            }}
          >
            <CirclePlus className='h-4 w-4' />
          </button>
        </div>
      ),
    },
    {
      // RMANew (ListBuilding.vb) : Taux = (NbBaux / NbLots) * 100 - la même formule
      // simple qui alimente réellement cette colonne affichée, pas le taux pondéré par
      // surface calculé ailleurs dans ce même fichier mais jamais utilisé ici.
      id: 'tauxOccupation',
      // "Taux d'occupation (%)" a 3 mots séparés par des espaces - en dessous de ~125px
      // le libellé retombe sur 3 lignes ("Taux" / "d'occupation" / "(%)") au lieu de 2
      // ("Taux d'occupation" / "(%)"), d'où cette largeur un peu plus généreuse.
      size: 130,
      accessorFn: (row) => (row.nbLocaux > 0 ? (row.nbBaux / row.nbLocaux) * 100 : 0),
      header: () => <div className='text-center'>Taux d&apos;occupation (%)</div>,
      cell: ({ row }) => {
        const taux = row.original.nbLocaux > 0 ? (row.original.nbBaux / row.original.nbLocaux) * 100 : 0;
        return <div className='font-medium text-center'>{taux.toLocaleString('fr-FR', { maximumFractionDigits: 2 })}%</div>;
      },
    },
    {
      accessorKey: 'revenuAnnuel',
      size: 130,
      header: ({ column }) => <DataTableColumnHeader column={column} title='Revenu annuel (MAD)' />,
      cell: ({ row }) => (
        <div className='font-medium text-right'>
          {row.original.revenuAnnuel.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      ),
    },
    {
      id: 'rendement',
      size: 90,
      header: 'Rendement (%)',
      cell: () => <div className='font-medium text-center'>-</div>,
    },
    {
      id: 'chargesAnnuelles',
      // Même raison que "Taux d'occupation" ci-dessus : "Charges annuelles (MAD)" a 3
      // mots, "Charges annuelles" a besoin d'assez de place pour tenir sur une seule
      // ligne, laissant "(MAD)" seul sur la deuxième.
      size: 145,
      header: 'Charges annuelles (MAD)',
      cell: () => <div className='font-medium text-right'>-</div>,
    },
    {
      id: 'ficheSignaletique',
      size: 100,
      header: () => <div className='text-center'>Fiche signalétique</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            title='Télécharger la fiche signalétique'
            onClick={(e) => {
              e.stopPropagation();
              generateFicheSignaletique(row.original);
            }}
          >
            <Download className='h-4 w-4 text-primary' />
          </Button>
        </div>
      ),
    },
    {
      id: 'details',
      size: 100,
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-yellow-100'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setBuilding(row.original));
              navigate(`modifier/${row.original.numero}`);
            }}
          >
            <Pencil className='h-4 w-4 text-yellow-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-red-100'
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original);
            }}
          >
            <Trash2 className='h-4 w-4 text-red-600' />
          </Button>
        </div>
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
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'designation', title: 'Actif' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setBuilding(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver "${selectedItem?.designation || ''}" ?`}
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

export default Buildings;
