import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { PrestataireResponse } from '@/store/features/property-management/prestataire-schemas';
import {
  deletePrestataire,
  getAllPrestataires,
  resetPrestataire,
  setPrestataire,
} from '@/store/features/property-management/prestatairesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Handshake, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Prestataires = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.prestataires);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PrestataireResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllPrestataires({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllPrestataires({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: PrestataireResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deletePrestataire(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<PrestataireResponse>[] = [
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Désignation' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.designation}</div>,
    },
    {
      accessorKey: 'activite',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Activité' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.activite || '-'}</div>,
    },
    {
      accessorKey: 'ice',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ICE' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.ice || '-'}</div>,
    },
    {
      accessorKey: 'nomVille',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Ville' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomVille || '-'}</div>,
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
              dispatch(setPrestataire(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllPrestataires({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllPrestataires({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Handshake}
            title='Prestataires'
            description='Registre des prestataires'
            buttons={[
              {
                label: 'Contrats',
                icon: FileText,
                variant: 'secondary',
                onClick: () => navigate('/property-management/prestataires/contrats'),
              },
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetPrestataire());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'designation', title: 'Désignation' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setPrestataire(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer le prestataire "${selectedItem?.designation || ''}" ?`}
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

export default Prestataires;
