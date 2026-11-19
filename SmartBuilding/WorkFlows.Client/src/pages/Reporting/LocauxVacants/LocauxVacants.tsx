import { ExcelFileIcon } from '@/components/icons/file-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { LocalVacantResponse } from '@/store/features/patrimoine/local-vacant-schemas';
import { getLocauxVacants } from '@/store/features/patrimoine/locauxVacantsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Download, Home } from 'lucide-react';
import { useEffect, useState } from 'react';

// RMANew (ViewReporting.aspx "Liste Locaux vacants" -> Classes/ViewPageEtatdesactifs.vb) :
// locaux sans bail en cours (RMANew: Local.Occupation=0), filtrables par Propriétaire,
// export Excel uniquement (RMANew n'expose pas de PDF pour cette liste). Consultation
// seule, pas d'ajout/édition/suppression.
const EXPORT_HEADER = ['Entité', 'Actif', 'Local', 'Etage', 'Superficie', 'Address1'];

const LocauxVacants = () => {
  const dispatch = useAppDispatch();
  const { allItems, loading } = useAppSelector((state) => state.locauxVacants);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [noProprietaire, setNoProprietaire] = useState(0);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getLocauxVacants({ noProprietaire: noProprietaire || undefined }));
  }, [dispatch, noProprietaire]);

  const handleProprietaireChange = (value: string) => {
    setNoProprietaire(Number(value));
  };

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
    const sheet = workbook.addWorksheet('Locaux Vacants');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    allItems.forEach((l) =>
      sheet.addRow([
        l.nomProprietaire || '-',
        l.nomBuilding || '-',
        l.nomLocal,
        l.etage || '-',
        l.superficie ?? '-',
        l.adresse || '-',
      ]),
    );
    sheet.columns.forEach((column) => {
      column.width = 24;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Locaux-Vacants-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const columns: ColumnDef<LocalVacantResponse>[] = [
    {
      accessorKey: 'nomProprietaire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Entité' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomProprietaire || '-'}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocal}</div>,
    },
    {
      accessorKey: 'etage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Etage' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.etage || '-'}</div>,
    },
    {
      accessorKey: 'superficie',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.superficie ?? '-'}</div>,
    },
    {
      accessorKey: 'adresse',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Address1' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.adresse || '-'}</div>,
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Home} title='Liste Locaux vacants' description='Locaux sans bail en cours' />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          isLoading={loading}
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

              <Button variant='outline' className='h-8' onClick={handleExportExcel}>
                <ExcelFileIcon className='h-4 w-4 mr-2' />
                <Download className='h-4 w-4 mr-2' />
                Export
              </Button>
            </div>
          }
        />
      </CardContent>
    </Card>
  );
};

export default LocauxVacants;
