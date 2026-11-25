import { ExportTiles } from '@/components/export/export-tiles';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { RevisionLoyerResponse } from '@/store/features/leasing/revision-loyer-schemas';
import { getRevisionsLoyerHistorique } from '@/store/features/leasing/revisionsLoyerSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { LineChart } from 'lucide-react';
import { useEffect, useState } from 'react';

const EXPORT_HEADER = [
  'Actif',
  'Locataire',
  'Anc. Loyer',
  'Nouv. Loyer',
  'Période Début',
  'Période Fin',
  'Ecart',
  'Reliquat RL',
  'Date saisie',
];

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const ecart = (row: RevisionLoyerResponse) => (row.nouveauLoyer ?? 0) - (row.ancienLoyer ?? 0);

// RMANew (ViewReporting.aspx "Révision Loyer" -> Classes/ListRévision.vb) : liste plate
// de toutes les révisions de loyer (pas un suivi par bail comme LeasingManagement/
// RevisionsLoyers) - mêmes colonnes/export que le legacy, aucun ajout/édition/suppression
// (lAllowAdd/Delete/FieldOption=False côté RMANew, page de consultation uniquement).
const RevisionLoyer = () => {
  const dispatch = useAppDispatch();
  const { historique, historiqueTotalCount, loading } = useAppSelector((state) => state.revisionsLoyer);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    dispatch(getRevisionsLoyerHistorique({ pageNumber, pageSize }));
  }, [dispatch, pageNumber, pageSize]);

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => setPageNumber(newPage + 1),
    onPageSizeChange: (newSize: number) => {
      setPageSize(newSize);
      setPageNumber(1);
    },
    totalCount: historiqueTotalCount,
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
    historique.map((r) => [
      r.nomBuilding || '-',
      r.nomLocataire || '-',
      r.ancienLoyer != null ? String(r.ancienLoyer) : '-',
      r.nouveauLoyer != null ? String(r.nouveauLoyer) : '-',
      fmtDate(r.dateRevision),
      fmtDate(r.dateProchaineRevision),
      String(ecart(r)),
      r.reliquat != null ? String(r.reliquat) : '-',
      fmtDate(r.addDate),
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Révision Loyer');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Revision-Loyer-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Révision Loyer', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
      styles: { fontSize: 7 },
    });
    doc.save(`Revision-Loyer-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<RevisionLoyerResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'ancienLoyer',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Anc Loyer' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.ancienLoyer)}</div>,
    },
    {
      accessorKey: 'nouveauLoyer',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nouv Loyer' />,
      cell: ({ row }) => <div className='font-medium text-blue-700'>{fmtMontant(row.original.nouveauLoyer)}</div>,
    },
    {
      id: 'dateRevision',
      accessorFn: (row) => fmtDate(row.dateRevision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ancienne Révision' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateRevision)}</div>,
    },
    {
      id: 'dateProchaineRevision',
      accessorFn: (row) => fmtDate(row.dateProchaineRevision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prochaine Révision' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateProchaineRevision)}</div>,
    },
    {
      id: 'ecart',
      accessorFn: (row) => ecart(row),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ecart' />,
      cell: ({ row }) => {
        const e = ecart(row.original);
        return <div className={`font-medium ${e > 0 ? 'text-green-700' : e < 0 ? 'text-red-700' : ''}`}>{fmtMontant(e)}</div>;
      },
    },
    {
      accessorKey: 'reliquat',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Reliquat RL' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.reliquat)}</div>,
    },
    {
      id: 'addDate',
      accessorFn: (row) => fmtDate(row.addDate),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date saisie' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.addDate)}</div>,
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={LineChart} title='Révision Loyer' description='Historique de toutes les révisions de loyer' />
        </div>

        <DataTable
          columns={columns}
          data={historique}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          isLoading={loading}
          name={`${historiqueTotalCount} révision(s)`}
          pagination={pagination}
          toolbar={
            <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
          }
        />
      </CardContent>
    </Card>
  );
};

export default RevisionLoyer;
