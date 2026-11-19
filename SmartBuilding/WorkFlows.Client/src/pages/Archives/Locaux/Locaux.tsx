import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { BaseDialog } from '@/components/dialog/dialog';
import { Title } from '@/components/ui/title';
import { LocalResponse } from '@/store/features/patrimoine/local-schemas';
import { getArchivedLocaux, reactivateLocal, setLocal } from '@/store/features/patrimoine/locauxSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatSurface } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { Archive, CircleCheck, ImageOff, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// RMANew (ListArchivesLots.aspx) : Local.inactif=1, avec réactivation
// (Action=Activer → inactif=0). Pas de pencil-édition dans la liste legacy (lAllowFieldOption
// désactivé) mais on la garde ici pour cohérence avec le reste de l'app.
const ArchivesLocaux = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.locaux);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LocalResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getArchivedLocaux({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getArchivedLocaux({ pageNumber: 1, pageSize, search: value }));
  };

  const handleReactivate = (item: LocalResponse) => {
    setSelectedItem(item);
    setReactivateDialogOpen(true);
  };

  const confirmReactivate = async () => {
    if (selectedItem) {
      await dispatch(reactivateLocal(selectedItem.numero)).unwrap();
      setSelectedItem(null);
      setReactivateDialogOpen(false);
      dispatch(getArchivedLocaux({ pageNumber, pageSize, search }));
    }
  };

  const columns: ColumnDef<LocalResponse>[] = [
    {
      id: 'image',
      header: 'Image',
      cell: () => (
        <div className='flex items-center justify-center h-9 w-9 rounded-md bg-gray-100 text-gray-400'>
          <ImageOff className='h-4 w-4' />
        </div>
      ),
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomBuilding || '-'}</div>,
    },
    {
      accessorKey: 'designation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.getValue('designation')}</div>,
    },
    {
      accessorKey: 'etage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Etage' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.etage || '-'}</div>,
    },
    {
      accessorKey: 'nomLocalType',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocalType || '-'}</div>,
    },
    {
      accessorKey: 'surface',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie (m²)' />,
      cell: ({ row }) => <div className='font-medium'>{formatSurface(row.original.surface)}</div>,
    },
    {
      id: 'plan',
      // RMANew (ListArchivesLots.vb, PostProcess "Pl") : lien vers le fichier de plan
      // s'il existe sur disque, sinon "Aucun" - pas de stockage de fichiers pour
      // l'instant côté Smart-Building (même limitation que la colonne Image), donc
      // toujours "Aucun" ici.
      header: () => <div className='text-center'>Plan</div>,
      cell: () => <div className='text-center text-muted-foreground'>Aucun</div>,
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
            title='Modifier'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setLocal(row.original));
              navigate(`/patrimoine/locaux/modifier/${row.original.numero}`);
            }}
          >
            <Pencil className='h-4 w-4 text-yellow-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 px-2 gap-1.5 hover:bg-green-100 text-green-700'
            title='Réactiver ce local'
            onClick={(e) => {
              e.stopPropagation();
              handleReactivate(row.original);
            }}
          >
            <CircleCheck className='h-4 w-4' />
            Réactiver
          </Button>
        </div>
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getArchivedLocaux({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getArchivedLocaux({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Archive} title='Archives — Locaux' description='Locaux désactivés' />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'designation', title: 'Local' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          pagination={pagination}
        />

        <BaseDialog
          open={reactivateDialogOpen}
          onOpenChange={setReactivateDialogOpen}
          title='Confirmer la réactivation'
          description={`Voulez-vous activer le local "${selectedItem?.designation || ''}" ?`}
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setReactivateDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmReactivate}>Activer</Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default ArchivesLocaux;
