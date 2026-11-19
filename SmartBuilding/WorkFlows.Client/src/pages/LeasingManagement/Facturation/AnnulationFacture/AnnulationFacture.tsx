import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { FactureResponse } from '@/store/features/leasing/facture-schemas';
import {
  annulerDemandeAnnulationFacture,
  confirmerAnnulationFacture,
  getAllFactures,
} from '@/store/features/leasing/facturesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Ban, CircleX, Undo2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// RMANew (ListFacture.vb → AnnulationsQuittances.vb) : la demande d'annulation (cochée
// puis "Delete" dans ListFacture) est un écran séparé de sa confirmation définitive.
// Cette page reproduit ce second écran : seules les factures avec DemandeAnnulation=1
// y apparaissent, en attente de confirmation.
const AnnulationFacture = () => {
  const dispatch = useAppDispatch();
  const { allItems, loading } = useAppSelector((state) => state.factures);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FactureResponse | null>(null);

  useEffect(() => {
    dispatch(getAllFactures({ pageNumber: 1, pageSize: 200 }));
  }, [dispatch]);

  const enAttente = useMemo(() => allItems.filter((f) => f.demandeAnnulation), [allItems]);

  const handleConfirmer = (item: FactureResponse) => {
    setSelectedItem(item);
    setConfirmDialogOpen(true);
  };

  const confirmerAnnulation = () => {
    if (selectedItem) {
      dispatch(confirmerAnnulationFacture(selectedItem.numero));
      setSelectedItem(null);
      setConfirmDialogOpen(false);
    }
  };

  const columns: ColumnDef<FactureResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' sorting />,
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
      id: 'periode',
      accessorFn: (row) => new Date(row.periode).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Période' />,
      cell: ({ row }) => (
        <div className='font-medium'>
          {new Date(row.original.periode).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
        </div>
      ),
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant (MAD)' />,
      cell: ({ row }) => <div className='font-medium'>{fmtMontant(row.original.montant)}</div>,
    },
    {
      id: 'dateEmission',
      accessorFn: (row) => fmtDate(row.dateEmission),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date émission' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateEmission)}</div>,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-gray-100'
            title="Retirer la demande d'annulation"
            onClick={(e) => {
              e.stopPropagation();
              dispatch(annulerDemandeAnnulationFacture(row.original.numero));
            }}
          >
            <Undo2 className='h-4 w-4 text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-red-100'
            title="Confirmer l'annulation"
            onClick={(e) => {
              e.stopPropagation();
              handleConfirmer(row.original);
            }}
          >
            <CircleX className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Ban}
            title='Annulation Facture'
            description="Factures en attente de confirmation d'annulation"
          />
        </div>

        <DataTable columns={columns} data={enAttente} isLoading={loading} name={`${enAttente.length} en attente`} />

        <BaseDialog
          open={confirmDialogOpen}
          onOpenChange={setConfirmDialogOpen}
          title="Confirmer l'annulation"
          description={`Êtes-vous sûr de vouloir annuler définitivement la facture de "${selectedItem?.nomLocataire || ''}" ? Cette action est irréversible.`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setConfirmDialogOpen(false)}>
              Retour
            </Button>
            <Button variant='destructive' onClick={confirmerAnnulation}>
              Confirmer l'annulation
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default AnnulationFacture;
