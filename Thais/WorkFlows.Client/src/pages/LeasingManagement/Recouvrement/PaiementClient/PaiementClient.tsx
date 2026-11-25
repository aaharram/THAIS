import { ExportTiles } from '@/components/export/export-tiles';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { PaiementSummary } from '@/store/features/leasing/paiement-schemas';
import { getPaiementsSummary } from '@/store/features/leasing/paiementsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { CreditCard } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const EXPORT_HEADER = ['Locataire', 'Actif', 'Loyer mensuel (MAD)', 'Nb mois impayé', 'Montant loyer impayé (MAD)', 'Encaisseur'];

const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const PaiementClient = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.paiements);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);

  const [search, setSearch] = useState('');
  const [noProprietaire, setNoProprietaire] = useState('0');
  const [noEncaisseur, setNoEncaisseur] = useState('0');

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  const fetchSummary = (page: number, size: number, searchValue: string, proprietaireValue: string, encaisseurValue: string) => {
    dispatch(
      getPaiementsSummary({
        pageNumber: page,
        pageSize: size,
        search: searchValue,
        noProprietaire: Number(proprietaireValue) || undefined,
        noEncaisseur: Number(encaisseurValue) || undefined,
      }),
    );
  };

  useEffect(() => {
    fetchSummary(1, pageSize, search, noProprietaire, noEncaisseur);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search, noProprietaire, noEncaisseur]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportRows = () =>
    allItems.map((p) => [
      p.nomLocataire,
      p.nomBuilding,
      fmtMontant(p.loyerMensuel),
      p.nombreFacturesImpayees,
      fmtMontant(p.montantImpaye),
      p.nomEncaisseur || '-',
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Paiement Client');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Paiement-Client-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Paiement Client', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Paiement-Client-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<PaiementSummary>[] = [
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding}</div>,
    },
    {
      accessorKey: 'loyerMensuel',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer mensuel (MAD)' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.loyerMensuel)}</div>,
    },
    {
      accessorKey: 'nombreFacturesImpayees',
      header: () => <div className='text-center'>Nb mois impayé</div>,
      cell: ({ row }) => <div className='text-center font-medium'>{row.original.nombreFacturesImpayees}</div>,
    },
    {
      accessorKey: 'montantImpaye',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant loyer impayé (MAD)' />,
      cell: ({ row }) => <div className='font-bold text-orange-600'>{fmtMontant(row.original.montantImpaye)}</div>,
    },
    {
      accessorKey: 'nomEncaisseur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Encaisseur' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomEncaisseur || '-'}</div>,
    },
    {
      id: 'paiementDirect',
      header: () => <div className='text-right'>Paiement direct</div>,
      cell: ({ row }) => (
        <div className='flex justify-end'>
          <Button
            size='sm'
            onClick={() => navigate(`ajouter?noLocation=${row.original.noLocation}`)}
          >
            <CreditCard className='h-4 w-4 mr-2' />
            Payer
          </Button>
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => fetchSummary(newPage + 1, pageSize, search, noProprietaire, noEncaisseur),
    onPageSizeChange: (newSize: number) => fetchSummary(1, newSize, search, noProprietaire, noEncaisseur),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={CreditCard} title='Paiement Client' description='Paiement direct des loyers impayés par locataire' />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
          onSearchChange={setSearch}
          isLoading={loading}
          pagination={pagination}
          toolbar={
            <div className='flex items-center gap-2'>
              <div className='w-full sm:w-48'>
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
              <div className='w-full sm:w-48'>
                <Select value={noEncaisseur} onValueChange={setNoEncaisseur}>
                  <SelectTrigger className='h-8'>
                    <SelectValue placeholder='Choix Encaisseur' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Choix Encaisseur</SelectItem>
                    {encaisseurs.map((e) => (
                      <SelectItem key={e.numero} value={e.numero.toString()}>
                        {e.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};

export default PaiementClient;
