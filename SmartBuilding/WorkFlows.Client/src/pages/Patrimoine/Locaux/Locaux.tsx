import { BaseDialog } from '@/components/dialog/dialog';
import { ImportMenu } from '@/components/import/import-menu';
import { LOCAUX_IMPORT } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { LocalResponse } from '@/store/features/patrimoine/local-schemas';
import {
  deleteLocal,
  getAllLocaux,
  resetLocal,
  setLocal,
} from '@/store/features/patrimoine/locauxSlice';
import { getBuildingById } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatSurface } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { Home, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const Locaux = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.locaux,
  );
  const buildingFilter = useAppSelector((state) => state.buildings.item);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LocalResponse | null>(null);
  const [search, setSearch] = useState('');

  const buildingId = Number(searchParams.get('building')) || 0;

  useEffect(() => {
    if (buildingId) {
      dispatch(getBuildingById(buildingId));
    }
  }, [buildingId, dispatch]);

  useEffect(() => {
    dispatch(
      getAllLocaux({
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
      getAllLocaux({
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

  const handleDelete = (item: LocalResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteLocal(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const columns: ColumnDef<LocalResponse>[] = [
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nom du local' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('designation')}</div>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'nomLocalType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocalType || '-'}</div>,
    },
    {
      accessorKey: 'surface',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie (m²)' />,
      cell: ({ row }) => <div className='font-medium'>{formatSurface(row.original.surface)}</div>,
    },
    {
      accessorKey: 'nbrePiece',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nb Pièces' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nbrePiece ?? '-'}</div>,
    },
    {
      id: 'mettreEnLocation',
      header: () => <div className='text-center'>Mettre en location</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.mettreEnLocation ? (
            <span className='inline-block text-[10px] font-bold uppercase tracking-wide text-green-700 bg-green-100 px-2 py-0.5 rounded-full'>
              Oui
            </span>
          ) : (
            <span className='inline-block text-[10px] font-bold uppercase tracking-wide text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full'>
              Non
            </span>
          )}
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
              dispatch(setLocal(row.original));
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
      dispatch(getAllLocaux({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllLocaux({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Home}
            title='Locaux'
            actions={<ImportMenu config={LOCAUX_IMPORT} onImported={() => dispatch(getAllLocaux({ pageNumber: 1, pageSize, search, filters }))} />}
            description={
              buildingId && buildingFilter
                ? `Locaux rattachés à "${buildingFilter.designation}"`
                : 'Gérer les locaux (lots) rattachés aux immeubles'
            }
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetLocal());
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
          searchableColumns={[{ id: 'designation', title: 'Nom du local' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setLocal(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver "${selectedItem?.designation || ''}" ?`}
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

export default Locaux;
