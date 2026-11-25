import { ExportTiles } from '@/components/export/export-tiles';
import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { AvocatResponse } from '@/store/features/leasing/avocat-schemas';
import { deleteAvocat, getAllAvocats, resetAvocat, setAvocat } from '@/store/features/leasing/avocatSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { downloadAttachment } from '@/store/services/attachments';
import { ColumnDef } from '@tanstack/react-table';
import { ChevronLeft, Download, Pencil, Plus, Scale, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

const EXPORT_HEADER = ['Nom', 'Prènom', 'Cabinet', 'Contrat'];

const Avocats = () => {
  const { id } = useParams();
  const noContentieux = Number(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.avocat);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AvocatResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllAvocats({ noContentieux, pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, noContentieux, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllAvocats({ noContentieux, pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: AvocatResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteAvocat({ id: selectedItem.numero, noContentieux }));
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

  const exportRows = () => allItems.map((a) => [a.nom || '-', a.prenom || '-', a.cabinet || '-', a.contrat || '-']);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Avocat');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Avocat-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Avocat', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Avocat-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<AvocatResponse>[] = [
    {
      accessorKey: 'nom',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nom' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nom || '-'}</div>,
    },
    {
      accessorKey: 'prenom',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prènom' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.prenom || '-'}</div>,
    },
    {
      accessorKey: 'cabinet',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Cabinet' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.cabinet || '-'}</div>,
    },
    {
      accessorKey: 'contrat',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.contrat || '-'}</div>,
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
                downloadAttachment('avocats', row.original.pieceJointe!);
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
              dispatch(setAvocat(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllAvocats({ noContentieux, pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllAvocats({ noContentieux, pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Scale}
            title='Avocat'
            description='Avocats rattachés à ce dossier contentieux'
            buttons={[
              {
                label: 'Retour',
                icon: ChevronLeft,
                variant: 'secondary',
                onClick: () => navigate('/leasing-management/recouvrement/suivi-contentieux'),
              },
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetAvocat());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nom', title: 'Nom' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setAvocat(item));
            navigate(`modifier/${item.numero}`);
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
          description='Êtes-vous sûr de vouloir supprimer cet avocat ?'
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

export default Avocats;
