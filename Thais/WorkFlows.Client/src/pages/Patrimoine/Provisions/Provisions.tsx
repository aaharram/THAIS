import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { ProvisionResponse } from '@/store/features/patrimoine/provision-schemas';
import {
  deleteProvision,
  getAllProvisions,
  resetProvision,
} from '@/store/features/patrimoine/provisionsSlice';
import { getBuildingById } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, Wallet, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const Provisions = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.provisions,
  );
  const buildingFilter = useAppSelector((state) => state.buildings.item);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProvisionResponse | null>(null);
  const [search, setSearch] = useState('');

  const buildingId = Number(searchParams.get('building')) || 0;

  useEffect(() => {
    if (buildingId) {
      dispatch(getBuildingById(buildingId));
    }
  }, [buildingId, dispatch]);

  useEffect(() => {
    dispatch(
      getAllProvisions({
        pageNumber: 1,
        pageSize: 10,
        search,
        filters: buildingId ? { NoBuilding: [buildingId] } : undefined,
      }),
    );
  }, [dispatch, search, buildingId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(
      getAllProvisions({
        pageNumber: 1,
        pageSize,
        search: value,
        filters: buildingId ? { NoBuilding: [buildingId] } : undefined,
      }),
    );
  };

  const clearBuildingFilter = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('building');
      return next;
    });
  };

  const handleDelete = (item: ProvisionResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteProvision(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<ProvisionResponse>[] = [
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'montantProvision',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant Provision' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.montantProvision ?? '-'}</div>,
    },
    {
      id: 'dateProvision',
      accessorFn: (row) => fmtDate(row.dateProvision),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Commité' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateProvision)}</div>,
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

  const filters = buildingId ? { NoBuilding: [buildingId] } : undefined;

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) =>
      dispatch(getAllProvisions({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllProvisions({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Wallet}
            title='Provisions'
            description={
              buildingId && buildingFilter
                ? `Provisions rattachées à "${buildingFilter.designation}"`
                : 'Gérer les provisions par actif'
            }
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetProvision());
                  navigate(buildingId ? `ajouter?building=${buildingId}` : 'ajouter');
                },
              },
            ]}
          />
          {buildingId > 0 && (
            <button
              type='button'
              onClick={clearBuildingFilter}
              className='inline-flex items-center gap-1.5 text-sm text-primary bg-primary/10 hover:bg-primary/20 rounded-full px-3 py-1'
            >
              Filtré par actif
              <X className='h-3.5 w-3.5' />
            </button>
          )}
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
          description='Êtes-vous sûr de vouloir supprimer cette provision ?'
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

export default Provisions;
