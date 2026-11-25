import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { ResiliationResponse } from '@/store/features/leasing/resiliation-schemas';
import {
  deleteResiliation,
  getAllResiliations,
  resetResiliation,
  setResiliation,
} from '@/store/features/leasing/resiliationsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Trash2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Resiliations = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.resiliations,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ResiliationResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllResiliations({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllResiliations({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: ResiliationResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteResiliation(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<ResiliationResponse>[] = [
    {
      id: 'dateResiliation',
      accessorFn: (row) => fmtDate(row.dateResiliation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date résiliation' sorting />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateResiliation)}</div>,
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
      id: 'dateDebutLocation',
      accessorFn: (row) => fmtDate(row.dateDebutLocation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date début location' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateDebutLocation)}</div>,
    },
    {
      accessorKey: 'etage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Etage' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.etage || '-'}</div>,
    },
    {
      accessorKey: 'loyerMensuel',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Loyer mensuel' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.loyerMensuel ?? '-'}</div>,
    },
    {
      accessorKey: 'motifResiliation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Motif résiliation' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.motifResiliation || '-'}</div>,
    },
    {
      id: 'cumulPertesLoyers',
      header: () => <div>Cumul en montant pertes de loyers</div>,
      cell: () => <div className='font-medium text-gray-400' title='Module Facturation bientôt disponible'>-</div>,
    },
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° contrat' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
    },
    {
      accessorKey: 'typeResiliation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type de résiliation' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.typeResiliation}</div>,
    },
    {
      accessorKey: 'durePreavis',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Durée de préavis' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.durePreavis || '-'}</div>,
    },
    {
      accessorKey: 'origineResiliation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Origine résiliation' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.origineResiliation}</div>,
    },
    {
      id: 'dateReception',
      accessorFn: (row) => fmtDate(row.dateReception),
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title='Date de réception de la demande de résiliation' />
      ),
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateReception)}</div>,
    },
    {
      id: 'piecesJointes',
      header: () => <div>Pièces jointes</div>,
      cell: () => <div className='font-medium text-gray-400'>-</div>,
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
              dispatch(setResiliation(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllResiliations({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllResiliations({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={XCircle}
            title='Résiliation'
            description='Gérer les résiliations de baux'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetResiliation());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setResiliation(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver cette résiliation pour "${selectedItem?.nomLocataire || ''}" ?`}
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

export default Resiliations;
