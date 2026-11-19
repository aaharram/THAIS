import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { PrestataireContratResponse } from '@/store/features/property-management/prestataire-contrat-schemas';
import {
  deletePrestataireContrat,
  getAllPrestataireContrats,
  resetPrestataireContrat,
  setPrestataireContrat,
} from '@/store/features/property-management/prestataireContratsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const backPath = '/property-management/prestataires';

const Contrats = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.prestataireContrats);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PrestataireContratResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllPrestataireContrats({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllPrestataireContrats({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: PrestataireContratResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deletePrestataireContrat(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<PrestataireContratResponse>[] = [
    {
      accessorKey: 'numeroContrat',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numeroContrat || '-'}</div>,
    },
    {
      accessorKey: 'nomPrestataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prestataire' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomPrestataire || '-'}</div>,
    },
    {
      accessorKey: 'objet',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Objet' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.objet || '-'}</div>,
    },
    {
      id: 'dateDebut',
      accessorFn: (row) => fmtDate(row.dateDebut),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date début' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateDebut)}</div>,
    },
    {
      id: 'dateFin',
      accessorFn: (row) => fmtDate(row.dateFin),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date fin' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateFin)}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.montant ?? '-'}</div>,
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
              dispatch(setPrestataireContrat(row.original));
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
      dispatch(getAllPrestataireContrats({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllPrestataireContrats({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileText}
            title='Contrats prestataires'
            description='Gérer les contrats rattachés aux prestataires'
            buttons={[
              {
                label: 'Retour aux prestataires',
                icon: undefined,
                variant: 'secondary',
                onClick: () => navigate(backPath),
              },
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetPrestataireContrat());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomPrestataire', title: 'Prestataire' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setPrestataireContrat(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver ce contrat "${selectedItem?.numeroContrat || ''}" ?`}
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

export default Contrats;
