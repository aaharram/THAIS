import { ExcelFileIcon, PdfFileIcon } from '@/components/icons/file-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { BaseDialog } from '@/components/dialog/dialog';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { LocataireResponse } from '@/store/features/leasing/locataire-schemas';
import { getArchivedLocataires, reactivateLocataire, setLocataire } from '@/store/features/leasing/locatairesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Archive, ChevronDown, CircleCheck, Download, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// RMANew (ListArchivesLocataires.aspx/.vb) : Locataire.inactif=1, avec réactivation
// (Action=Activer → inactif=0), filtre Réseau (Propriétaire, porte sur le Propriétaire
// de l'actif du dernier bail du locataire) et export Excel/PDF (mêmes colonnes que la
// liste). Chaque locataire archivé affiche un aperçu de son dernier bail connu (actif
// ou non, le plus récent) : loyer mensuel, période impayés, nb mois impayé, montant
// impayé et état (Normale/Contentieux) - un locataire sans bail correspondant garde
// ces colonnes vides, comme la ligne de repli de ListArchivesLocataires.vb.
const EXPORT_HEADER = [
  'Locataire',
  'Code Locataire',
  'Immeuble',
  'Loyer mensuel',
  'Début impayés',
  'Fin impayés',
  'Nb Mois impayé',
  'Montant Loyer impayé',
  'Etat',
];

const formatDate = (value?: string | null) => (value ? new Date(value).toLocaleDateString('fr-FR') : '-');

const formatMontant = (value?: number | null) =>
  value != null ? `${value.toLocaleString('fr-FR').replace(/ /g, ' ')} DH` : '-';

const etatBadgeClass = (etat?: string | null) =>
  etat === 'Contentieux' ? 'text-red-700 bg-red-100' : 'text-green-700 bg-green-100';

const ArchivesLocataires = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.locataires);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LocataireResponse | null>(null);
  const [search, setSearch] = useState('');
  const [noProprietaire, setNoProprietaire] = useState(0);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  const fetchData = (overrides: { pageNumber?: number; pageSize?: number; search?: string; noProprietaire?: number }) => {
    const proprietaire = overrides.noProprietaire ?? noProprietaire;
    dispatch(
      getArchivedLocataires({
        pageNumber: overrides.pageNumber ?? 1,
        pageSize: overrides.pageSize ?? pageSize,
        search: overrides.search ?? search,
        filters: proprietaire ? { NoProprietaire: [proprietaire] } : undefined,
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

  const handleProprietaireChange = (value: string) => {
    const v = Number(value);
    setNoProprietaire(v);
    fetchData({ noProprietaire: v });
  };

  const handleReactivate = (item: LocataireResponse) => {
    setSelectedItem(item);
    setReactivateDialogOpen(true);
  };

  const confirmReactivate = async () => {
    if (selectedItem) {
      await dispatch(reactivateLocataire(selectedItem.numero)).unwrap();
      setSelectedItem(null);
      setReactivateDialogOpen(false);
      fetchData({ pageNumber });
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

  const exportRows = () =>
    allItems.map((l) => [
      l.nomAffiche,
      l.codeLocataire || '-',
      l.nomBuilding || '-',
      l.loyerMensuel != null ? String(l.loyerMensuel) : '-',
      formatDate(l.periodeImpayesDebut),
      formatDate(l.periodeImpayesFin),
      l.nbMoisImpaye != null ? String(l.nbMoisImpaye) : '-',
      l.montantImpaye != null ? String(l.montantImpaye) : '-',
      l.etat || '-',
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Locataires Archivés');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Locataires-Archives-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Locataires Archivés', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
      styles: { fontSize: 7 },
    });
    doc.save(`Locataires-Archives-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<LocataireResponse>[] = [
    {
      accessorKey: 'nomAffiche',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('nomAffiche')}</div>,
    },
    {
      accessorKey: 'codeLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Code Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.codeLocataire || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'loyerMensuel',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer Mensuel' />,
      cell: ({ row }) => <div className='font-medium'>{formatMontant(row.original.loyerMensuel)}</div>,
    },
    {
      id: 'periodeImpayes',
      header: () => <div>Période Impayés</div>,
      cell: ({ row }) =>
        row.original.periodeImpayesDebut || row.original.periodeImpayesFin ? (
          <div className='font-medium'>
            {formatDate(row.original.periodeImpayesDebut)} - {formatDate(row.original.periodeImpayesFin)}
          </div>
        ) : (
          <div className='text-muted-foreground'>-</div>
        ),
    },
    {
      accessorKey: 'nbMoisImpaye',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nb Mois Impayé' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nbMoisImpaye ?? '-'}</div>,
    },
    {
      accessorKey: 'montantImpaye',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant Impayé' />,
      cell: ({ row }) => <div className='font-medium'>{formatMontant(row.original.montantImpaye)}</div>,
    },
    {
      accessorKey: 'etat',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Etat' />,
      cell: ({ row }) =>
        row.original.etat ? (
          <span
            className={`inline-block w-fit text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${etatBadgeClass(row.original.etat)}`}
          >
            {row.original.etat}
          </span>
        ) : (
          <div className='text-muted-foreground'>-</div>
        ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button variant='ghost' size='sm' className='h-8 w-8 p-0 hover:bg-yellow-100' title='Modifier'
            onClick={(e) => { e.stopPropagation(); dispatch(setLocataire(row.original)); navigate(`/leasing-management/locataires/modifier/${row.original.numero}`); }}>
            <Pencil className='h-4 w-4 text-yellow-600' />
          </Button>
          <Button variant='ghost' size='sm' className='h-8 px-2 gap-1.5 hover:bg-green-100 text-green-700' title='Réactiver ce locataire'
            onClick={(e) => { e.stopPropagation(); handleReactivate(row.original); }}>
            <CircleCheck className='h-4 w-4' />
            Réactiver
          </Button>
        </div>
      ),
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
          <Title icon={Archive} title='Archives — Locataires' description='Locataires désactivés' />
        </div>
        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomAffiche', title: 'Locataire' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          pagination={pagination}
          toolbar={
            <div className='flex items-center gap-2'>
              <Select value={noProprietaire.toString()} onValueChange={handleProprietaireChange}>
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
        <BaseDialog open={reactivateDialogOpen} onOpenChange={setReactivateDialogOpen} title='Confirmer la réactivation'
          description={`Voulez-vous activer le locataire "${selectedItem?.nomAffiche || ''}" ?`}>
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setReactivateDialogOpen(false)}>Annuler</Button>
            <Button onClick={confirmReactivate}>Activer</Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default ArchivesLocataires;
