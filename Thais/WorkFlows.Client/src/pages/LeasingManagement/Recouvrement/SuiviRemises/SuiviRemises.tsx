import { ExportTiles } from '@/components/export/export-tiles';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Chip, MoneyCell } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { RemiseResponse, STATUTS_REMISE } from '@/store/features/leasing/remise-schemas';
import { getAllRemises, getAnneesRemises, getMoisRemises } from '@/store/features/leasing/remiseSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { RefreshCw, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

const EXPORT_HEADER = [
  "Date d'entrée",
  'Numéro de Remise',
  'Statut',
  'Montant',
  'Montant Restant',
  'Référence',
  'Date Annulation',
];

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// RMANew (ListRemise.vb, PostProcess "Statuts") : "Annulé" prend le dessus sur le Statut
// brut dès que isAnnuler=true, quelle que soit sa valeur.
const statutLabel = (item: RemiseResponse) => {
  if (item.isAnnuler) return 'Annulé';
  return STATUTS_REMISE.find((s) => s.value === item.statut)?.label ?? '-';
};
const statutBadgeClass = (item: RemiseResponse) => {
  if (item.isAnnuler) return 'bg-red-500/10 text-red-700 dark:text-red-400';
  return item.statut === 1 ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-600 dark:text-slate-300';
};

const MOIS_LABELS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
];

const SuiviRemises = () => {
  const dispatch = useAppDispatch();
  const { allItems, totalCount, pageNumber, pageSize, loading, annees, mois } = useAppSelector((state) => state.remise);
  const [search, setSearch] = useState('');
  // -1 = "Tous les statuts" (sentinel distinct from the real Statut=0 "Non consommé"
  // value - RMANew's own ListStatut() dropdown collides these into the same Id=0, which
  // is exactly what caused the label to render both texts overlapped here). Sent to the
  // backend as 0 either way, since RMANew's own filter logic treats them identically.
  const [statut, setStatut] = useState(-1);
  const [annee, setAnnee] = useState(0);
  const [moisSel, setMoisSel] = useState(0);

  useEffect(() => {
    dispatch(getAnneesRemises());
  }, [dispatch]);

  useEffect(() => {
    if (annee > 0) {
      dispatch(getMoisRemises(annee));
    }
  }, [annee, dispatch]);

  const fetchData = (overrides: { pageNumber?: number; pageSize?: number; search?: string; statut?: number; annee?: number; mois?: number }) => {
    dispatch(
      getAllRemises({
        pageNumber: overrides.pageNumber ?? 1,
        pageSize: overrides.pageSize ?? pageSize,
        search: overrides.search ?? search,
        statut: Math.max(overrides.statut ?? statut, 0),
        annee: overrides.annee ?? annee,
        mois: overrides.mois ?? moisSel,
      }),
    );
  };

  useEffect(() => {
    fetchData({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    fetchData({ search: value });
  };

  const handleStatutChange = (value: string) => {
    const v = Number(value);
    setStatut(v);
    fetchData({ statut: v });
  };

  const handleAnneeChange = (value: string) => {
    const v = Number(value);
    setAnnee(v);
    setMoisSel(0);
    fetchData({ annee: v, mois: 0 });
  };

  const handleMoisChange = (value: string) => {
    const v = Number(value);
    setMoisSel(v);
    fetchData({ mois: v });
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
    allItems.map((r) => [
      fmtDate(r.addDate),
      r.numRemise || '-',
      statutLabel(r),
      fmtMontant(r.montant),
      fmtMontant(r.montantRestant),
      r.reference || '-',
      fmtDate(r.dateAnnulation),
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Remises');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Remises-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Remises', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Remises-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<RemiseResponse>[] = [
    {
      id: 'dateEntree',
      accessorFn: (row) => fmtDate(row.addDate),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'entrée" sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.addDate)}</span>,
    },
    {
      accessorKey: 'numRemise',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Numéro de Remise' />,
      cell: ({ row }) => row.original.numRemise ? <Chip className='font-mono'>{row.original.numRemise}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      id: 'statut',
      accessorFn: (row) => statutLabel(row),
      header: () => <div className='text-center'>Statut</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block w-fit text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${statutBadgeClass(row.original)}`}
          >
            {statutLabel(row.original)}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Montant</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant} />,
    },
    {
      accessorKey: 'montantRestant',
      header: () => <div className='text-right'>Montant Restant</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantRestant} />,
    },
    {
      accessorKey: 'reference',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Référence' />,
      cell: ({ row }) => row.original.reference ? <Chip className='font-mono'>{row.original.reference}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      id: 'dateAnnulation',
      accessorFn: (row) => fmtDate(row.dateAnnulation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Annulation' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateAnnulation)}</span>,
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => fetchData({ pageNumber: newPage + 1 }),
    onPageSizeChange: (newSize: number) => fetchData({ pageNumber: 1, pageSize: newSize }),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Search} title='Suivi Remises' description='Registre des remises bancaires' />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'numRemise', title: 'Numéro de Remise' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          pagination={pagination}
          columnFilterRow={false}
          toolbar={
            <div className='flex items-center gap-2'>
              <Select value={statut.toString()} onValueChange={handleStatutChange}>
                <SelectTrigger className='h-10 w-52 rounded-lg bg-card'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='-1'>Tous les statuts</SelectItem>
                  {STATUTS_REMISE.map((s) => (
                    <SelectItem key={s.value} value={s.value.toString()}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={annee.toString()} onValueChange={handleAnneeChange}>
                <SelectTrigger className='h-10 w-48 rounded-lg bg-card'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Toutes les années</SelectItem>
                  {annees.map((a) => (
                    <SelectItem key={a} value={a.toString()}>
                      {a}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={moisSel.toString()} onValueChange={handleMoisChange} disabled={annee === 0}>
                <SelectTrigger className='h-10 w-44 rounded-lg bg-card'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='0'>Tous les mois</SelectItem>
                  {mois.map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {MOIS_LABELS[m - 1]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* RMANew (ListRemise.aspx) : bouton "Synchroniser" -> GetRemises(), un appel
                  à l'API bancaire réelle de RMA (clé en dur). Non branché ici (voir
                  conversation) - visuellement fidèle, désactivé avec l'explication. */}
              <Button
                variant='default'
                className='h-8'
                disabled
                title="Nécessite l'API bancaire réelle de RMA, non disponible dans cet environnement."
              >
                <RefreshCw className='h-4 w-4 mr-2' />
                Synchroniser
              </Button>

              <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};

export default SuiviRemises;
