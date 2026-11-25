import { ExportTiles } from '@/components/export/export-tiles';
import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { BuildingResponse } from '@/store/features/patrimoine/building-schemas';
import { getArchivedBuildings, reactivateBuilding, setBuilding } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatSurface } from '@/utils/formatters';
import { generateFicheSignaletique } from '@/utils/reports/ficheSignaletique';
import { ColumnDef } from '@tanstack/react-table';
import { Archive, CircleCheck, Download, ImageOff, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// RMANew (ListArchivesImmeubles.aspx/.vb) : Building.inactif=1, avec réactivation
// (Action=Activer → inactif=0), filtre Réseau (Propriétaire), export Excel/PDF (mêmes
// colonnes que la liste : Actif, Typologie, T.F, Ville, Superficie Utile) et téléchargement
// de la Fiche signalétique par ligne - la suppression physique définitive (checkboxes +
// Delete) de la page legacy n'est pas reprise, cohérente avec le reste du module Patrimoine.
const EXPORT_HEADER = ['Actif', 'Typologie', 'T.F', 'Ville', 'Superficie Utile'];

const Actifs = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.buildings);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BuildingResponse | null>(null);
  const [search, setSearch] = useState('');
  const [noProprietaire, setNoProprietaire] = useState(0);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  const fetchData = (overrides: { pageNumber?: number; pageSize?: number; search?: string; noProprietaire?: number }) => {
    const proprietaire = overrides.noProprietaire ?? noProprietaire;
    dispatch(
      getArchivedBuildings({
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

  const handleReactivate = (item: BuildingResponse) => {
    setSelectedItem(item);
    setReactivateDialogOpen(true);
  };

  const confirmReactivate = async () => {
    if (selectedItem) {
      await dispatch(reactivateBuilding(selectedItem.numero)).unwrap();
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
    allItems.map((b) => [
      b.designation,
      b.nomBuildingType || '-',
      b.titreFoncier || '-',
      b.nomCity || '-',
      formatSurface(b.surfaceUtile),
    ]);

  const handleExportExcel = async () => {
    const ExcelJS = (await import('exceljs')).default;
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Actifs Archivés');
    sheet.addRow(EXPORT_HEADER).font = { bold: true };
    exportRows().forEach((row) => sheet.addRow(row));
    sheet.columns.forEach((column) => {
      column.width = 24;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Actifs-Archives-${new Date().toISOString().slice(0, 10)}.xlsx`,
    );
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Actifs Archivés', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: exportRows().map((row) => row.map(String)),
    });
    doc.save(`Actifs-Archives-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const columns: ColumnDef<BuildingResponse>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: () => (
        <div className='flex items-center justify-center h-9 w-9 rounded-md bg-gray-100 text-gray-400'>
          <ImageOff className='h-4 w-4' />
        </div>
      ),
    },
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('designation')}</div>,
    },
    {
      accessorKey: 'nomBuildingType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Typologie' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuildingType || '-'}</div>,
    },
    {
      accessorKey: 'titreFoncier',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Titre Foncier' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.titreFoncier || '-'}</div>,
    },
    {
      accessorKey: 'nomCity',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ville' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomCity || '-'}</div>,
    },
    {
      accessorKey: 'surfaceUtile',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie (m²)' />,
      cell: ({ row }) => <div className='font-medium'>{formatSurface(row.original.surfaceUtile)}</div>,
    },
    {
      id: 'ficheSignaletique',
      header: () => <div className='text-center'>Fiche signalétique</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            title='Télécharger la fiche signalétique'
            onClick={(e) => {
              e.stopPropagation();
              generateFicheSignaletique(row.original);
            }}
          >
            <Download className='h-4 w-4 text-primary' />
          </Button>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-yellow-100'
            title='Modifier'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setBuilding(row.original));
              navigate(`/patrimoine/actifs/modifier/${row.original.numero}`);
            }}
          >
            <Pencil className='h-4 w-4 text-yellow-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 px-2 gap-1.5 hover:bg-green-100 text-green-700'
            title='Réactiver cet actif'
            onClick={(e) => {
              e.stopPropagation();
              handleReactivate(row.original);
            }}
          >
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
          <Title icon={Archive} title='Archives — Actifs' description='Actifs désactivés' />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'designation', title: 'Actif' }]}
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

              <ExportTiles onPdf={handleExportPdf} onExcel={handleExportExcel} />
            </div>
          }
        />

        <BaseDialog
          open={reactivateDialogOpen}
          onOpenChange={setReactivateDialogOpen}
          title='Confirmer la réactivation'
          description={`Voulez-vous activer l'actif "${selectedItem?.designation || ''}" ?`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setReactivateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmReactivate}>Activer</Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default Actifs;
