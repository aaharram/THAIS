import { BaseDialog } from '@/components/dialog/dialog';
import { ExportMenu, fetchAllPages } from '@/components/export/export-menu';
import { ImportMenu } from '@/components/import/import-menu';
import { LOCATAIRES_IMPORT } from '@/utils/import/import-configs';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
  AvatarCell,
  Chip,
  IconTile,
  KPI_TONES,
  KpiCard,
  KpiStrip,
  PrimarySecondary,
  RowActions,
} from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Title } from '@/components/ui/title';
import { LocataireResponse } from '@/store/features/leasing/locataire-schemas';
import {
  deleteLocataire,
  getAllLocataires,
  resetLocataire,
  setLocataire,
} from '@/store/features/leasing/locatairesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Building2, ContactRound, DollarSign, HandCoins, Plus, UserRound, Users } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';

const isEntreprise = (l: LocataireResponse) => l.typeLocataire === 1;

const Locataires = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.locataires,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<LocataireResponse | null>(null);
  const [search, setSearch] = useState('');
  // Tous les locataires (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<LocataireResponse[] | null>(null);
  const [searchParams] = useSearchParams();
  // ?building= : actif choisi dans le filtre de Leasing Management.
  const buildingId = Number(searchParams.get('building')) || 0;
  const filters = useMemo(() => (buildingId ? { NoBuilding: [buildingId] } : undefined), [buildingId]);

  const loadStats = useCallback(() => {
    fetchAllPages<LocataireResponse>('/api/locataires', '', filters)
      .then(setStats)
      .catch(() => setStats([]));
  }, [filters]);

  const EXPORT_HEADER = ['Locataire', 'Actif', 'Local', 'ICE', 'RC', 'Téléphone', 'Email', 'Adresse', 'Ville'];
  const getExportRows = async () =>
    (await fetchAllPages<LocataireResponse>('/api/locataires', search, filters)).map((l) => [
      l.nomAffiche ?? '',
      l.nomBuilding ?? '',
      l.nomLocal ?? '',
      l.ice ?? '',
      l.rc ?? '',
      l.telephone ?? '',
      l.email ?? '',
      l.adresse ?? '',
      l.nomCity ?? '',
    ]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    dispatch(getAllLocataires({ pageNumber: 1, pageSize: 10, search, filters }));
  }, [dispatch, search, buildingId]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllLocataires({ pageNumber: 1, pageSize, search: value, filters }));
  };

  const handleDelete = (item: LocataireResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteLocataire(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const openLocataire = (item: LocataireResponse, mode: 'details' | 'modifier') => {
    dispatch(setLocataire(item));
    navigate(`${mode}/${item.numero}`);
  };

  const kpis = useMemo(() => {
    if (!stats) return null;
    return {
      total: stats.length,
      entreprises: stats.filter(isEntreprise).length,
      particuliers: stats.filter((l) => !isEntreprise(l)).length,
      sansContact: stats.filter((l) => !l.email && !l.telephone).length,
    };
  }, [stats]);

  const columns: ColumnDef<LocataireResponse>[] = [
    {
      accessorKey: 'nomAffiche',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => {
        const l = row.original;
        return <AvatarCell name={l.nomAffiche} secondary={l.codeLocataire ? `Code ${l.codeLocataire}` : l.nomCity} />;
      },
    },
    {
      id: 'type',
      accessorFn: (row) => (isEntreprise(row) ? 'Entreprise' : 'Particulier'),
      header: () => <div>Type</div>,
      cell: ({ row }) => (
        <Chip>
          {isEntreprise(row.original) ? <Building2 className='mr-1 h-3 w-3' /> : <UserRound className='mr-1 h-3 w-3' />}
          {isEntreprise(row.original) ? 'Entreprise' : 'Particulier'}
        </Chip>
      ),
    },
    {
      id: 'identification',
      accessorFn: (row) => [row.ice, row.rc, row.noCIN].filter(Boolean).join(' '),
      header: () => <div>Identification</div>,
      cell: ({ row }) => {
        const l = row.original;
        const secondary = isEntreprise(l) ? (l.rc ? `RC ${l.rc}` : null) : l.noCIN ? `CIN ${l.noCIN}` : null;
        return <PrimarySecondary primary={l.ice ? `ICE ${l.ice}` : ''} secondary={secondary} />;
      },
    },
    {
      id: 'contact',
      accessorFn: (row) => [row.telephone, row.email].filter(Boolean).join(' '),
      header: () => <div>Contact</div>,
      cell: ({ row }) => {
        const l = row.original;
        return (
          <PrimarySecondary
            primary={l.telephone || l.email}
            secondary={l.telephone && l.email ? l.email : null}
            className='max-w-[220px]'
          />
        );
      },
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif / Local' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} secondary={row.original.nomLocal} />,
    },
    {
      id: 'encaissement',
      header: () => <div className='text-center'>Encaissement</div>,
      cell: () => <IconTile icon={HandCoins} label='Encaissement : module Recouvrement bientôt disponible' tone='green' disabled />,
    },
    {
      id: 'quittance',
      header: () => <div className='text-center'>Quittance</div>,
      cell: () => <IconTile icon={DollarSign} label='Quittance : module Facturation bientôt disponible' tone='sky' disabled />,
    },
    {
      id: 'details',
      size: 96,
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => openLocataire(row.original, 'modifier')}
          onDelete={() => handleDelete(row.original)}
          deleteLabel='Désactiver'
        />
      ),
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllLocataires({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) => dispatch(getAllLocataires({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={Users}
            title='Locataires'
            actions={
              <>
                <ExportMenu fileName='Locataires' pdfTitle='Liste des Locataires' header={EXPORT_HEADER} getRows={getExportRows} />
                <ImportMenu
                  config={LOCATAIRES_IMPORT}
                  onImported={() => {
                    dispatch(getAllLocataires({ pageNumber: 1, pageSize, search, filters }));
                    loadStats();
                  }}
                />
              </>
            }
            description='Gérer les locataires'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetLocataire());
                  navigate('ajouter');
                },
              },
            ]}
          />

          <KpiStrip>
            <KpiCard
              icon={Users}
              label='Locataires'
              value={kpis ? String(kpis.total) : '—'}
              hint='actifs dans la base'
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={Building2}
              label='Entreprises'
              value={kpis ? String(kpis.entreprises) : '—'}
              hint={kpis && kpis.total ? `${Math.round((kpis.entreprises / kpis.total) * 100)} % des locataires` : undefined}
              tone={KPI_TONES.sky}
            />
            <KpiCard
              icon={UserRound}
              label='Particuliers'
              value={kpis ? String(kpis.particuliers) : '—'}
              hint={kpis && kpis.total ? `${Math.round((kpis.particuliers / kpis.total) * 100)} % des locataires` : undefined}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={ContactRound}
              label='Sans contact'
              value={kpis ? String(kpis.sansContact) : '—'}
              hint='ni e-mail ni téléphone renseigné'
              tone={KPI_TONES.amber}
            />
          </KpiStrip>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomAffiche', title: 'Nom' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowClick={(item) => openLocataire(item, 'details')}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir désactiver "${selectedItem?.nomAffiche || ''}" ?`}
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

export default Locataires;
