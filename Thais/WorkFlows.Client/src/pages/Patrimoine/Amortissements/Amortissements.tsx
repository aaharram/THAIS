import { ExportTiles } from '@/components/export/export-tiles';
import type ExcelJS from 'exceljs';
import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import {
  TableauAmortissementImportRow,
  TableauAmortissementResponse,
} from '@/store/features/patrimoine/amortissement-schemas';
import {
  deleteAmortissement,
  getAllAmortissements,
  getPeriodesValidation,
  importAmortissements,
  resetAmortissement,
  validerPeriodeAmortissement,
} from '@/store/features/patrimoine/amortissementsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { ClipboardList, Download, Pencil, Plus, RefreshCw, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

const MOIS_CAPITALISES = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

// RMANew (ListAmortissement.vb, ImportExcelHeader/ImportExcelField) : ordre et intitulés
// exacts des colonnes attendues à l'import - Désignation et Immobilisations concernées
// doivent correspondre à un Actif/Typologie déjà existant (voir TableauAmortissementService.
// ImportAsync côté serveur).
const IMPORT_HEADER = [
  'Désignation',
  'Immobilisations concernées',
  "Date d'entrée",
  "Valeur à amortir Prix d'acquisition",
  'Amortissements antérieurs',
  'Amortissements Taux',
  'Amortissements Durée',
  'Amortissements normaux',
  'Total des amortissements',
];

// RMANew (ListAmortissement.vb, ExportExcelAmortissement/ExportPDF) : colonnes d'export
// identiques à la liste, sans la colonne Actions.
const EXPORT_HEADER = [
  'Désignation',
  'Immobilisations concernées',
  "Date d'entrée",
  "Valeur à amortir Prix d'acquisition",
  'Valeur construction',
  'Valeur terrain',
  'Amortissements antérieurs',
  'Amortissements Taux',
  'Amortissements Durée',
  'Amortissements normaux',
  'Total des amortissements',
  'Date prochaine amortissement',
  'Compte',
  'SousCompte',
  'Titre foncier',
  'Affectation',
];

const Amortissements = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, periodesValidation, loading } = useAppSelector(
    (state) => state.amortissements,
  );
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TableauAmortissementResponse | null>(null);
  const [search, setSearch] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [periodeChoisie, setPeriodeChoisie] = useState<string | null>(null);
  const [validerDialogOpen, setValiderDialogOpen] = useState(false);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    dispatch(getAllAmortissements({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  useEffect(() => {
    dispatch(getPeriodesValidation());
  }, [dispatch]);

  // Parsing direct de la chaîne ISO (pas via `new Date(...)`) pour éviter tout décalage
  // de fuseau horaire sur une date-heure minuit sans indicateur UTC explicite.
  const fmtPeriodeLabel = (periode: string) => {
    const [year, month] = periode.split('-');
    return `${MOIS_CAPITALISES[Number(month) - 1]} ${year}`;
  };

  const handleChoisirPeriode = (periode: string) => {
    const option = periodesValidation.find((p) => p.periode === periode);
    if (!option || option.valide) return;
    setPeriodeChoisie(periode);
    setValiderDialogOpen(true);
  };

  const confirmValiderPeriode = async () => {
    if (!periodeChoisie) return;
    setValidating(true);
    try {
      await dispatch(validerPeriodeAmortissement({ addUser: userId, periode: periodeChoisie })).unwrap();
      setValiderDialogOpen(false);
      setPeriodeChoisie(null);
    } catch {
      // l'erreur est déjà remontée via le toast du thunk
    } finally {
      setValidating(false);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllAmortissements({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: TableauAmortissementResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteAmortissement(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportRows = () =>
    allItems.map((a) => [
      a.nomBuilding || '-',
      a.nomImmobConcernees || '-',
      fmtDate(a.dateEntree),
      String(a.vaPrixAcquisition),
      a.valeurConstruction != null ? String(a.valeurConstruction) : '-',
      a.valeurTerrain != null ? String(a.valeurTerrain) : '-',
      String(a.amortiAnterieurs),
      `${a.amortiDbeneficebTaux}%`,
      `${a.amortiDbenficebDuree} Ans`,
      String(a.amortiDbeneficebNorm),
      String(a.totalAmortiAlaFin),
      fmtDate(a.dateProchaineAmorti),
      a.compteComptable || '-',
      a.compteGeneral || '-',
      a.titreFoncier || '-',
      a.nAffectation || '-',
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('TableauAmortissement');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Tableau-Amortissement-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleDownloadTemplate = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Import');
    sheet.addRow(IMPORT_HEADER).font = { bold: true };
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      "Modele-Import-Amortissement.xlsx",
    );
  };

  // Lecture insensible à la casse/ordre des en-têtes (plus tolérante que RMANew, qui lit
  // les colonnes par position stricte) - une valeur de cellule numérique brute (Excel la
  // stocke comme nombre) comme une date sérielle Excel sont toutes deux gérées.
  const excelDateToIso = (value: unknown): string | undefined => {
    if (value == null || value === '') return undefined;
    if (value instanceof Date) return value.toISOString();
    if (typeof value === 'number') {
      const epoch = new Date(Date.UTC(1899, 11, 30));
      return new Date(epoch.getTime() + value * 86400000).toISOString();
    }
    const parsed = new Date(String(value));
    return isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
  };

  const numOrZero = (value: unknown): number => {
    if (value == null || value === '') return 0;
    const n = typeof value === 'number' ? value : Number(String(value).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  };

  const parseImportFile = async (file: File): Promise<TableauAmortissementImportRow[]> => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const sheet = workbook.worksheets[0];
    if (!sheet) return [];

    const headerRow = sheet.getRow(1);
    const columnIndex: Record<string, number> = {};
    headerRow.eachCell((cell, colNumber) => {
      const key = String(cell.value ?? '').trim().toLowerCase();
      if (key) columnIndex[key] = colNumber;
    });

    const get = (row: ExcelJS.Row, header: string) => {
      const idx = columnIndex[header.toLowerCase()];
      return idx ? row.getCell(idx).value : undefined;
    };

    const rows: TableauAmortissementImportRow[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const designation = String(get(row, 'Désignation') ?? '').trim();
      const immobilisationConcernee = String(get(row, 'Immobilisations concernées') ?? '').trim();
      if (!designation || !immobilisationConcernee) return;

      rows.push({
        designation,
        immobilisationConcernee,
        dateEntree: excelDateToIso(get(row, "Date d'entrée")),
        vaPrixAcquisition: numOrZero(get(row, "Valeur à amortir Prix d'acquisition")),
        amortiAnterieurs: numOrZero(get(row, 'Amortissements antérieurs')),
        amortiDbeneficebTaux: numOrZero(get(row, 'Amortissements Taux')),
        amortiDbenficebDuree: numOrZero(get(row, 'Amortissements Durée')),
        amortiDbeneficebNorm: numOrZero(get(row, 'Amortissements normaux')),
        totalAmortiAlaFin: numOrZero(get(row, 'Total des amortissements')),
      });
    });

    return rows;
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const rows = await parseImportFile(importFile);
      await dispatch(importAmortissements({ addUser: userId, rows })).unwrap();
      setImportDialogOpen(false);
      setImportFile(null);
    } catch {
      // l'erreur est déjà remontée via le toast du thunk
    } finally {
      setImporting(false);
    }
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text("Tableau d'amortissement", 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
      styles: { fontSize: 6 },
    });
    doc.save(`Tableau-Amortissement-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<TableauAmortissementResponse>[] = [
    {
      accessorKey: 'numero',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N°' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numero}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Désignation' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomImmobConcernees',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Immobilisations concernées' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomImmobConcernees || '-'}</div>,
    },
    {
      id: 'dateEntree',
      accessorFn: (row) => fmtDate(row.dateEntree),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'entrée" />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateEntree)}</div>,
    },
    {
      accessorKey: 'vaPrixAcquisition',
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Valeur à amortir/prix d'acquisition" />
      ),
      cell: ({ row }) => <div className='font-medium'>{row.original.vaPrixAcquisition}</div>,
    },
    {
      accessorKey: 'valeurTerrain',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Valeur Terrain' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.valeurTerrain ?? '-'}</div>,
    },
    {
      accessorKey: 'valeurConstruction',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Valeur Construction' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.valeurConstruction ?? '-'}</div>,
    },
    {
      accessorKey: 'valeurAmenagement',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Valeur Aménagement' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.valeurAmenagement ?? '-'}</div>,
    },
    {
      accessorKey: 'amortiAnterieurs',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Amortissements antérieurs' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.amortiAnterieurs}</div>,
    },
    {
      accessorKey: 'amortiDbeneficebTaux',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Amortissements Taux' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.amortiDbeneficebTaux}%</div>,
    },
    {
      accessorKey: 'amortiDbenficebDuree',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Amortissements Durée' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.amortiDbenficebDuree}</div>,
    },
    {
      accessorKey: 'amortiDbeneficebNorm',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Amortissements normaux' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.amortiDbeneficebNorm}</div>,
    },
    {
      accessorKey: 'totalAmortiAlaFin',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total des amortissements' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.totalAmortiAlaFin}</div>,
    },
    {
      id: 'dateProchaineAmorti',
      accessorFn: (row) => fmtDate(row.dateProchaineAmorti),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date prochaine d'amortissement" />
      ),
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateProchaineAmorti)}</div>,
    },
    {
      accessorKey: 'compteComptable',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Compte' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.compteComptable || '-'}</div>,
    },
    {
      accessorKey: 'compteGeneral',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Sous Compte' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.compteGeneral || '-'}</div>,
    },
    {
      accessorKey: 'nAffectation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Affectation' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nAffectation || '-'}</div>,
    },
    {
      accessorKey: 'titreFoncier',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Titre Foncier' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.titreFoncier || '-'}</div>,
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
      dispatch(getAllAmortissements({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllAmortissements({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={ClipboardList}
            title="Tableau d'amortissement"
            description="Suivi des amortissements des immobilisations"
          />
        </div>

        <div className='overflow-x-auto'>
          <DataTable
            columns={columns}
            data={allItems}
            searchableColumns={[{ id: 'nomBuilding', title: 'Désignation' }]}
            centerToolbar={
              <Select value='' onValueChange={handleChoisirPeriode}>
                <SelectTrigger className='w-72'>
                  <SelectValue placeholder="Valider tableau d'amortissement" />
                </SelectTrigger>
                <SelectContent>
                  {periodesValidation.map((p) => (
                    <SelectItem key={p.periode} value={p.periode} disabled={p.valide}>
                      {fmtPeriodeLabel(p.periode)}
                      {p.valide ? ' (Validé)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
            onSearchChange={handleSearchChange}
            isLoading={loading}
            onRowDoubleClick={(item) => navigate(`modifier/${item.numero}`)}
            pagination={pagination}
            toolbar={
              <div className='flex items-center gap-2'>
                <Button
                  size='sm'
                  onClick={() => {
                    dispatch(resetAmortissement());
                    navigate('ajouter');
                  }}
                >
                  <Plus className='h-4 w-4 mr-2' />
                  Ajouter
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => {
                    setImportFile(null);
                    setImportDialogOpen(true);
                  }}
                >
                  <Upload className='h-4 w-4 mr-2' />
                  Importer
                </Button>
                <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
              </div>
            }
          />
        </div>

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer cet amortissement de "${selectedItem?.nomBuilding || ''}" ?`}
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

        <BaseDialog
          open={importDialogOpen}
          onOpenChange={(open) => {
            setImportDialogOpen(open);
            if (!open) setImportFile(null);
          }}
          title='Importation'
        >
          <div className='space-y-4'>
            <button
              type='button'
              onClick={handleDownloadTemplate}
              className='flex items-center gap-2 w-full rounded-md border bg-blue-50 px-4 py-3 text-sm text-blue-700 hover:bg-blue-100 text-left'
            >
              <Download className='h-4 w-4 shrink-0' />
              <span className='underline font-medium'>Téléchargez le modèle de fichier d&apos;importation.</span>
            </button>

            <div className='space-y-2'>
              <Label htmlFor='importFile'>Choisir le fichier</Label>
              <div className='flex items-center gap-2'>
                <Input
                  id='importFile'
                  readOnly
                  value={importFile?.name ?? ''}
                  placeholder='Aucun fichier sélectionné'
                  onClick={() => fileInputRef.current?.click()}
                  className='cursor-pointer'
                />
                <Button type='button' size='icon' onClick={() => fileInputRef.current?.click()}>
                  <Upload className='h-4 w-4' />
                </Button>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='.xlsx,.xls'
                  className='hidden'
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
          </div>

          <div className='flex justify-end gap-2 pt-4'>
            <Button variant='outline' onClick={() => setImportDialogOpen(false)}>
              Fermer
            </Button>
            <Button onClick={handleImport} disabled={!importFile || importing}>
              <Upload className='h-4 w-4 mr-2' />
              {importing ? 'Importation...' : 'Importer'}
            </Button>
          </div>
        </BaseDialog>

        <BaseDialog
          open={validerDialogOpen}
          onOpenChange={(open) => {
            setValiderDialogOpen(open);
            if (!open) setPeriodeChoisie(null);
          }}
          title="Valider le tableau d'amortissement"
          description={
            periodeChoisie
              ? `Confirmer la génération de l'amortissement pour ${fmtPeriodeLabel(periodeChoisie)} ? Cette action accroît l'amortissement de chaque ligne active échue pour ce mois.`
              : ''
          }
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setValiderDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmValiderPeriode} disabled={validating}>
              <RefreshCw className='h-4 w-4 mr-2' />
              {validating ? 'Validation...' : 'Valider'}
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default Amortissements;
