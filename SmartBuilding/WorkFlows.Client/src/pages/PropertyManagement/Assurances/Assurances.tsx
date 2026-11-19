import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { ASSURANCES_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { AssuranceResponse } from '@/store/features/property-management/assurance-schemas';
import {
  deleteAssurance,
  getAllAssurances,
  resetAssurance,
  setAssurance,
} from '@/store/features/property-management/assurancesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Pencil, Plus, Shield, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const statutBadgeClass = (statut: string) => {
  if (statut === 'EnCours') return 'text-green-700 bg-green-100';
  return 'text-gray-600 bg-gray-100';
};

const Assurances = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.assurancesPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AssuranceResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllAssurances({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllAssurances({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: AssuranceResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteAssurance(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<AssuranceResponse>[] = [
    {
      accessorKey: 'numPolice',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Police' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numPolice || '-'}</div>,
    },
    {
      accessorKey: 'nomAssureur',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Assureur' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomAssureur || '-'}</div>,
    },
    {
      accessorKey: 'nomCourtier',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Courtier' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomCourtier || '-'}</div>,
    },
    {
      accessorKey: 'typeCouverture',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Couverture' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.typeCouverture || '-'}</div>,
    },
    {
      id: 'dateEffetContrat',
      accessorFn: (row) => fmtDate(row.dateEffetContrat),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'effet" />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateEffetContrat)}</div>,
    },
    {
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.montant ?? '-'}</div>,
    },
    {
      accessorKey: 'statut',
      header: () => <div className='text-center'>Statut</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statutBadgeClass(row.original.statut)}`}
          >
            {row.original.statut}
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
              dispatch(setAssurance(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllAssurances({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllAssurances({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Shield}
            actions={<ImportMenu config={ASSURANCES_IMPORT} onImported={() => dispatch(getAllAssurances({ pageNumber: 1, pageSize, search }))} />}
            title='Assurances'
            description="Gérer les polices d'assurance"
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetAssurance());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'numPolice', title: 'N° Police' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setAssurance(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver cette police "${selectedItem?.numPolice || ''}" ?`}
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

export default Assurances;
