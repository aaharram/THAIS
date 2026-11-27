import { ExportTiles } from '@/components/export/export-tiles';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { AvatarCell, Chip, MoneyCell, PrimarySecondary } from '@/components/table/list-cells';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { PaiementResponse } from '@/store/features/leasing/paiement-schemas';
import { getPaiements, getPaiementsTotal } from '@/store/features/leasing/paiementsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

const EXPORT_HEADER = ['Actif', 'N°Contrat', 'Locataire', 'N° Encaissement', 'Date Encaissement', 'Période', 'Date Annulation', 'Encaissement (MAD)'];

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EncaissementsAnnules = () => {
  const dispatch = useAppDispatch();
  const {
    historique: allItems,
    historiqueTotalCount: totalCount,
    historiquePageNumber: pageNumber,
    historiquePageSize: pageSize,
    historiqueTotalMontant: totalMontant,
    loading,
  } = useAppSelector((state) => state.paiements);

  const [search, setSearch] = useState('');

  const fetchList = (page: number, size: number) => {
    dispatch(
      getPaiements({
        pageNumber: page,
        pageSize: size,
        search,
        statutAnnulation: 'annule',
      }),
    );
  };

  useEffect(() => {
    fetchList(1, pageSize);
    dispatch(getPaiementsTotal({ search, statutAnnulation: 'annule' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const fmtPeriode = (p: PaiementResponse) =>
    p.periodeDebut && p.periodeFin ? `${fmtDate(p.periodeDebut)} - ${fmtDate(p.periodeFin)}` : '-';

  const exportRows = () =>
    allItems.map((p) => [
      p.nomBuilding || '-',
      p.numContratLocations || '-',
      p.nomLocataire || '-',
      `ENC${p.numero}`,
      fmtDate(p.datePaiement),
      fmtPeriode(p),
      fmtDate(p.dateAnnulation),
      fmtMontant(p.montant),
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Encaissements annulés');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Encaissements-Annules-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Encaissements annulés', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Encaissements-Annules-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<PaiementResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N°Contrat' />,
      cell: ({ row }) => row.original.numContratLocations ? <Chip className='font-mono'>{row.original.numContratLocations}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <AvatarCell name={row.original.nomLocataire} />,
    },
    {
      accessorKey: 'numero',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Encaissement' />,
      cell: ({ row }) => <Chip className='font-mono'>ENC{row.original.numero}</Chip>,
    },
    {
      id: 'datePaiement',
      accessorFn: (row) => fmtDate(row.datePaiement),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Encaissement' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.datePaiement)}</span>,
    },
    {
      id: 'periode',
      accessorFn: (row) => fmtPeriode(row),
      header: () => <div>Période</div>,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtPeriode(row.original)}</span>,
    },
    {
      id: 'dateAnnulation',
      accessorFn: (row) => fmtDate(row.dateAnnulation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Annulation' sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateAnnulation)}</span>,
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Encaissement</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant} tone='danger' />,
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => fetchList(newPage + 1, pageSize),
    onPageSizeChange: (newSize: number) => fetchList(1, newSize),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <Title icon={XCircle} title='Encaissements annulés' description='Historique des encaissements annulés' />
            <div className='rounded-lg bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-400'>
              Total : {fmtMontant(totalMontant)} MAD
            </div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
          onSearchChange={setSearch}
          isLoading={loading}
          pagination={pagination}
          toolbar={
            <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
          }
        />
      </CardContent>
    </Card>
  );
};

export default EncaissementsAnnules;
