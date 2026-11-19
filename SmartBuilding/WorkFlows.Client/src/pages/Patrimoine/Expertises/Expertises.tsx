import { BaseDialog } from '@/components/dialog/dialog';
import { ExcelFileIcon, PdfFileIcon } from '@/components/icons/file-icons';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { ExpertiseResponse, ExpertiseSummary } from '@/store/features/patrimoine/expertise-schemas';
import {
  deleteExpertise,
  getAllExpertises,
  getExpertisesSummary,
  resetExpertise,
} from '@/store/features/patrimoine/expertisesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { API_BASE_URL } from '@/store/services/api';
import { downloadAttachment } from '@/store/services/attachments';
import { api } from '@/store/services/authConfig';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, ChevronDown, CirclePlus, Download, FileSearch, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const Expertises = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, versions, versionsTotalCount, loading } = useAppSelector(
    (state) => state.expertises,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ExpertiseResponse | null>(null);
  const [search, setSearch] = useState('');
  const [noProprietaire, setNoProprietaire] = useState<string>('0');
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);

  // Filtre "Propriétaire" : même clé que la liste des actifs (Building.NoProprietaire).
  const summaryFilters = noProprietaire !== '0' ? { NoProprietaire: [Number(noProprietaire)] } : undefined;

  const noBuilding = Number(searchParams.get('building')) || 0;
  const noLocal = Number(searchParams.get('local')) || 0;
  const drillDown = noBuilding > 0 && noLocal > 0;
  const current = allItems.find((s) => s.noBuilding === noBuilding && s.noLocal === noLocal);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    if (!drillDown) {
      dispatch(
        getExpertisesSummary({
          pageNumber: 1,
          pageSize: 10,
          search,
          filters: noProprietaire !== '0' ? { NoProprietaire: [Number(noProprietaire)] } : undefined,
        }),
      );
    }
  }, [dispatch, search, drillDown, noProprietaire]);

  useEffect(() => {
    if (drillDown) {
      dispatch(
        getAllExpertises({
          pageNumber: 1,
          pageSize: 100,
          filters: { NoBuilding: [noBuilding], NoLocal: [noLocal] },
        }),
      );
    }
  }, [dispatch, drillDown, noBuilding, noLocal]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getExpertisesSummary({ pageNumber: 1, pageSize, search: value, filters: summaryFilters }));
  };

  const handleDelete = (item: ExpertiseResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteExpertise(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const backToSummary = () => setSearchParams({});

  // Export : comme RMANew (ExportExcel/ExportPDF), on exporte TOUTE la liste (filtre
  // propriétaire + recherche inclus), pas seulement la page affichée. Le backend plafonne
  // pageSize à 100, donc on parcourt les pages.
  const fetchAllSummaries = async (): Promise<ExpertiseSummary[]> => {
    const all: ExpertiseSummary[] = [];
    let page = 1;
    let total = 0;
    do {
      const urlParams = new URLSearchParams({ pageNumber: String(page), pageSize: '100' });
      if (search) urlParams.append('search', search);
      if (noProprietaire !== '0') {
        urlParams.append('Filters[0].Field', 'NoProprietaire');
        urlParams.append('Filters[0].Values[0]', noProprietaire);
      }
      const { data } = await api.get<{ items: ExpertiseSummary[]; totalCount: number }>(
        `${API_BASE_URL}/api/expertises/summary?${urlParams.toString()}`,
      );
      all.push(...data.items);
      total = data.totalCount;
      page += 1;
    } while (all.length < total);
    return all;
  };

  const EXPORT_HEADER = ['Actif', 'Titre foncier', 'Superficie m²', "Valeur d'entrée", 'Expertise', 'Date Expertise', 'Versions'];

  const fmtNumber = (v?: number | null) =>
    v === null || v === undefined ? '' : v.toLocaleString('fr-FR').replace(/\s/g, ' ');
  // Affichage des montants dans les listes : séparateur de milliers français + 2 décimales.
  const fmtMontant = (m?: number | null) =>
    m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (v?: string | null) => (v ? new Date(v).toLocaleDateString('fr-FR') : '');

  const toExportRows = (items: ExpertiseSummary[]) =>
    items.map((s) => [
      s.nomBuilding,
      s.titreFoncier ?? '',
      fmtNumber(s.surfaceUtile),
      fmtNumber(s.valeurEntree),
      fmtNumber(s.derniereExpertise),
      fmtDate(s.dateDerniereExpertise),
      String(s.nombreVersions),
    ]);

  const handleExportExcel = async () => {
    const rows = toExportRows(await fetchAllSummaries());
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Expertises');
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
    link.download = `Expertises-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    const rows = toExportRows(await fetchAllSummaries());
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.setFontSize(16);
    doc.text('Liste des Expertises', doc.internal.pageSize.getWidth() / 2, 14, { align: 'center' });
    autoTable(doc, {
      startY: 22,
      head: [EXPORT_HEADER],
      body: rows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [160, 160, 160] },
    });
    doc.save(`Expertises-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const summaryColumns: ColumnDef<ExpertiseSummary>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('nomBuilding')}</div>,
    },
    {
      accessorKey: 'titreFoncier',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Titre Foncier' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.titreFoncier || '-'}</div>,
    },
    {
      accessorKey: 'surfaceUtile',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie m²' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.surfaceUtile ?? '-'}</div>,
    },
    {
      accessorKey: 'valeurEntree',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Valeur d'entrée" />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.valeurEntree)}</div>,
    },
    {
      accessorKey: 'derniereExpertise',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Expertise' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.derniereExpertise)}</div>,
    },
    {
      id: 'dateDerniereExpertise',
      accessorFn: (row) =>
        row.dateDerniereExpertise ? new Date(row.dateDerniereExpertise).toLocaleDateString('fr-FR') : '',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Expertise' />,
      cell: ({ row }) =>
        row.original.dateDerniereExpertise ? (
          <div className='font-medium'>
            {new Date(row.original.dateDerniereExpertise).toLocaleDateString('fr-FR')}
          </div>
        ) : (
          <div className='font-medium'>-</div>
        ),
    },
    {
      id: 'versions',
      header: () => <div className='text-center'>Versions</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20'
            onClick={(e) => {
              e.stopPropagation();
              setSearchParams({ building: String(row.original.noBuilding), local: String(row.original.noLocal) });
            }}
          >
            {row.original.nombreVersions}
          </button>
          <button
            type='button'
            className='text-primary hover:text-primary/70'
            title='Ajouter une expertise'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(resetExpertise());
              navigate(
                `/patrimoine/expertises/ajouter?building=${row.original.noBuilding}&local=${row.original.noLocal}`,
              );
            }}
          >
            <CirclePlus className='h-4 w-4' />
          </button>
          <button
            type='button'
            className='text-yellow-600 hover:text-yellow-700'
            title='Modifier la dernière expertise'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/expertises/modifier/${row.original.derniereExpertiseNumero}`);
            }}
          >
            <Pencil className='h-4 w-4' />
          </button>
        </div>
      ),
    },
  ];

  const versionsColumns: ColumnDef<ExpertiseResponse>[] = [
    {
      accessorKey: 'cabinetExpert',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Cabinet d'expert" sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('cabinetExpert')}</div>,
    },
    {
      accessorKey: 'valeurTerrain',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Valeur Terrain' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.valeurTerrain)}</div>,
    },
    {
      accessorKey: 'valeurConstruction',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Valeur Construction' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.valeurConstruction)}</div>,
    },
    {
      accessorKey: 'valeurExpertiseActualiser',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nouvelle Expertise' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.valeurExpertiseActualiser)}</div>,
    },
    {
      id: 'dateExpertiseActualiser',
      accessorFn: (row) =>
        row.dateExpertiseActualiser ? new Date(row.dateExpertiseActualiser).toLocaleDateString('fr-FR') : '',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) =>
        row.original.dateExpertiseActualiser ? (
          <div className='font-medium'>
            {new Date(row.original.dateExpertiseActualiser).toLocaleDateString('fr-FR')}
          </div>
        ) : (
          <div className='font-medium'>-</div>
        ),
    },
    {
      id: 'piecesJointes',
      header: () => <div className='text-center'>Pièce jointe</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.pieceJointe ? (
            <Button
              variant='ghost'
              size='sm'
              className='h-7 w-7 p-0'
              title='Télécharger'
              onClick={(e) => {
                e.stopPropagation();
                downloadAttachment('expertises', row.original.pieceJointe!);
              }}
            >
              <Download className='h-4 w-4 text-blue-600' />
            </Button>
          ) : (
            <span className='text-muted-foreground'>-</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-yellow-100'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/expertises/modifier/${row.original.numero}`);
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
      dispatch(getExpertisesSummary({ pageNumber: newPage + 1, pageSize, search, filters: summaryFilters })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getExpertisesSummary({ pageNumber: 1, pageSize: newSize, search, filters: summaryFilters })),
    totalCount,
  };

  // Ordre dans l'en-tête (comme RMANew) : filtre propriétaire -> Export -> Ajouter.
  const summaryActions = drillDown ? undefined : (
    <>
      <div className='w-56'>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='h-8'>
            <Download className='h-4 w-4 mr-2' />
            Export
            <ChevronDown className='h-4 w-4 ml-2' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={handleExportPdf} className='gap-2'>
            <PdfFileIcon className='h-6 w-6' />
            PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportExcel} className='gap-2'>
            <ExcelFileIcon className='h-6 w-6' />
            Excel
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileSearch}
            title='Expertises'
            description={
              drillDown
                ? `Historique des expertises — ${current?.nomBuilding ?? ''}`
                : 'Suivi des expertises par titre foncier'
            }
            actions={summaryActions}
            buttons={
              drillDown
                ? [
                    { label: 'Retour', icon: ArrowLeft, variant: 'secondary', onClick: backToSummary },
                    {
                      label: 'Ajouter',
                      icon: Plus,
                      variant: 'default',
                      onClick: () => {
                        dispatch(resetExpertise());
                        navigate(`/patrimoine/expertises/ajouter?building=${noBuilding}&local=${noLocal}`);
                      },
                    },
                  ]
                : [
                    {
                      label: 'Ajouter',
                      icon: Plus,
                      variant: 'default',
                      onClick: () => {
                        dispatch(resetExpertise());
                        navigate('/patrimoine/expertises/ajouter');
                      },
                    },
                  ]
            }
          />
        </div>

        {drillDown ? (
          <DataTable
            columns={versionsColumns}
            data={versions}
            isLoading={loading}
            name={`${versionsTotalCount} versions`}
          />
        ) : (
          <DataTable
            columns={summaryColumns}
            data={allItems}
            searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
            onSearchChange={handleSearchChange}
            isLoading={loading}
            pagination={pagination}
          />
        )}

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer cette expertise de "${selectedItem?.cabinetExpert || ''}" ?`}
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

export default Expertises;
