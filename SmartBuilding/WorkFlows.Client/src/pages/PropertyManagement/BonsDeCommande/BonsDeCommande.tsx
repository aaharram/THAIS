import type ExcelJS from 'exceljs';
import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Title } from '@/components/ui/title';
import { BonDeCommandeImportRow, BonDeCommandeResponse } from '@/store/features/property-management/bon-de-commande-schemas';
import {
  deleteBonDeCommande,
  getAllBonsDeCommande,
  importBonsDeCommande,
  resetBonDeCommande,
  setBonDeCommande,
} from '@/store/features/property-management/bonsDeCommandeSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Download, FileText, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';

// RMANew (ImportBonDeCommande.vb, ImportExcelHeader) : ordre et intitulés exacts des
// colonnes attendues à l'import - Fournisseur doit correspondre à un Prestataire déjà
// existant (voir BonDeCommandeService.ImportAsync côté serveur : pas d'auto-création
// contrairement à RMANew, un Prestataire a trop de champs obligatoires pour ça).
const IMPORT_HEADER = [
  'Numéro BC',
  'Date de Cmde',
  'Date de réception',
  'Compte',
  'Compte comptable',
  "Statut d'approbation",
  'Fournisseur',
];

const statutBadgeClass = (statut: string) => {
  switch (statut) {
    case 'Approuvé':
      return 'text-green-700 bg-green-100';
    case 'Rejeté':
      return 'text-red-700 bg-red-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

const BonsDeCommande = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.bonsDeCommandePm);
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BonDeCommandeResponse | null>(null);
  const [search, setSearch] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(getAllBonsDeCommande({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllBonsDeCommande({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: BonDeCommandeResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteBonDeCommande(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const handleDownloadTemplate = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Import');
    sheet.addRow(IMPORT_HEADER).font = { bold: true };
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Modele-Import-BonDeCommande.xlsx';
    link.click();
    URL.revokeObjectURL(url);
  };

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

  const parseImportFile = async (file: File): Promise<BonDeCommandeImportRow[]> => {
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

    const rows: BonDeCommandeImportRow[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;
      const numeroBonCommande = String(get(row, 'Numéro BC') ?? '').trim();
      const nomFournisseur = String(get(row, 'Fournisseur') ?? '').trim();
      const dateCommande = excelDateToIso(get(row, 'Date de Cmde'));
      if (!numeroBonCommande || !nomFournisseur || !dateCommande) return;

      rows.push({
        numeroBonCommande,
        nomFournisseur,
        dateCommande,
        dateReception: excelDateToIso(get(row, 'Date de réception')),
        compte: String(get(row, 'Compte') ?? '').trim() || undefined,
        compteComptable: String(get(row, 'Compte comptable') ?? '').trim() || undefined,
        statutApprobation: String(get(row, "Statut d'approbation") ?? '').trim() || undefined,
      });
    });

    return rows;
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const rows = await parseImportFile(importFile);
      await dispatch(importBonsDeCommande({ addUser: userId, rows })).unwrap();
      setImportDialogOpen(false);
      setImportFile(null);
    } catch {
      // l'erreur est déjà remontée via le toast du thunk
    } finally {
      setImporting(false);
    }
  };

  const columns: ColumnDef<BonDeCommandeResponse>[] = [
    {
      accessorKey: 'numeroBonCommande',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Bon' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numeroBonCommande}</div>,
    },
    {
      accessorKey: 'nomPrestataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prestataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomPrestataire || '-'}</div>,
    },
    {
      id: 'dateCommande',
      accessorFn: (row) => fmtDate(row.dateCommande),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date commande' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateCommande)}</div>,
    },
    {
      id: 'dateReception',
      accessorFn: (row) => fmtDate(row.dateReception),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date réception' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateReception)}</div>,
    },
    {
      accessorKey: 'compteComptable',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Compte comptable' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.compteComptable || '-'}</div>,
    },
    {
      accessorKey: 'statutApprobation',
      header: () => <div className='text-center'>Statut</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statutBadgeClass(row.original.statutApprobation)}`}
          >
            {row.original.statutApprobation}
          </span>
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
              dispatch(setBonDeCommande(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllBonsDeCommande({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllBonsDeCommande({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileText}
            title='Bon de Commande'
            description='Achats et prestations'
            buttons={[
              {
                label: 'Importer',
                icon: Upload,
                variant: 'outline',
                onClick: () => {
                  setImportFile(null);
                  setImportDialogOpen(true);
                },
              },
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetBonDeCommande());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'numeroBonCommande', title: 'N° Bon' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setBonDeCommande(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer le bon de commande "${selectedItem?.numeroBonCommande || ''}" ?`}
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
      </CardContent>
    </Card>
  );
};

export default BonsDeCommande;
