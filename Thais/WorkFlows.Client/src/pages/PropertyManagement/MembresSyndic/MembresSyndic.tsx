import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Chip, InitialsAvatar, RowActions } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImportMenu } from '@/components/import/import-menu';
import { MEMBRES_SYNDIC_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { SyndicResponse } from '@/store/features/property-management/syndic-schemas';
import { deleteSyndic, getAllSyndics, resetSyndic, setSyndic } from '@/store/features/property-management/syndicsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const MembresSyndic = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.syndicsPm);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SyndicResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllSyndics({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllSyndics({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: SyndicResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteSyndic(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<SyndicResponse>[] = [
    {
      accessorKey: 'idSyndic',
      header: ({ column }) => <DataTableColumnHeader column={column} title='ID' sorting />,
      cell: ({ row }) => row.original.idSyndic ? <Chip className='font-mono'>{row.original.idSyndic}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'nom',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Nom' sorting />,
      cell: ({ row }) => (
        <div className='flex items-center gap-3'>
          <InitialsAvatar name={`${row.original.nom} ${row.original.prenom ?? ''}`} />
          <span className='font-medium'>{row.original.nom}</span>
        </div>
      ),
    },
    {
      accessorKey: 'prenom',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Prénom' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.prenom || '-'}</div>,
    },
    {
      accessorKey: 'poste',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Poste' />,
      cell: ({ row }) => row.original.poste ? <Chip>{row.original.poste}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'telephone',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Téléphone' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{row.original.telephone || '—'}</span>,
    },
    {
      accessorKey: 'debutMandat',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Début mandat' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.debutMandat)}</span>,
    },
    {
      accessorKey: 'finMandat',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Fin mandat' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.finMandat)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => {
            dispatch(setSyndic(row.original));
            navigate(`modifier/${row.original.numero}`);
          }}
          onDelete={() => handleDelete(row.original)}
        />
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllSyndics({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllSyndics({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Users}
            actions={<ImportMenu config={MEMBRES_SYNDIC_IMPORT} onImported={() => dispatch(getAllSyndics({ pageNumber: 1, pageSize, search }))} />}
            title='Membres du syndic'
            description='Registre des membres du bureau syndical'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetSyndic());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nom', title: 'Nom' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setSyndic(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver ce membre "${selectedItem?.nom || ''}" ?`}
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

export default MembresSyndic;
