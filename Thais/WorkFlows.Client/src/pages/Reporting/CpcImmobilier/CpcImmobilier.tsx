import { BaseDialog } from '@/components/dialog/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { ActionButton } from '@/components/table/list-cells';
import { Title } from '@/components/ui/title';
import { CpcImmobilierResponse } from '@/store/features/patrimoine/cpc-immobilier-schemas';
import {
  deleteCpcImmobilier,
  getAllCpcImmobilier,
  resetCpcImmobilier,
  setCpcImmobilier,
} from '@/store/features/patrimoine/cpcImmobilierSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { BarChart3, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const fmtMontant = (m: number) => m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const CpcImmobilier = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.cpcImmobilier);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CpcImmobilierResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllCpcImmobilier({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllCpcImmobilier({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: CpcImmobilierResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteCpcImmobilier(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<CpcImmobilierResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'annee',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Année' />,
      cell: ({ row }) => <div className='font-medium text-center'>{row.original.annee}</div>,
    },
    {
      id: 'resultatVie',
      header: () => <div className='text-right'>Résultat Vie (MAD)</div>,
      cell: ({ row }) => (
        <div className={`text-right font-semibold ${row.original.resultatVie < 0 ? 'text-red-600' : ''}`}>
          {fmtMontant(row.original.resultatVie)}
        </div>
      ),
    },
    {
      id: 'resultatNonVie',
      header: () => <div className='text-right'>Résultat Non Vie (MAD)</div>,
      cell: ({ row }) => (
        <div className={`text-right font-semibold ${row.original.resultatNonVie < 0 ? 'text-red-600' : ''}`}>
          {fmtMontant(row.original.resultatNonVie)}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <ActionButton
            icon={Pencil}
            label="Modifier"
            onClick={() => {
              dispatch(setCpcImmobilier(row.original));
              navigate(`modifier/${row.original.numero}`);
            }}
            className='text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600'
          />
          <ActionButton
            icon={Trash2}
            label="Supprimer"
            onClick={() => {
              handleDelete(row.original);
            }}
            className='text-red-600 hover:bg-red-500/10 hover:text-red-600'
          />
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllCpcImmobilier({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllCpcImmobilier({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={BarChart3}
            title='CPC Immobilier'
            description='Compte de Produits et Charges par actif et par année (saisie manuelle)'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetCpcImmobilier());
                  navigate('ajouter');
                },
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
          onRowClick={(item) => navigate(`voir/${item.numero}`)}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer le CPC de "${selectedItem?.nomBuilding || ''}" (${selectedItem?.annee}) ?`}
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

export default CpcImmobilier;
