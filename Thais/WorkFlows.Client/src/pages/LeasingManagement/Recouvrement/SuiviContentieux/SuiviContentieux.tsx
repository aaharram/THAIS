import { ExportTiles } from '@/components/export/export-tiles';
import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { SuiviContentieuxResponse } from '@/store/features/leasing/suivi-contentieux-schemas';
import {
  deleteSuiviContentieux,
  getAllSuiviContentieux,
  resetSuiviContentieux,
  setSuiviContentieux,
} from '@/store/features/leasing/suiviContentieuxSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { downloadAttachment } from '@/store/services/attachments';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Gavel, Pencil, Plus, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const EXPORT_HEADER = ['Locataire', 'Actif', 'Ville', 'Avocat(s)', 'Suivi', 'Nature Procédure', 'Impayé (MAD)', 'Statut Dossier'];

// RMANew (ListSuiviJuridique.vb, StatutDossier codes 1-5)
const statutBadgeClass = (statut: string) => {
  if (statut === 'En Contentieux') return 'text-red-700 bg-red-100';
  if (statut === 'Dossier jugé' || statut === 'Accord amiable' || statut === 'Non Contentieux') {
    return 'text-green-700 bg-green-100';
  }
  return 'text-gray-600 bg-gray-100'; // Nouveau
};

const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const SuiviContentieux = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.suiviContentieux);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SuiviContentieuxResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllSuiviContentieux({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllSuiviContentieux({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: SuiviContentieuxResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteSuiviContentieux(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportRows = () =>
    allItems.map((s) => [
      s.nomLocataire || '-',
      s.nomBuilding || '-',
      s.ville || '-',
      String(s.avocatCount),
      s.observation || '-',
      s.natureProcedure || '-',
      fmtMontant(s.montantImpaye),
      s.statutDossier,
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Suivi Contentieux');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Suivi-Contentieux-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Suivi Contentieux', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Suivi-Contentieux-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<SuiviContentieuxResponse>[] = [
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'ville',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ville' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.ville || '-'}</div>,
    },
    {
      accessorKey: 'avocatCount',
      header: () => <div className='text-center'>Avocat</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-2'>
          <button
            type='button'
            title='Voir les avocats'
            className='inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-100 px-1.5 text-xs font-bold text-blue-700 hover:bg-blue-200'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${row.original.numero}/avocats`);
            }}
          >
            {row.original.avocatCount}
          </button>
          <Button
            variant='ghost'
            size='sm'
            className='h-6 w-6 p-0 hover:bg-blue-100'
            title='Ajouter un avocat'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`${row.original.numero}/avocats/ajouter`);
            }}
          >
            <PlusCircle className='h-4 w-4 text-blue-600' />
          </Button>
        </div>
      ),
    },
    {
      accessorKey: 'observation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Suivi' />,
      cell: ({ row }) => (
        <div className='max-w-[220px] truncate' title={row.original.observation || ''}>
          {row.original.observation || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'natureProcedure',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nature Procédure' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.natureProcedure || '-'}</div>,
    },
    {
      accessorKey: 'montantImpaye',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Impayé (MAD)' />,
      cell: ({ row }) => <div className='font-bold text-orange-600'>{fmtMontant(row.original.montantImpaye)}</div>,
    },
    {
      accessorKey: 'statutDossier',
      header: () => <div className='text-center'>Statut Dossier</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block w-fit text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statutBadgeClass(row.original.statutDossier)}`}
          >
            {row.original.statutDossier}
          </span>
        </div>
      ),
    },
    {
      id: 'piecesJointes',
      header: () => <div className='text-center'>Pièces jointes</div>,
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
                downloadAttachment('suivi-contentieux', row.original.pieceJointe!);
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
              dispatch(setSuiviContentieux(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllSuiviContentieux({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllSuiviContentieux({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Gavel}
            title='Suivi Contentieux'
            description='Suivi des dossiers contentieux'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetSuiviContentieux());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setSuiviContentieux(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
          toolbar={
            <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
          }
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description='Êtes-vous sûr de vouloir supprimer ce dossier contentieux ?'
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

export default SuiviContentieux;
