import { useSearchParams } from 'react-router';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Title } from '@/components/ui/title';
import { FactureResponse } from '@/store/features/leasing/facture-schemas';
import { getAllFactures } from '@/store/features/leasing/facturesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Archive, Download } from 'lucide-react';
import { useEffect, useState } from 'react';

// RMANew (Listetatannulationquittance.vb) : colonnes N° Facture,Date Quittance,Date
// Annulation,Locataire,Actif,Entite,Local,Montant Quittance - export PDF uniquement
// (lAllowExcel=False côté legacy).
const EXPORT_HEADER = [
  'N° Facture',
  'Date Quittance',
  'Date Annulation',
  'Locataire',
  'Actif',
  'Entite',
  'Local',
  'Montant Quittance',
];

// RMANew (ListAnnulations.aspx) : table dédiée LoyerAnnulations, une facture/quittance y
// figure dès qu'elle a été annulée (pas de flag booléen à part entière côté legacy - la
// présence de la ligne fait foi). Dans la nouvelle app, la "quittance" est fusionnée dans
// Facture (cf. Facture.cs) : on filtre donc simplement sur Etat="Annulée".
// Différent de "Encaissements annulés" (Recouvrement) qui porte sur les Paiements, pas
// sur les Factures/Quittances.
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ArchivesAnnulationsQuittances = () => {
  const [searchParams] = useSearchParams();
  const fromReporting = searchParams.get('from') === 'reporting';
  const dispatch = useAppDispatch();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.factures);
  const [search, setSearch] = useState('');

  const fetchList = (page: number, size: number, searchValue: string) => {
    dispatch(
      getAllFactures({
        pageNumber: page,
        pageSize: size,
        search: searchValue,
        filters: { Etat: ['Annulée'] },
      }),
    );
  };

  useEffect(() => {
    fetchList(1, 10, search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, search]);

  const columns: ColumnDef<FactureResponse>[] = [
    {
      accessorKey: 'numero',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Facture' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numero}</div>,
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
      accessorKey: 'nomProprietaire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Entité' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomProprietaire || '-'}</div>,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocal || '-'}</div>,
    },
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N°Contrat' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
    },
    {
      id: 'periode',
      accessorFn: (row) => fmtDate(row.periode),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Période Quittance' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.periode)}</div>,
    },
    {
      id: 'dateAnnulation',
      accessorFn: (row) => fmtDate(row.dateAnnulation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Annulation' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateAnnulation)}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant (MAD)' />,
      cell: ({ row }) => <div className='font-bold text-red-700 dark:text-red-400'>{fmtMontant(row.original.montant)}</div>,
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => fetchList(newPage + 1, pageSize, search),
    onPageSizeChange: (newSize: number) => fetchList(1, newSize, search),
    totalCount,
  };

  const handleExportPdf = async () => {
    const { default: JsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new JsPDF({ orientation: 'landscape' });
    doc.text('Etat des annulations Quittances', 14, 14);
    autoTable(doc, {
      startY: 20,
      head: [EXPORT_HEADER],
      body: allItems.map((f) => [
        String(f.numero),
        fmtDate(f.periode),
        fmtDate(f.dateAnnulation),
        f.nomLocataire || '-',
        f.nomBuilding || '-',
        f.nomProprietaire || '-',
        f.nomLocal || '-',
        fmtMontant(f.montant),
      ]),
      styles: { fontSize: 8 },
    });
    doc.save(`Annulations-Quittances-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Archive}
            title={fromReporting ? 'Reporting — Etat Annulation des Quittances' : 'Archives — Annulations Quittances'}
            description='Quittances / factures annulées'
            buttons={[{ label: 'Export PDF', icon: Download, variant: 'outline', onClick: handleExportPdf }]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
          onSearchChange={setSearch}
          isLoading={loading}
          pagination={pagination}
        />
      </CardContent>
    </Card>
  );
};

export default ArchivesAnnulationsQuittances;
