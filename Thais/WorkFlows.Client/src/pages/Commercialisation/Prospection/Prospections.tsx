import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import {
  DESTINATIONS_PROSPECTION,
  NATURES_OFFRE,
  ProspectionResponse,
} from '@/store/features/commercialisation/prospection-schemas';
import {
  deleteProspection,
  getAllProspections,
  resetProspection,
  setProspection,
} from '@/store/features/commercialisation/prospectionsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { CirclePlus, Paperclip, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// Règle métier : toute Typologie non répertoriée (y compris absente) s'affiche "Autres".
const labelOfTypologie = (value?: number | null) =>
  DESTINATIONS_PROSPECTION.find((o) => o.value === value)?.label ?? 'Autres';

const labelOf = (list: readonly { value: number; label: string }[], value?: number | null) =>
  list.find((o) => o.value === value)?.label ?? '-';

const Prospections = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.prospections,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ProspectionResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllProspections({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllProspections({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: ProspectionResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteProspection(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
  const pj = (name?: string | null) =>
    name ? (
      <Paperclip className='h-4 w-4 text-blue-600' aria-label={name} />
    ) : (
      <span className='text-gray-400'>-</span>
    );

  const columns: ColumnDef<ProspectionResponse>[] = [
    {
      id: 'numero',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Numéro' sorting />,
      cell: ({ row }) => (
        <div className='font-medium'>
          PR{row.original.numero.toString().padStart(7, '0')} / {new Date(row.original.addDate).getFullYear()}
        </div>
      ),
    },
    {
      accessorKey: 'description',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Zone' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.description || '-'}</div>,
    },
    {
      accessorKey: 'nbBien',
      header: () => <div className='text-center'>Nb Biens</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20 disabled:cursor-default disabled:hover:bg-primary/10'
            disabled={row.original.nbBien === 0}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/actifs?prospection=${row.original.numero}`);
            }}
          >
            {row.original.nbBien}
          </button>
          <button
            type='button'
            className='text-primary hover:text-primary/70'
            title='Rattacher un bien'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/commercialisation/prospection/bien/ajouter?prospection=${row.original.numero}`);
            }}
          >
            <CirclePlus className='h-4 w-4' />
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'typologie',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Destination' />,
      cell: ({ row }) => <div className='font-medium'>{labelOfTypologie(row.original.typologie)}</div>,
    },
    {
      accessorKey: 'typeOperation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Type Operation' />,
      cell: ({ row }) => <div className='font-medium'>{labelOf(NATURES_OFFRE, row.original.typeOperation)}</div>,
    },
    {
      id: 'dateAjout',
      accessorFn: (row) => fmtDate(row.dateAjout),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'ajout" />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateAjout)}</div>,
    },
    {
      id: 'dateAdjudication',
      accessorFn: (row) => fmtDate(row.dateAdjudication),
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'accord de la BPP" />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateAdjudication)}</div>,
    },
    {
      id: 'dateContrat',
      accessorFn: (row) => fmtDate(row.dateContrat),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date Contrat' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateContrat)}</div>,
    },
    {
      id: 'avisBPP',
      header: () => <div className='text-center'>Support de la BPP</div>,
      cell: ({ row }) => <div className='flex justify-center'>{pj(row.original.avisBPP)}</div>,
    },
    {
      id: 'businesPlan',
      header: () => <div className='text-center'>Business Plan</div>,
      cell: ({ row }) => <div className='flex justify-center'>{pj(row.original.businesPlan)}</div>,
    },
    {
      id: 'avisDPAL',
      header: () => <div className='text-center'>Avis de la DPAL</div>,
      cell: ({ row }) => <div className='flex justify-center'>{pj(row.original.avisDPAL)}</div>,
    },
    {
      id: 'supportCA',
      header: () => <div className='text-center'>Support du Comité Administratif</div>,
      cell: ({ row }) => <div className='flex justify-center'>{pj(row.original.supportCA)}</div>,
    },
    {
      id: 'pv',
      header: () => <div className='text-center'>PV d&apos;accord</div>,
      cell: ({ row }) => <div className='flex justify-center'>{pj(row.original.pv)}</div>,
    },
    {
      accessorKey: 'situationProspection',
      header: () => <div>Réserve foncière</div>,
      cell: ({ row }) => {
        // Règle métier : 0 => "Encours" (orange), toute autre valeur => "Terminée" (vert).
        const isEncours = (row.original.situationProspection ?? 0) === 0;
        const statut = isEncours ? 'Encours' : 'Terminée';
        return (
          <span
            className={`inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
              isEncours ? 'text-amber-700 bg-amber-100' : 'text-green-700 bg-green-100'
            }`}
          >
            {statut}
          </span>
        );
      },
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
              dispatch(setProspection(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllProspections({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllProspections({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Search}
            title='Prospections'
            description='Suivi des opportunités de prospection commerciale'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetProspection());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'description', title: 'Zone' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setProspection(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver cette prospection "${selectedItem?.description || ''}" ?`}
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

export default Prospections;
