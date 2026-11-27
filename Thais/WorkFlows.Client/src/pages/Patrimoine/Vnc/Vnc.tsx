import { BaseDialog } from '@/components/dialog/dialog';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Chip, MoneyCell, PrimarySecondary, RowActions, fmtMoney as fmtKpi } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { VncResponse, VncSummary } from '@/store/features/patrimoine/vnc-schemas';
import { deleteVnc, getAllVnc, getVncSummary, resetVnc } from '@/store/features/patrimoine/vncSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowLeft, CirclePlus, Plus, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const Vnc = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { allItems, totalCount, pageNumber, pageSize, versions, versionsTotalCount, loading } = useAppSelector(
    (state) => state.vnc,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<VncResponse | null>(null);
  const [search, setSearch] = useState('');

  const noBuilding = Number(searchParams.get('building')) || 0;
  const drillDown = noBuilding > 0;
  const current = allItems.find((s) => s.noBuilding === noBuilding);

  useEffect(() => {
    if (!drillDown) {
      dispatch(getVncSummary({ pageNumber: 1, pageSize: 10, search }));
    }
  }, [dispatch, search, drillDown]);

  useEffect(() => {
    if (drillDown) {
      dispatch(getAllVnc({ pageNumber: 1, pageSize: 100, filters: { NoBuilding: [noBuilding] } }));
    }
  }, [dispatch, drillDown, noBuilding]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getVncSummary({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: VncResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteVnc(selectedItem.numero));
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const backToSummary = () => setSearchParams({});
  const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '-');
  const summaryColumns: ColumnDef<VncSummary>[] = [
    {
      accessorKey: 'codeImmeuble',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Code Immeuble' />,
      cell: ({ row }) => <Chip className='font-mono'>{row.original.codeImmeuble}</Chip>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' sorting />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      accessorKey: 'adresse',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Adresse' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.adresse || '-'}</div>,
    },
    {
      accessorKey: 'affectation',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Affectation' />,
      cell: ({ row }) => row.original.affectation ? <Chip>{row.original.affectation}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'usage',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Usage' />,
      cell: ({ row }) => row.original.usage ? <Chip>{row.original.usage}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'valeurBrut',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Valeur Brut' />,
      cell: ({ row }) => <span className='whitespace-nowrap tabular-nums'>{row.original.valeurBrut != null ? fmtKpi(row.original.valeurBrut) : '—'}</span>,
    },
    {
      id: 'provision',
      header: () => <div className='text-center'>Provision</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/provisions?building=${row.original.noBuilding}`);
            }}
          >
            {row.original.nombreProvisions}
          </button>
          <button
            type='button'
            className='text-primary hover:text-primary/70'
            title='Ajouter une provision'
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/patrimoine/provisions/ajouter?building=${row.original.noBuilding}`);
            }}
          >
            <CirclePlus className='h-4 w-4' />
          </button>
        </div>
      ),
    },
    {
      accessorKey: 'derniereVnc',
      header: ({ column }) => <DataTableColumnHeader column={column} title='VNC / Provision' />,
      cell: ({ row }) => <span className='whitespace-nowrap tabular-nums'>{row.original.derniereVnc != null ? fmtKpi(row.original.derniereVnc) : '—'}</span>,
    },
    {
      id: 'valeurMarche',
      header: () => <div className='text-center'>Valeur Marché</div>,
      cell: () => <div className='text-center text-muted-foreground'>—</div>,
    },
    {
      id: 'dateDerniereVnc',
      accessorFn: (row) => fmtDate(row.dateDerniereVnc),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date VNC' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateDerniereVnc)}</span>,
    },
    {
      id: 'versions',
      header: () => <div className='text-center'>Versions</div>,
      cell: ({ row }) => (
        <div className='flex items-center justify-center gap-1.5'>
          <button
            type='button'
            className='inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary hover:bg-primary/20'
            onClick={(e) => {
              e.stopPropagation();
              setSearchParams({ building: String(row.original.noBuilding) });
            }}
          >
            {row.original.nombreVersions}
          </button>
          <button
            type='button'
            className='text-primary hover:text-primary/70'
            title='Ajouter une VNC'
            onClick={(e) => {
              e.stopPropagation();
              dispatch(resetVnc());
              navigate(`/patrimoine/vnc/ajouter?building=${row.original.noBuilding}`);
            }}
          >
            <CirclePlus className='h-4 w-4' />
          </button>
        </div>
      ),
    },
  ];

  const versionsColumns: ColumnDef<VncResponse>[] = [
    {
      accessorKey: 'montantVNC',
      header: () => <div className='text-right'>Montant VNC</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantVNC} />,
    },
    {
      id: 'dateVNC',
      accessorFn: (row) => fmtDate(row.dateVNC),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date VNC' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(row.original.dateVNC)}</span>,
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions onEdit={() => navigate(`/patrimoine/vnc/modifier/${row.original.numero}`)} onDelete={() => handleDelete(row.original)} />
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getVncSummary({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) => dispatch(getVncSummary({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={TrendingUp}
            title='VNC / Provision'
            description={
              drillDown
                ? `Historique des VNC — ${current?.nomBuilding ?? ''}`
                : 'Valeur nette comptable des actifs'
            }
            buttons={
              drillDown
                ? [
                    { label: 'Retour', icon: ArrowLeft, variant: 'secondary', onClick: backToSummary },
                    {
                      label: 'Ajouter',
                      icon: Plus,
                      variant: 'default',
                      onClick: () => {
                        dispatch(resetVnc());
                        navigate(`/patrimoine/vnc/ajouter?building=${noBuilding}`);
                      },
                    },
                  ]
                : [
                    {
                      label: 'Ajouter',
                      icon: Plus,
                      variant: 'default',
                      onClick: () => {
                        dispatch(resetVnc());
                        navigate('/patrimoine/vnc/ajouter');
                      },
                    },
                  ]
            }
          />
        </div>

        {drillDown ? (
          <DataTable
            columns={versionsColumns}
            data={versions}
            isLoading={loading}
            name={`${versionsTotalCount} versions`}
          />
        ) : (
          <div className='overflow-x-auto'>
            <DataTable
              columns={summaryColumns}
              data={allItems}
              searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
              onSearchChange={handleSearchChange}
              isLoading={loading}
              pagination={pagination}
            />
          </div>
        )}

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description='Êtes-vous sûr de vouloir supprimer cette VNC ?'
        >
          <div className='flex justify-end gap-2'>
            <Button variant='outline' onClick={() => setDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant='destructive' onClick={confirmDelete}>
              Supprimer
            </Button>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default Vnc;
