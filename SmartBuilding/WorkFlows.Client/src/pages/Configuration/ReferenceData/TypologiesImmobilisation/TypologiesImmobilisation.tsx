import { ExcelFileIcon, PdfFileIcon } from '@/components/icons/file-icons';
import { BaseDialog } from '@/components/dialog/dialog';
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
import { TypologieImmobilisationResponse } from '@/store/features/configuration/typologieImmobilisation-schemas';
import {
  deleteTypologieImmobilisation,
  getAllTypologiesImmobilisation,
  resetTypologieImmobilisation,
  setTypologieImmobilisation,
} from '@/store/features/configuration/typologiesImmobilisationSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, ChevronDown, Download, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const EXPORT_HEADER = [
  'Immobilisation Concernées',
  'Compte comptable',
  'Compte amortissement',
  'Compte dotation',
  'Taux Amotissement',
  'Durée Amortissement',
];

const TypologiesImmobilisation = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.cfgTypologiesImmobilisation,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TypologieImmobilisationResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllTypologiesImmobilisation({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllTypologiesImmobilisation({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: TypologieImmobilisationResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteTypologieImmobilisation(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Typologie Immobilisation');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    allItems.forEach((t) =>
      sheet.addRow([
        t.immobilisationConcernee,
        t.compteComptable || '-',
        t.compteAmortissement || '-',
        t.compteDotation || '-',
        t.taux != null ? `${t.taux} %` : '-',
        t.duree != null ? `${t.duree} ans` : '-',
      ]),
    );
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const url = URL.createObjectURL(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `Typologie-Immobilisation-${new Date().toISOString().slice(0, 10)}.xlsx`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Typologie Immobilisation', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: allItems.map((t) => [
        t.immobilisationConcernee,
        t.compteComptable || '-',
        t.compteAmortissement || '-',
        t.compteDotation || '-',
        t.taux != null ? `${t.taux} %` : '-',
        t.duree != null ? `${t.duree} ans` : '-',
      ]),
      styles: { fontSize: 8 },
    });
    doc.save(`Typologie-Immobilisation-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<TypologieImmobilisationResponse>[] = [
    {
      accessorKey: 'immobilisationConcernee',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Immobilisation Concernée' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('immobilisationConcernee')}</div>,
    },
    {
      accessorKey: 'compteComptable',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Compte Comptable' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.compteComptable || '-'}</div>,
    },
    {
      accessorKey: 'compteAmortissement',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Compte Amortissement' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.compteAmortissement || '-'}</div>,
    },
    {
      accessorKey: 'compteDotation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Compte Dotation' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.compteDotation || '-'}</div>,
    },
    {
      accessorKey: 'taux',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Taux' />,
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.taux !== null && row.original.taux !== undefined ? `${row.original.taux} %` : '-'}</div>
      ),
    },
    {
      accessorKey: 'duree',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durée' />,
      cell: ({ row }) => (
        <div className='font-medium'>{row.original.duree !== null && row.original.duree !== undefined ? `${row.original.duree} ans` : '-'}</div>
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
              dispatch(setTypologieImmobilisation(row.original));
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
      dispatch(getAllTypologiesImmobilisation({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllTypologiesImmobilisation({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Building2}
            title="Typologies d'immobilisation"
            description="Gérer les typologies d'immobilisation"
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'immobilisationConcernee', title: 'Immobilisation Concernée' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setTypologieImmobilisation(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
          toolbar={
            <div className='flex items-center gap-2'>
              <Button
                size='sm'
                onClick={() => {
                  dispatch(resetTypologieImmobilisation());
                  navigate('ajouter');
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
          description={`Êtes-vous sûr de vouloir supprimer "${selectedItem?.immobilisationConcernee || ''}" ?`}
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

export default TypologiesImmobilisation;
