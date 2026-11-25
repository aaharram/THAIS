import { ExportTiles } from '@/components/export/export-tiles';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { SuiviImpayeLigneResponse } from '@/store/features/leasing/suivi-impaye-schemas';
import { getSuiviImpaye } from '@/store/features/leasing/suiviImpayeSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { FileWarning } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

// RMANew (ViewReporting.aspx "Suivi Impayé" -> Classes/ListImpayesLocataires.vb) : détail
// par bail des impayés (distinct de "État Impayé" qui consolide par propriétaire),
// filtrable par Propriétaire et Encaisseur, export Excel.
const EXPORT_HEADER = [
  'Locataire',
  'Immeuble',
  'Loyer Mensuel',
  'Date début',
  'Date fin',
  'Nb Mois Impayé',
  'Montant Loyer Impayé',
  'Etat',
  'Encaisseur',
];

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type EtatFiltre = 'tous' | 'contentieux' | 'normale';

const SuiviImpaye = () => {
  const dispatch = useAppDispatch();
  const { allItems, loading } = useAppSelector((state) => state.suiviImpaye);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { allItems: encaisseurs } = useAppSelector((state) => state.cfgEncaisseurs);
  const [searchParams] = useSearchParams();
  const [noProprietaire, setNoProprietaire] = useState(0);
  const [noEncaisseur, setNoEncaisseur] = useState(0);
  const [etatFiltre, setEtatFiltre] = useState<EtatFiltre>(
    searchParams.get('etat') === 'contentieux' ? 'contentieux' : 'tous',
  );

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgEncaisseurs.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getSuiviImpaye({ noProprietaire: noProprietaire || undefined, noEncaisseur: noEncaisseur || undefined }));
  }, [dispatch, noProprietaire, noEncaisseur]);

  // RMANew (ListPreContentieux.vb) : liste dédiée aux dossiers en contentieux avec un
  // filtre "Etat" - ici combiné à Suivi Impayé (superset) via un filtre client plutôt
  // qu'une page séparée, la distinction Contentieux/Normale étant déjà portée par ligne.
  const items = allItems.filter((l) => {
    if (etatFiltre === 'contentieux') return l.contentieux;
    if (etatFiltre === 'normale') return !l.contentieux;
    return true;
  });

  const totalLoyerMensuel = items.reduce((sum, l) => sum + (l.loyerMensuel ?? 0), 0);
  const totalMontantImpaye = items.reduce((sum, l) => sum + l.montantImpaye, 0);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportRows = () =>
    items.map((l) => [
      l.nomLocataire || '-',
      l.nomBuilding || '-',
      l.loyerMensuel != null ? String(l.loyerMensuel) : '-',
      fmtDate(l.periodeImpayesDebut),
      fmtDate(l.periodeImpayesFin),
      String(l.nbMoisImpaye),
      String(l.montantImpaye),
      l.contentieux ? 'Contentieux' : 'Normale',
      l.nomEncaisseur || '-',
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Suivi Impayé');
    const titleRow = sheet.addRow(['Suivi Impayé']);
    titleRow.font = { bold: true, size: 14 };
    sheet.addRow([]);
    const headerRow = sheet.addRow(EXPORT_HEADER);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.eachCell((cell) => {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4472C4' } };
    });
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Suivi-Impaye-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const columns: ColumnDef<SuiviImpayeLigneResponse>[] = [
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Immeuble' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'loyerMensuel',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer Mensuel TTC' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.loyerMensuel)}</div>,
    },
    {
      id: 'periode',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Période impayés' />,
      cell: ({ row }) => (
        <div className='font-medium'>
          {fmtDate(row.original.periodeImpayesDebut)} - {fmtDate(row.original.periodeImpayesFin)}
        </div>
      ),
    },
    {
      accessorKey: 'nbMoisImpaye',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nb Mois Impayés' />,
      cell: ({ row }) => <div className='font-medium text-center'>{row.original.nbMoisImpaye}</div>,
    },
    {
      accessorKey: 'montantImpaye',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant Loyers Impayés' />,
      cell: ({ row }) => <div className='font-medium text-red-700'>{fmtMontant(row.original.montantImpaye)}</div>,
    },
    {
      accessorKey: 'contentieux',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Etat' />,
      cell: ({ row }) =>
        row.original.contentieux ? (
          <Badge variant='destructive'>Contentieux</Badge>
        ) : (
          <Badge variant='secondary'>Normale</Badge>
        ),
    },
    {
      accessorKey: 'nomEncaisseur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Encaisseur' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomEncaisseur || '-'}</div>,
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={FileWarning} title='Suivi Impayé' description='Détail des impayés par locataire' />
        </div>

        <div className='overflow-x-auto'>
          <DataTable
            columns={columns}
            data={items}
            searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
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

                <Select value={noEncaisseur.toString()} onValueChange={(v) => setNoEncaisseur(Number(v))}>
                  <SelectTrigger className='h-8 w-48'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='0'>Tous les Encaisseurs</SelectItem>
                    {encaisseurs.map((e) => (
                      <SelectItem key={e.numero} value={e.numero.toString()}>
                        {e.designation}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={etatFiltre} onValueChange={(v) => setEtatFiltre(v as EtatFiltre)}>
                  <SelectTrigger className='h-8 w-40'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='tous'>Tous les états</SelectItem>
                    <SelectItem value='contentieux'>Contentieux</SelectItem>
                    <SelectItem value='normale'>Normale</SelectItem>
                  </SelectContent>
                </Select>

                <ExportTiles onExcel={handleExportExcel} />
              </div>
            }
          />
        </div>

        {!loading && items.length > 0 && (
          <div className='flex justify-end gap-6 mt-3 pr-2'>
            <span className='text-sm text-muted-foreground'>
              Total Loyer Mensuel :{' '}
              <span className='font-semibold text-foreground'>{fmtMontant(totalLoyerMensuel)}</span>
            </span>
            <span className='text-sm text-muted-foreground'>
              Total Montant Impayé :{' '}
              <span className='font-semibold text-red-700'>{fmtMontant(totalMontantImpaye)}</span>
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SuiviImpaye;
