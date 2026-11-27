import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { ActionButton, AvatarCell, fmtDate, MoneyCell, StatusPill } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { FactureResponse } from '@/store/features/leasing/facture-schemas';
import {
  annulerDemandeAnnulationFacture,
  confirmerAnnulationFacture,
} from '@/store/features/leasing/facturesSlice';
import { useAppDispatch } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Ban, CircleX, Undo2 } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

const periodeLabel = (d?: string | null) => {
  if (!d) return '';
  const label = new Date(d).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  return label.charAt(0).toUpperCase() + label.slice(1);
};

// RMANew (ListFacture.vb → AnnulationsQuittances.vb) : la demande d'annulation (cochée
// puis "Delete" dans ListFacture) est un écran séparé de sa confirmation définitive.
// Cette page reproduit ce second écran : seules les factures avec DemandeAnnulation=1
// y apparaissent, en attente de confirmation. Colonnes de RMANew : N° Quittance, Locataire, Actif, Local,
// Montant (TC/CC), Période Quittance, Période Annulation, Etat.
const AnnulationFacture = () => {
  const dispatch = useAppDispatch();
  const [allItems, setAllItems] = useState<FactureResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FactureResponse | null>(null);

  // Toutes les factures (l'API plafonne une page à 100 lignes : une seule page manquerait des demandes).
  const charger = useCallback(() => {
    setLoading(true);
    fetchAllPages<FactureResponse>('/api/factures')
      .then(setAllItems)
      .catch(() => setAllItems([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    charger();
  }, [charger]);

  const enAttente = useMemo(() => allItems.filter((f) => f.demandeAnnulation && f.etat !== 'Annulée'), [allItems]);

  const handleConfirmer = (item: FactureResponse) => {
    setSelectedItem(item);
    setConfirmDialogOpen(true);
  };

  const confirmerAnnulation = async () => {
    if (selectedItem) {
      await dispatch(confirmerAnnulationFacture(selectedItem.numero));
      setSelectedItem(null);
      setConfirmDialogOpen(false);
      charger();
    }
  };

  const columns: ColumnDef<FactureResponse>[] = [
    {
      id: 'numero',
      accessorFn: (row) => row.reference || String(row.numero),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Numero Quittance' sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap font-medium'>{row.original.reference || row.original.numero}</span>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' />,
      cell: ({ row }) => (
        <AvatarCell
          name={row.original.nomLocataire}
          secondary={row.original.numContratLocations ? `Contrat ${row.original.numContratLocations}` : null}
        />
      ),
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <span className='font-medium'>{row.original.nomBuilding || '—'}</span>,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <span>{row.original.nomLocal || '—'}</span>,
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Montant (MAD) (TC/CC)</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant} />,
    },
    {
      id: 'periode',
      accessorFn: (row) => periodeLabel(row.periode),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Période Quittance' />,
      cell: ({ row }) => <span className='whitespace-nowrap font-medium'>{periodeLabel(row.original.periode)}</span>,
    },
    {
      id: 'periodeAnnulation',
      accessorFn: (row) => periodeLabel(row.dateAnnulation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Période Annulation' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap'>{row.original.dateAnnulation ? fmtDate(row.original.dateAnnulation) : '—'}</span>
      ),
    },
    {
      id: 'etat',
      accessorFn: () => "Demande d'annulation",
      header: () => <div>Etat</div>,
      cell: () => <StatusPill label="Demande d'annulation" tone='warning' />,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <ActionButton
            icon={Undo2}
            label="Retirer la demande d'annulation"
            onClick={async () => {
              await dispatch(annulerDemandeAnnulationFacture(row.original.numero));
              charger();
            }}
            className='text-muted-foreground hover:bg-muted hover:text-foreground'
          />
          <ActionButton
            icon={CircleX}
            label="Confirmer l'annulation"
            onClick={() => {
              handleConfirmer(row.original);
            }}
            className='text-red-600 hover:bg-red-500/10 hover:text-red-600'
          />
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

        <DataTable
          columns={columns}
          data={enAttente}
          isLoading={loading}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
        />

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
