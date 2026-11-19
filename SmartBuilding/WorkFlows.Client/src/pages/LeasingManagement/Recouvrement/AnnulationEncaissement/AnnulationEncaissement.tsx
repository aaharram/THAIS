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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { PaiementResponse } from '@/store/features/leasing/paiement-schemas';
import { confirmerAnnulationPaiement, getPaiements, rejeterAnnulationPaiement } from '@/store/features/leasing/paiementsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Ban, ChevronDown, Download, RefreshCcw, X } from 'lucide-react';
import { useEffect, useState } from 'react';

const EXPORT_HEADER = ['Numéro', 'Locataire', 'Actif', 'Encaissement (MAD)', 'Date Encaissement', 'Période'];

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// RMANew (AnnulationsEncaissements.aspx) : "Annuler" et "Rejeter" font TOUS LES DEUX la
// même restitution des factures soldées par l'encaissement (AnnulerEncaissement et
// RejetEncaissement ont un corps quasi identique côté legacy) - seul le statut final
// diffère (Annulé vs Rejeté), les deux terminent dans "Encaissements annulés". Aucune des
// deux actions ne "garde l'encaissement actif, inchangé".
const AnnulationEncaissement = () => {
  const dispatch = useAppDispatch();
  const {
    historique: allItems,
    historiqueTotalCount: totalCount,
    historiquePageNumber: pageNumber,
    historiquePageSize: pageSize,
    loading,
  } = useAppSelector((state) => state.paiements);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);

  const [search, setSearch] = useState('');
  const [noProprietaire, setNoProprietaire] = useState('0');
  const [dialog, setDialog] = useState<{ item: PaiementResponse; action: 'confirmer' | 'rejeter' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  const fetchList = (page: number, size: number) => {
    dispatch(
      getPaiements({
        pageNumber: page,
        pageSize: size,
        search,
        noProprietaire: Number(noProprietaire) || undefined,
        statutAnnulation: 'en-attente',
      }),
    );
  };

  useEffect(() => {
    fetchList(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search, noProprietaire]);

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
      `ENC${p.numero}`,
      p.nomLocataire || '-',
      p.nomBuilding || '-',
      fmtMontant(p.montant),
      fmtDate(p.datePaiement),
      p.periodeDebut && p.periodeFin ? `${fmtDate(p.periodeDebut)} - ${fmtDate(p.periodeFin)}` : '-',
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Annulation Encaissement');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Annulation-Encaissement-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Annulation Encaissement En cours', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Annulation-Encaissement-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const confirmDialogAction = async () => {
    if (!dialog) return;
    setActionLoading(true);
    try {
      if (dialog.action === 'confirmer') {
        await dispatch(confirmerAnnulationPaiement(dialog.item.numero)).unwrap();
      } else {
        await dispatch(rejeterAnnulationPaiement(dialog.item.numero)).unwrap();
      }
      setDialog(null);
      fetchList(pageNumber, pageSize);
    } finally {
      setActionLoading(false);
    }
  };

  const columns: ColumnDef<PaiementResponse>[] = [
    {
      accessorKey: 'numero',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Numéro' sorting />,
      cell: ({ row }) => <div className='font-medium'>ENC{row.original.numero}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Encaissement (MAD)' />,
      cell: ({ row }) => <div className='font-bold text-orange-600'>{fmtMontant(row.original.montant)}</div>,
    },
    {
      id: 'datePaiement',
      accessorFn: (row) => fmtDate(row.datePaiement),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Encaissement' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.datePaiement)}</div>,
    },
    {
      id: 'periode',
      header: () => <div>Période</div>,
      cell: ({ row }) =>
        row.original.periodeDebut && row.original.periodeFin ? (
          <div className='font-medium'>
            {fmtDate(row.original.periodeDebut)} - {fmtDate(row.original.periodeFin)}
          </div>
        ) : (
          <div className='text-muted-foreground'>-</div>
        ),
    },
    {
      id: 'actionAnnulation',
      header: () => <div className='text-center'>Annuler</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <button
            type='button'
            title="Annuler l'encaissement"
            className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100'
            onClick={() => setDialog({ item: row.original, action: 'confirmer' })}
          >
            <Ban className='h-4 w-4' />
          </button>
        </div>
      ),
    },
    {
      id: 'actionRejet',
      header: () => <div className='text-center'>Rejeter</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <button
            type='button'
            title="Rejeter l'encaissement"
            className='inline-flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-100'
            onClick={() => setDialog({ item: row.original, action: 'rejeter' })}
          >
            <X className='h-4 w-4' />
          </button>
        </div>
      ),
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
          <Title
            icon={RefreshCcw}
            title='Annulation Encaissement En cours'
            description="Demandes d'annulation en attente de confirmation"
          />
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
                    <SelectValue placeholder='Tous les Propriétaires' />
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
              </div>
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
      </CardContent>

      <BaseDialog
        open={!!dialog}
        onOpenChange={(open) => !open && setDialog(null)}
        title={dialog?.action === 'confirmer' ? "Confirmer l'annulation" : "Confirmer le rejet"}
        description={
          dialog
            ? `${dialog.action === 'confirmer' ? "Confirmer l'annulation" : 'Confirmer le rejet'} de ENC${dialog.item.numero} (${dialog.item.nomLocataire ?? ''}) ? Les factures soldées par cet encaissement redeviendront impayées.`
            : undefined
        }
        onCancel={() => setDialog(null)}
        onConfirm={confirmDialogAction}
        confirmText='Confirmer'
        loading={actionLoading}
      />
    </Card>
  );
};

export default AnnulationEncaissement;
