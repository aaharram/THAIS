import { BaseDialog } from '@/components/dialog/dialog';
import { ExportMenu, fetchAllPages } from '@/components/export/export-menu';
import { ImportMenu } from '@/components/import/import-menu';
import { BAUX_IMPORT } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { BailResponse } from '@/store/features/leasing/bail-schemas';
import { deleteBail, getAllBaux, resetBail, setBail } from '@/store/features/leasing/bauxSlice';
import { getBuildingById } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { FileSignature, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const etatBadgeClass = (etat: string) => {
  if (etat === 'En cours de location') return 'text-green-700 bg-green-100';
  if (etat === 'Suspendu') return 'text-amber-700 bg-amber-100';
  return 'text-gray-600 bg-gray-100';
};

const Baux = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.baux);
  const buildingFilter = useAppSelector((state) => state.buildings.item);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<BailResponse | null>(null);
  const [search, setSearch] = useState('');

  const buildingId = Number(searchParams.get('building')) || 0;

  useEffect(() => {
    if (buildingId) {
      dispatch(getBuildingById(buildingId));
    }
  }, [buildingId, dispatch]);

  useEffect(() => {
    dispatch(
      getAllBaux({
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
      getAllBaux({
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

  const handleDelete = (item: BailResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteBail(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
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
      accessorKey: 'etage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Etage' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.etage || '-'}</div>,
    },
    {
      accessorKey: 'usage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Usage' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.usage || '-'}</div>,
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
      accessorKey: 'montant',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Montant de location (MAD)' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.montant ?? '-'}</div>,
    },
    {
      accessorKey: 'etat',
      // Largeur fixe + whitespace-nowrap : le badge tient sur une seule ligne (« EN COURS DE
      // LOCATION ») même quand le menu latéral est ouvert, au lieu de se couper sur deux lignes.
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
            onClick={(e) => {
              e.stopPropagation();
              dispatch(setBail(row.original));
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

  const EXPORT_HEADER = [
    'Contrat',
    'Locataire',
    'Actif',
    'Local',
    'Etage',
    'Usage',
    'Date début',
    'Date fin',
    'Montant de location (MAD)',
    'Etat',
  ];
  const getExportRows = async () =>
    (await fetchAllPages<BailResponse>('/api/baux', search, filters)).map((b) => [
      b.numContratLocations ?? '',
      b.nomLocataire ?? '',
      b.nomBuilding ?? '',
      b.nomLocal ?? '',
      b.etage ?? '',
      b.usage ?? '',
      fmtDate(b.dateDebut),
      fmtDate(b.dateFin),
      b.montant != null ? String(b.montant) : '',
      b.etat ?? '',
    ]);

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) =>
      dispatch(getAllBaux({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllBaux({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileSignature}
            title='Contractualisation'
            actions={
              <>
                <ExportMenu fileName='Contrats' pdfTitle='Liste des Contrats' header={EXPORT_HEADER} getRows={getExportRows} />
                <ImportMenu config={BAUX_IMPORT} onImported={() => dispatch(getAllBaux({ pageNumber: 1, pageSize, search, filters }))} />
              </>
            }
            description={
              buildingId && buildingFilter
                ? `Baux rattachés à "${buildingFilter.designation}"`
                : 'Gérer les baux'
            }
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetBail());
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
          onRowDoubleClick={(item) => {
            dispatch(setBail(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver ce bail pour "${selectedItem?.nomLocataire || ''}" ?`}
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

export default Baux;
