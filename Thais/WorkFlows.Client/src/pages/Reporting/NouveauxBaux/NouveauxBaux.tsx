import { ExportTiles } from '@/components/export/export-tiles';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { NouveauBailResponse } from '@/store/features/leasing/nouveau-bail-schemas';
import { getNouveauxBaux } from '@/store/features/leasing/nouveauxBauxSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { FilePlus } from 'lucide-react';
import { useEffect, useState } from 'react';

// RMANew (ViewReporting.aspx "Etat des Nouveaux Baux" -> Classes/ListNouveauxBaux.vb) :
// baux actifs signés dans l'année en cours, filtrables par Propriétaire, export Excel/PDF.
// Consultation seule, pas d'ajout/édition/suppression.
const EXPORT_HEADER = [
  'Actif',
  'Date du bail',
  'Locataire',
  'Usage',
  'Niveau',
  'Loyer Mensuel',
  'Cumul en montant (gains de loyers)',
  'Contrat',
  'Local',
  'Superficie (m²)',
  'Loyer de base',
  'Date de fin',
  'Date révision loyer',
  'Date prochaine revision',
];

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const NouveauxBaux = () => {
  const dispatch = useAppDispatch();
  const { allItems, loading } = useAppSelector((state) => state.nouveauxBaux);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [noProprietaire, setNoProprietaire] = useState(0);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getNouveauxBaux({ noProprietaire: noProprietaire || undefined }));
  }, [dispatch, noProprietaire]);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportRows = () =>
    allItems.map((b) => [
      b.nomBuilding || '-',
      fmtDate(b.dateDebut),
      b.nomLocataire || '-',
      b.usage || '-',
      b.etage || '-',
      b.loyerMensuel != null ? String(b.loyerMensuel) : '-',
      String(b.cumulMontant),
      b.numContratLocations || '-',
      b.nomLocal || '-',
      b.superficie != null ? String(b.superficie) : '-',
      b.loyerDeBase != null ? String(b.loyerDeBase) : '-',
      fmtDate(b.dateFin),
      fmtDate(b.dateRevision),
      fmtDate(b.dateProchaineRevision),
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Contrats');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Nouveaux-Baux-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Etat des Nouveaux Baux', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
      styles: { fontSize: 6 },
    });
    doc.save(`Nouveaux-Baux-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<NouveauBailResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      id: 'dateDebut',
      accessorFn: (row) => fmtDate(row.dateDebut),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date du bail' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateDebut)}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'usage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Usage' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.usage || '-'}</div>,
    },
    {
      accessorKey: 'etage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Niveau' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.etage || '-'}</div>,
    },
    {
      accessorKey: 'loyerMensuel',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer Mensuel' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.loyerMensuel)}</div>,
    },
    {
      accessorKey: 'cumulMontant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Cumul (gains de loyers)' />,
      cell: ({ row }) => <div className='font-medium text-green-700'>{fmtMontant(row.original.cumulMontant)}</div>,
    },
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocal || '-'}</div>,
    },
    {
      accessorKey: 'superficie',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie (m²)' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.superficie ?? '-'}</div>,
    },
    {
      accessorKey: 'loyerDeBase',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer de base' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.loyerDeBase)}</div>,
    },
    {
      id: 'dateFin',
      accessorFn: (row) => fmtDate(row.dateFin),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date de fin' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateFin)}</div>,
    },
    {
      id: 'dateRevision',
      accessorFn: (row) => fmtDate(row.dateRevision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date révision loyer' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateRevision)}</div>,
    },
    {
      id: 'dateProchaineRevision',
      accessorFn: (row) => fmtDate(row.dateProchaineRevision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date prochaine révision' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateProchaineRevision)}</div>,
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={FilePlus} title='Etat des Nouveaux Baux' description={`Baux signés en ${new Date().getFullYear()}`} />
        </div>

        <div className='overflow-x-auto'>
          <DataTable
            columns={columns}
            data={allItems}
            searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
            isLoading={loading}
            toolbar={
              <div className='flex items-center gap-2'>
                <Select value={noProprietaire.toString()} onValueChange={(v) => setNoProprietaire(Number(v))}>
                  <SelectTrigger className='h-8 w-48'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Tous les Propriétaires</SelectItem>
                    {proprietaires.map((p) => (
                      <SelectItem key={p.numero} value={p.numero.toString()}>
                        {p.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
              </div>
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NouveauxBaux;
