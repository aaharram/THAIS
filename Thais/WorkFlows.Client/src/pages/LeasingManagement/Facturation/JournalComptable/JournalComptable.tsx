import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { FactureResponse } from '@/store/features/leasing/facture-schemas';
import { getAllFactures } from '@/store/features/leasing/facturesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { BookOpen } from 'lucide-react';
import { useEffect, useMemo } from 'react';

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const etatBadgeClass = (etat: string) => {
  if (etat === 'Payée') return 'text-green-700 bg-green-100';
  if (etat === 'Partiellement payée') return 'text-blue-700 bg-blue-100';
  if (etat === 'Annulée') return 'text-red-700 bg-red-100';
  return 'text-amber-700 bg-amber-100';
};

// RMANew (JournalLoyer.vb) : le moteur de génération y écrit à la fois FactureLoyer et
// l'écriture JournalLoyer liée. Ici, une seule table Facture sert d'agrégat - ce journal
// est donc une vue de lecture sur les mêmes données que "Avis d'échéance/Facture",
// présentée sous l'angle comptable (chronologique, avec totaux), sans actions de gestion.
const JournalComptable = () => {
  const dispatch = useAppDispatch();
  const { allItems, loading } = useAppSelector((state) => state.factures);

  useEffect(() => {
    dispatch(getAllFactures({ pageNumber: 1, pageSize: 500 }));
  }, [dispatch]);

  const totaux = useMemo(() => {
    const totalFactureTTC = allItems
      .filter((f) => f.etat !== 'Annulée')
      .reduce((acc, f) => acc + f.montant, 0);
    const totalPaye = allItems.filter((f) => f.etat === 'Payée').length;
    const totalImpaye = allItems
      .filter((f) => f.etat === 'Impayée' || f.etat === 'Partiellement payée')
      .reduce((acc, f) => acc + f.montant, 0);
    const totalAnnule = allItems.filter((f) => f.etat === 'Annulée').length;
    return { totalFactureTTC, totalPaye, totalImpaye, totalAnnule };
  }, [allItems]);

  const columns: ColumnDef<FactureResponse>[] = [
    {
      id: 'dateEmission',
      accessorFn: (row) => fmtDate(row.dateEmission),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateEmission)}</div>,
    },
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
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
      accessorKey: 'typeFacture',
      header: () => <div className='text-center'>Type</div>,
      cell: ({ row }) => <div className='text-center font-medium'>{row.original.typeFacture}</div>,
    },
    {
      accessorKey: 'loyerNet',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer net' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.loyerNet)}</div>,
    },
    {
      accessorKey: 'tva',
      header: ({ column }) => <DataTableColumnHeader column={column} title='TVA' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.tva)}</div>,
    },
    {
      accessorKey: 'taxe',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Taxe' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.taxe)}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Total TTC' />,
      cell: ({ row }) => <div className='font-medium text-blue-700'>{fmtMontant(row.original.montant)}</div>,
    },
    {
      accessorKey: 'etat',
      header: () => <div className='text-center'>État</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${etatBadgeClass(row.original.etat)}`}
          >
            {row.original.etat}
          </span>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={BookOpen}
            title='Journal Comptable'
            description='Suivi comptable chronologique des loyers facturés'
          />
        </div>

        <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4'>
          <div className='rounded-lg border p-4'>
            <div className='text-xs text-muted-foreground'>Total facturé TTC</div>
            <div className='text-lg font-semibold'>{fmtMontant(totaux.totalFactureTTC)} MAD</div>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='text-xs text-muted-foreground'>Factures payées</div>
            <div className='text-lg font-semibold text-green-700'>{totaux.totalPaye}</div>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='text-xs text-muted-foreground'>Solde impayé</div>
            <div className='text-lg font-semibold text-amber-700'>{fmtMontant(totaux.totalImpaye)} MAD</div>
          </div>
          <div className='rounded-lg border p-4'>
            <div className='text-xs text-muted-foreground'>Factures annulées</div>
            <div className='text-lg font-semibold text-red-700'>{totaux.totalAnnule}</div>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          isLoading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default JournalComptable;
