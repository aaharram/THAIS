import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { BaseDialog } from '@/components/dialog/dialog';
import { Title } from '@/components/ui/title';
import { BailResponse } from '@/store/features/leasing/bail-schemas';
import { getArchivedBaux, reactivateBail, setBail } from '@/store/features/leasing/bauxSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { formatSurface } from '@/utils/formatters';
import { ColumnDef } from '@tanstack/react-table';
import { Archive, CircleCheck, Pencil } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

// RMANew (ListArchiveLocation.aspx) : cFilter = "(Location.inactif=1 or
// Location.EtatLocation!=1) and Location.Montant>0" - bail résilié/inactif ou plus "en
// cours", avec réactivation ("Activer" → UPDATE Location SET EtatLocation=1, inactif=0).
// "Location" (RMANew) = "Bail" (nouvelle app).
const etatBadgeClass = (etat: string) => {
  if (etat === 'En cours de location') return 'text-green-700 bg-green-100';
  if (etat === 'Suspendu') return 'text-amber-700 bg-amber-100';
  return 'text-gray-600 bg-gray-100';
};

const ArchivesLocations = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.baux);
  const [reactivateDialogOpen, setReactivateDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BailResponse | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(getArchivedBaux({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getArchivedBaux({ pageNumber: 1, pageSize, search: value }));
  };

  const handleReactivate = (item: BailResponse) => {
    setSelectedItem(item);
    setReactivateDialogOpen(true);
  };

  const confirmReactivate = async () => {
    if (selectedItem) {
      await dispatch(reactivateBail(selectedItem.numero)).unwrap();
      setSelectedItem(null);
      setReactivateDialogOpen(false);
      dispatch(getArchivedBaux({ pageNumber, pageSize, search }));
    }
  };

  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');

  const columns: ColumnDef<BailResponse>[] = [
    {
      accessorKey: 'numContratLocations',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Contrat' sorting />,
      cell: ({ row }) => <div className='font-medium'>{row.original.numContratLocations || '-'}</div>,
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
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.nomLocal || '-'}</div>,
    },
    {
      accessorKey: 'surface',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Superficie (m²)' />,
      cell: ({ row }) => <div className='font-medium'>{formatSurface(row.original.surface)}</div>,
    },
    {
      accessorKey: 'loyerNet',
      // RMANew (ListArchiveLocation.aspx) : "Montant de location (HT/HC)" = loyer net seul,
      // avant taxe/TVA/charges - distinct du montant total (TC/CC).
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant location (MAD) (HT/HC)' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.loyerNet ?? '-'}</div>,
    },
    {
      accessorKey: 'montant',
      // RMANew : "Montant de location (TC/CC)" = Toutes Charges/Comprises, le total du bail.
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant location (MAD) (TC/CC)' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.montant ?? '-'}</div>,
    },
    {
      accessorKey: 'dateDebut',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Date d'effet" />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateDebut)}</div>,
    },
    {
      accessorKey: 'dateFin',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date fin' />,
      cell: ({ row }) => <div className='font-medium'>{fmtDate(row.original.dateFin)}</div>,
    },
    {
      accessorKey: 'etat',
      size: 190,
      header: () => <div className='text-center'>Etat</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          <span
            className={`inline-block whitespace-nowrap text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${etatBadgeClass(row.original.etat)}`}
          >
            {row.original.etat}
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
            title='Modifier'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setBail(row.original));
              navigate(`/leasing-management/baux/modifier/${row.original.numero}`);
            }}
          >
            <Pencil className='h-4 w-4 text-yellow-600' />
          </Button>
          <Button
            variant='ghost'
            size='sm'
            className='h-8 px-2 gap-1.5 hover:bg-green-100 text-green-700'
            title='Réactiver ce bail'
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
    onPageChange: (newPage: number) => dispatch(getArchivedBaux({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getArchivedBaux({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title icon={Archive} title='Archives — Locations' description='Baux résiliés ou inactifs' />
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
          open={reactivateDialogOpen}
          onOpenChange={setReactivateDialogOpen}
          title='Confirmer la réactivation'
          description={`Voulez-vous activer ce bail pour "${selectedItem?.nomLocataire || ''}" ?`}
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

export default ArchivesLocations;
