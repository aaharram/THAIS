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
import { Title } from '@/components/ui/title';
import { SyndicReunionResponse } from '@/store/features/property-management/syndic-reunion-schemas';
import {
  deleteSyndicReunion,
  getAllSyndicReunions,
  resetSyndicReunion,
  setSyndicReunion,
} from '@/store/features/property-management/syndicReunionsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronDown, Download, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const EXPORT_HEADER = [
  'Actif',
  'Type',
  'Lieu',
  'Date',
  'Pj Convocation',
  'Pj PV',
  'Appel de fonds annuel',
  'Pj Appel de fonds',
  'Quote part Appel de fonds',
  'Nombre de Quote part',
  'Réglé',
  'Date règlement',
];

// RMANew (ListSyndicReunion.aspx) : réunions filtrées pour un immeuble donné.
const Reunions = () => {
  const { buildingId } = useParams();
  const noBuilding = Number(buildingId);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.syndicReunions);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SyndicReunionResponse | null>(null);
  const basePath = `/property-management/syndics/${buildingId}/reunions`;

  useEffect(() => {
    dispatch(getAllSyndicReunions({ pageNumber: 1, pageSize: 10, filters: { NoBuilding: [noBuilding] } }));
  }, [dispatch, noBuilding]);

  const handleDelete = (item: SyndicReunionResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteSyndicReunion(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const exportRows = () =>
    allItems.map((r) => [
      r.nomBuilding ?? '',
      r.type ?? '',
      r.nomVille ?? '',
      fmtDate(r.dateReunion),
      r.pjConvocation ?? '',
      r.pjPV ?? '',
      r.appelFondsAnnuel ?? 0,
      r.pjAppelFonds ?? '',
      r.quotePartAppelFonds ?? 0,
      r.nombreQuotePart ?? 0,
      r.reglee ? 'Oui' : 'Non',
      fmtDate(r.dateReglement),
    ]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Réunions');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 18;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
      `Reunions-syndic-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Réunions de syndic', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Reunions-syndic-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<SyndicReunionResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'type',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.type || '-'}</div>,
    },
    {
      accessorKey: 'nomVille',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Lieu' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomVille || '-'}</div>,
    },
    {
      id: 'dateReunion',
      accessorFn: (row) => fmtDate(row.dateReunion),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateReunion)}</div>,
    },
    {
      accessorKey: 'pjConvocation',
      header: () => <div>Pj Convocation</div>,
      cell: ({ row }) => <div className='font-medium'>{row.original.pjConvocation || '-'}</div>,
    },
    {
      accessorKey: 'pjPV',
      header: () => <div>Pj PV</div>,
      cell: ({ row }) => <div className='font-medium'>{row.original.pjPV || '-'}</div>,
    },
    {
      accessorKey: 'appelFondsAnnuel',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Appel de fonds annuel' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.appelFondsAnnuel ?? 0}</div>,
    },
    {
      accessorKey: 'pjAppelFonds',
      header: () => <div>Pj Appel de fonds</div>,
      cell: ({ row }) => <div className='font-medium'>{row.original.pjAppelFonds || '-'}</div>,
    },
    {
      accessorKey: 'quotePartAppelFonds',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Quote part Appel de fonds' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.quotePartAppelFonds ?? 0}</div>,
    },
    {
      accessorKey: 'nombreQuotePart',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nombre de Quote part' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nombreQuotePart ?? 0}</div>,
    },
    {
      accessorKey: 'reglee',
      header: () => <div className='text-center'>Réglé</div>,
      cell: ({ row }) => <div className='text-center'>{row.original.reglee ? 'Oui' : 'Non'}</div>,
    },
    {
      id: 'dateReglement',
      accessorFn: (row) => fmtDate(row.dateReglement),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date règlement' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateReglement)}</div>,
    },
    {
      id: 'details',
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-yellow-100'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setSyndicReunion(row.original));
              navigate(`${basePath}/modifier/${row.original.numero}`);
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
      dispatch(getAllSyndicReunions({ pageNumber: newPage + 1, pageSize, filters: { NoBuilding: [noBuilding] } })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllSyndicReunions({ pageNumber: 1, pageSize: newSize, filters: { NoBuilding: [noBuilding] } })),
    totalCount,
  };

  const nomBuilding = allItems[0]?.nomBuilding;

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Users}
            title={nomBuilding ? `Réunions — ${nomBuilding}` : 'Réunions'}
            description='Historique des réunions de syndic'
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setSyndicReunion(item));
            navigate(`${basePath}/details/${item.numero}`);
          }}
          pagination={pagination}
          toolbar={
            <div className='flex items-center gap-2'>
              <Button
                className='h-8'
                onClick={() => {
                  dispatch(resetSyndicReunion());
                  navigate(`${basePath}/ajouter`);
                }}
              >
                <Plus className='h-4 w-4 mr-2' />
                Ajouter
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' className='h-8'>
                    <Download className='h-4 w-4 mr-2' />
                    Export
                    <ChevronDown className='h-4 w-4 ml-2' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem onClick={handleExportExcel} className='gap-2'>
                    <ExcelFileIcon className='h-6 w-6' />
                    Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf} className='gap-2'>
                    <PdfFileIcon className='h-6 w-6' />
                    PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          }
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description='Êtes-vous sûr de vouloir désactiver cette réunion ?'
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

export default Reunions;
