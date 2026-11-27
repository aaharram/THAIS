import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { AvatarCell, Chip, fmtDate, RowActions } from '@/components/table/list-cells';
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
import { FileText, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

const dateOrDash = (d?: string | null) => fmtDate(d) || '—';

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

  const openAttestation = (item: AttestationResponse, mode: 'details' | 'modifier') => {
    dispatch(setAttestation(item));
    navigate(`${mode}/${item.numero}`);
  };

  // Colonnes de RMANew (ListAttestation) : Contrats, Clients, N° Facture, Type d'attestation, Date attestation,
  // Date début, Date fin, Pièces jointes, Détails.
  const columns: ColumnDef<AttestationResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrats' sorting />,
      cell: ({ row }) =>
        row.original.numContratLocations ? (
          <Chip className='font-mono'>{row.original.numContratLocations}</Chip>
        ) : (
          <span className='text-muted-foreground'>—</span>
        ),
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Clients' />,
      cell: ({ row }) => <AvatarCell name={row.original.nomLocataire} />,
    },
    {
      id: 'noFacture',
      header: () => <div>N° Facture</div>,
      cell: () => (
        <span className='text-muted-foreground' title='Module Facturation bientôt disponible'>
          —
        </span>
      ),
    },
    {
      accessorKey: 'typeAttestation',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type d'attestation" />,
      cell: ({ row }) => <Chip>{row.original.typeAttestation}</Chip>,
    },
    {
      id: 'dateAttestation',
      accessorFn: (row) => fmtDate(row.dateAttestation),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date attestation' />,
      cell: ({ row }) => <span className='whitespace-nowrap font-medium'>{dateOrDash(row.original.dateAttestation)}</span>,
    },
    {
      id: 'dateDebut',
      accessorFn: (row) => fmtDate(row.dateDebut),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date début' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{dateOrDash(row.original.dateDebut)}</span>,
    },
    {
      id: 'dateFin',
      accessorFn: (row) => fmtDate(row.dateFin),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date fin' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{dateOrDash(row.original.dateFin)}</span>,
    },
    {
      id: 'piecesJointes',
      header: () => <div>Pièces jointes</div>,
      cell: () => <span className='text-muted-foreground'>—</span>,
    },
    {
      id: 'details',
      size: 96,
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => openAttestation(row.original, 'modifier')}
          onDelete={() => handleDelete(row.original)}
          deleteLabel='Désactiver'
        />
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
          onRowClick={(item) => openAttestation(item, 'details')}
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
