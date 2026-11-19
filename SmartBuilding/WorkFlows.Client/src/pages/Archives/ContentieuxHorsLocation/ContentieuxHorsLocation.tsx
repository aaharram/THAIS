import { BaseDialog } from '@/components/dialog/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Title } from '@/components/ui/title';
import {
  ContentieuxHorsLocationResponse,
  TYPES_CONTENTIEUX_HORS_LOCATION,
} from '@/store/features/leasing/contentieux-hors-location-schemas';
import {
  deleteContentieuxHorsLocation,
  getAllContentieuxHorsLocation,
  resetContentieuxHorsLocation,
  setContentieuxHorsLocation,
} from '@/store/features/leasing/contentieuxHorsLocationSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Gavel, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// RMANew (ListContentieuxHorsLocation.aspx) : table ContentieuxHorsLocation, entièrement
// dénormalisée (Locataire/CodeLocataire/Immeuble = simples colonnes texte, pas de FK) -
// dossier de contentieux pour un locataire SANS bail actif, distinct de SuiviContentieux
// (rattaché à un Bail).
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
const fmtMontant = (m?: number | null) =>
  m == null ? '-' : m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const typeLabel = (type: number) =>
  TYPES_CONTENTIEUX_HORS_LOCATION.find((t) => t.value === type)?.label ?? '-';

const ArchivesContentieuxHorsLocation = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.contentieuxHorsLocation,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ContentieuxHorsLocationResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllContentieuxHorsLocation({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllContentieuxHorsLocation({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: ContentieuxHorsLocationResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteContentieuxHorsLocation(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<ContentieuxHorsLocationResponse>[] = [
    {
      accessorKey: 'locataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.locataire || '-'}</div>,
    },
    {
      accessorKey: 'codeLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Code Locataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.codeLocataire || '-'}</div>,
    },
    {
      accessorKey: 'immeuble',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.immeuble || '-'}</div>,
    },
    {
      accessorKey: 'loyerMensuelTTC',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer mensuel TTC (MAD)' />,
      cell: ({ row }) => <div className='font-medium text-right'>{fmtMontant(row.original.loyerMensuelTTC)}</div>,
    },
    {
      id: 'periode',
      header: () => <div>Période impayés</div>,
      cell: ({ row }) => (
        <div className='font-medium whitespace-nowrap'>
          {fmtDate(row.original.dateDebutImpaye)} - {fmtDate(row.original.dateFinImpaye)}
        </div>
      ),
    },
    {
      accessorKey: 'nbMoisImpaye',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nb Mois impayé' />,
      cell: ({ row }) => <div className='font-medium text-center'>{row.original.nbMoisImpaye}</div>,
    },
    {
      accessorKey: 'montantLoyerImpaye',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant Loyer impayé (MAD)' />,
      cell: ({ row }) => <div className='font-bold text-right'>{fmtMontant(row.original.montantLoyerImpaye)}</div>,
    },
    {
      accessorKey: 'type',
      header: () => <div className='text-center'>Type</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              row.original.type === 1 ? 'text-amber-700 bg-amber-100' : 'text-green-700 bg-green-100'
            }`}
          >
            {typeLabel(row.original.type)}
          </span>
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
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setContentieuxHorsLocation(row.original));
              navigate(`modifier/${row.original.numero}`);
            }}
          >
            <Pencil className='h-4 w-4 text-yellow-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-red-100'
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.original);
            }}
          >
            <Trash2 className='h-4 w-4 text-red-600' />
          </Button>
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) =>
      dispatch(getAllContentieuxHorsLocation({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllContentieuxHorsLocation({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Gavel}
            title='Archives — Contentieux Hors Location'
            description='Dossiers de contentieux pour locataires sans bail actif'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetContentieuxHorsLocation());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'locataire', title: 'Locataire' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer ce dossier pour "${selectedItem?.locataire || ''}" ?`}
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

export default ArchivesContentieuxHorsLocation;
