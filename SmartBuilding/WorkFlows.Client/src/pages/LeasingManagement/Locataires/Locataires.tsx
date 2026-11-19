import { BaseDialog } from '@/components/dialog/dialog';
import { ImportMenu } from '@/components/import/import-menu';
import { LOCATAIRES_IMPORT } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { LocataireResponse } from '@/store/features/leasing/locataire-schemas';
import {
  deleteLocataire,
  getAllLocataires,
  resetLocataire,
  setLocataire,
} from '@/store/features/leasing/locatairesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { HandCoins, Pencil, Plus, Receipt, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const Locataires = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.locataires,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LocataireResponse | null>(null);
  const [search, setSearch] = useState('');
  const [searchParams] = useSearchParams();
  // ?building= : actif choisi dans le filtre de Leasing Management.
  const buildingId = Number(searchParams.get('building')) || 0;
  const filters = buildingId ? { NoBuilding: [buildingId] } : undefined;

  useEffect(() => {
    dispatch(getAllLocataires({ pageNumber: 1, pageSize: 10, search, filters }));
  }, [dispatch, search, buildingId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllLocataires({ pageNumber: 1, pageSize, search: value, filters }));
  };

  const handleDelete = (item: LocataireResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteLocataire(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<LocataireResponse>[] = [
    {
      accessorKey: 'nomAffiche',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('nomAffiche')}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      id: 'encaissement',
      header: () => <div className='text-center'>Encaissement</div>,
      cell: () => (
        <div className='flex justify-center'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            disabled
            title='Module Recouvrement bientôt disponible'
          >
            <HandCoins className='h-4 w-4 text-gray-400' />
          </Button>
        </div>
      ),
    },
    {
      id: 'quittance',
      header: () => <div className='text-center'>Quittance</div>,
      cell: () => (
        <div className='flex justify-center'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0'
            disabled
            title='Module Facturation bientôt disponible'
          >
            <Receipt className='h-4 w-4 text-gray-400' />
          </Button>
        </div>
      ),
    },
    {
      id: 'details',
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <div className='flex justify-end gap-2'>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 w-8 p-0 hover:bg-yellow-100'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setLocataire(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllLocataires({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) => dispatch(getAllLocataires({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Users}
            title='Locataires'
            actions={<ImportMenu config={LOCATAIRES_IMPORT} onImported={() => dispatch(getAllLocataires({ pageNumber: 1, pageSize, search, filters }))} />}
            description='Gérer les locataires'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetLocataire());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomAffiche', title: 'Nom' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setLocataire(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver "${selectedItem?.nomAffiche || ''}" ?`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Désactiver
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default Locataires;
