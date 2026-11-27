import { ExportTiles } from '@/components/export/export-tiles';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { AvatarCell, Chip, PrimarySecondary } from '@/components/table/list-cells';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { ETATS_BAIL } from '@/store/features/leasing/bail-schemas';
import { RelanceResponse, RelanceSummary } from '@/store/features/leasing/relance-schemas';
import { getRelancesHistorique, getRelancesSummary } from '@/store/features/leasing/relancesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import {
  ArrowLeft,
  HandCoins,
  SendHorizontal,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const EXPORT_HEADER = ['Local', 'Client', "N° Contrat", 'Statut Contrat', 'Détails Suivi'];

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

const typeRelanceBadgeClass = (type?: string | null) => {
  if (type === 'Mise en demeure') return 'bg-red-500/10 text-red-700 dark:text-red-400';
  if (type === 'Téléphonique') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  if (type === 'Lettre') return 'bg-sky-500/10 text-sky-700 dark:text-sky-400';
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-300';
};

const etatBailBadgeClass = (etat?: string | null) => {
  if (etat === 'En cours de location') return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  if (etat === 'Suspendu') return 'bg-amber-500/10 text-amber-700 dark:text-amber-400';
  return 'bg-slate-500/10 text-slate-600 dark:text-slate-300';
};

const SuiviRecouvrement = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, historique, historiqueTotalCount, loading } = useAppSelector(
    (state) => state.relances,
  );
  const [search, setSearch] = useState('');
  const [statutContrat, setStatutContrat] = useState<string>('0');

  const noLocation = Number(searchParams.get('bail')) || 0;
  const drillDown = noLocation > 0;
  const current = allItems.find((s) => s.noLocation === noLocation);

  useEffect(() => {
    if (!drillDown) {
      dispatch(getRelancesSummary({ pageNumber: 1, pageSize: 10, search }));
    }
  }, [dispatch, search, drillDown]);

  useEffect(() => {
    if (drillDown) {
      dispatch(getRelancesHistorique({ pageNumber: 1, pageSize: 100, filters: { NoLocation: [noLocation] } }));
    }
  }, [dispatch, drillDown, noLocation]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getRelancesSummary({ pageNumber: 1, pageSize, search: value }));
  };

  const backToSummary = () => setSearchParams({});

  const filteredItems = useMemo(
    () => (statutContrat === '0' ? allItems : allItems.filter((s) => s.etatBail === statutContrat)),
    [allItems, statutContrat],
  );

  const exportRows = () =>
    filteredItems.map((s) => [
      s.nomLocal || '-',
      s.nomLocataire,
      s.numContratLocations || '-',
      s.etatBail || '-',
      s.nombreRelances,
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
    const sheet = workbook.addWorksheet('Suivi Recouvrement');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 22;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Suivi-Recouvrement-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Suivi Recouvrement', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Suivi-Recouvrement-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const summaryColumns: ColumnDef<RelanceSummary>[] = [
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' sorting />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomLocal} />,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Client' />,
      cell: ({ row }) => <AvatarCell name={row.original.nomLocataire} />,
    },
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N°Contrat' />,
      cell: ({ row }) => row.original.numContratLocations ? <Chip className='font-mono'>{row.original.numContratLocations}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'etatBail',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Statut Contrat' />,
      cell: ({ row }) => (
        <span
          className={`inline-block w-fit text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${etatBailBadgeClass(row.original.etatBail)}`}
        >
          {row.original.etatBail || '-'}
        </span>
      ),
    },
    {
      id: 'historique',
      header: () => <div className='text-center'>Détails Suivi</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20'
            onClick={(e) => {
              e.stopPropagation();
              setSearchParams({ bail: String(row.original.noLocation) });
            }}
          >
            {row.original.nombreRelances}
          </button>
        </div>
      ),
    },
  ];

  const historiqueColumns: ColumnDef<RelanceResponse>[] = [
    {
      accessorKey: 'typeRelance',
      header: () => <div className='text-center'>Type</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${typeRelanceBadgeClass(row.original.typeRelance)}`}
          >
            {row.original.typeRelance}
          </span>
        </div>
      ),
    },
    {
      id: 'dateRelance',
      accessorFn: (row) => fmtDate(row.dateRelance),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateRelance)}</span>,
    },
    {
      accessorKey: 'typeEnvoi',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Mode d'envoi" />,
      cell: ({ row }) => row.original.typeEnvoi ? <Chip>{row.original.typeEnvoi}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'notes',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Notes' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.notes || '-'}</div>,
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getRelancesSummary({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getRelancesSummary({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={HandCoins}
            title='Suivi Recouvrement'
            description={
              drillDown
                ? `Historique des relances — ${current?.nomLocataire ?? ''}`
                : 'Suivi des impayés et relances par bail'
            }
            buttons={
              drillDown
                ? [
                    {
                      label: 'Relancer',
                      icon: SendHorizontal,
                      variant: 'default',
                      onClick: () => navigate(`ajouter?noLocation=${noLocation}`),
                    },
                    { label: 'Retour', icon: ArrowLeft, variant: 'secondary', onClick: backToSummary },
                  ]
                : []
            }
          />
        </div>

        {drillDown ? (
          <DataTable
            columns={historiqueColumns}
            data={historique}
            isLoading={loading}
            name={`${historiqueTotalCount} relance(s)`}
          />
        ) : (
          <DataTable
            columns={summaryColumns}
            data={filteredItems}
            searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
            onSearchChange={handleSearchChange}
            isLoading={loading}
            pagination={pagination}
            toolbar={
              <div className='flex items-center gap-2'>
                <div className='w-full sm:w-56'>
                  <Select value={statutContrat} onValueChange={setStatutContrat}>
                    <SelectTrigger className='h-10 rounded-lg bg-card'>
                      <SelectValue placeholder='Statut Contrat' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Tous les statuts</SelectItem>
                      {ETATS_BAIL.map((etat) => (
                        <SelectItem key={etat} value={etat}>
                          {etat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
              </div>
            }
          />
        )}
      </CardContent>
    </Card>
  );
};

export default SuiviRecouvrement;
