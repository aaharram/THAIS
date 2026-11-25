import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { AttestationResponse } from '@/store/features/leasing/attestation-schemas';
import {
  deleteAttestation,
  getAllAttestations,
  resetAttestation,
  setAttestation,
} from '@/store/features/leasing/attestationsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { FileText, Pencil, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const Attestations = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.attestations,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AttestationResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getAllAttestations({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllAttestations({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: AttestationResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteAttestation(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<AttestationResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrats' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Clients' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocataire || '-'}</div>,
    },
    {
      id: 'noFacture',
      header: () => <div>N° Facture</div>,
      cell: () => <div className='font-medium text-gray-400' title='Module Facturation bientôt disponible'>-</div>,
    },
    {
      accessorKey: 'typeAttestation',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type d'attestation" />,
      cell: ({ row }) => <div className='font-medium'>{row.original.typeAttestation}</div>,
    },
    {
      id: 'dateAttestation',
      accessorFn: (row) => fmtDate(row.dateAttestation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date attestation' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateAttestation)}</div>,
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
              dispatch(setAttestation(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllAttestations({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getAllAttestations({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileText}
            title='Attestations fiscales'
            description='Générer les attestations fiscales'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetAttestation());
                  navigate('ajouter');
                },
              },
            ]}
          />
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomLocataire', title: 'Client' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setAttestation(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver cette attestation pour "${selectedItem?.nomLocataire || ''}" ?`}
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

export default Attestations;
