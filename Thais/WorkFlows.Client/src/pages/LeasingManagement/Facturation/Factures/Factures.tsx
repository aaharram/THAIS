import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { FactureResponse } from '@/store/features/leasing/facture-schemas';
import {
  deleteFacture,
  demanderAnnulationFacture,
  getAllFactures,
  telechargerFacturePdf,
} from '@/store/features/leasing/facturesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Ban, Plus, Printer, Receipt, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const etatBadgeClass = (etat: string) => {
  if (etat === 'Payée') return 'text-green-700 bg-green-100';
  if (etat === 'Partiellement payée') return 'text-blue-700 bg-blue-100';
  if (etat === 'Annulée') return 'text-red-700 bg-red-100';
  return 'text-amber-700 bg-amber-100';
};

const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Factures = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.factures);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FactureResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllFactures({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllFactures({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: FactureResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteFacture(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
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
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocal || '-'}</div>,
    },
    {
      accessorKey: 'typeFacture',
      header: () => <div className='text-center'>Type</div>,
      cell: ({ row }) => <div className='text-center font-medium'>{row.original.typeFacture}</div>,
    },
    {
      id: 'periode',
      // Filtre sur le texte réellement affiché ("décembre 1972"), pas la date ISO brute
      // qui ne contient aucun de ces mots.
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
      id: 'dateEcheance',
      accessorFn: (row) => fmtDate(row.dateEcheance),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Échéance' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateEcheance)}</div>,
    },
    {
      id: 'etat',
      // Le filtre doit chercher dans ce qui est réellement affiché - pas le champ brut
      // "etat" seul, qui reste "Impayée" tant que la demande d'annulation n'est pas
      // confirmée, alors que le badge affiche déjà "Demande d'annulation".
      accessorFn: (row) => (row.demandeAnnulation ? "Demande d'annulation" : row.etat),
      header: () => <div className='text-center'>État</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${etatBadgeClass(row.original.etat)}`}
          >
            {row.original.demandeAnnulation ? "Demande d'annulation" : row.original.etat}
          </span>
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => {
        const f = row.original;
        const modifiable = f.etat === 'Impayée' && !f.demandeAnnulation;
        return (
          <div className='flex justify-end gap-2'>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 w-8 p-0 hover:bg-blue-100'
              title="Télécharger l'avis d'échéance / quittance (PDF)"
              onClick={(e) => {
                e.stopPropagation();
                dispatch(telechargerFacturePdf({ id: f.numero, nomLocataire: f.nomLocataire }));
              }}
            >
              <Printer className='h-4 w-4 text-blue-600' />
            </Button>
            {modifiable && (
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0 hover:bg-orange-100'
                title="Demander l'annulation"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(demanderAnnulationFacture(f.numero));
                }}
              >
                <Ban className='h-4 w-4 text-orange-600' />
              </Button>
            )}
            {modifiable && (
              <Button
                variant='ghost'
                size='sm'
                className='h-8 w-8 p-0 hover:bg-red-100'
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(f);
                }}
              >
                <Trash2 className='h-4 w-4 text-red-600' />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllFactures({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllFactures({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Receipt}
            title="Avis d'échéance / Facture"
            description='Génération et suivi des factures de loyer'
            buttons={[
              {
                label: 'Générer une facture',
                icon: Plus,
                variant: 'default',
                onClick: () => navigate('ajouter'),
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer cette facture de "${selectedItem?.nomLocataire || ''}" ?`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Supprimer
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default Factures;
