import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { Chip, KPI_TONES, KpiCard, KpiStrip, MoneyCell, PrimarySecondary, RowActions, fmtMoney as fmtKpi } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ImportMenu } from '@/components/import/import-menu';
import { PRESTATIONS_ACHAT_IMPORT } from '@/utils/import/import-configs';
import { Title } from '@/components/ui/title';
import { PrestationAchatResponse } from '@/store/features/property-management/prestation-achat-schemas';
import {
  amortirPrestationAchat,
  deletePrestationAchat,
  getAllPrestationsAchat,
  resetPrestationAchat,
  setPrestationAchat,
} from '@/store/features/property-management/prestationsAchatSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { Banknote, Calculator, CheckCircle2, ClipboardList, Plus, ShoppingCart } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const PrestationsAchat = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector(
    (state) => state.prestationsAchatPm,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PrestationAchatResponse | null>(null);
  const [amortirDialogOpen, setAmortirDialogOpen] = useState(false);
  const [amortirItem, setAmortirItem] = useState<PrestationAchatResponse | null>(null);
  const [dureeMois, setDureeMois] = useState<string>('12');
  const [taux, setTaux] = useState<string>('');
  const [search, setSearch] = useState('');
  // Tous les enregistrements (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<PrestationAchatResponse[] | null>(null);
  const loadStats = useCallback(() => {
    fetchAllPages<PrestationAchatResponse>('/api/prestations-achat')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const kpis = useMemo(() => {
    if (!stats) return null;
    return {
      total: stats.length,
      montant: stats.reduce((s, x) => s + (x.montantTTC ?? 0), 0),
      amorties: stats.filter((x) => x.estAmorti).length,
      aAmortir: stats.filter((x) => !x.estAmorti && x.eligibleAmortissement).length,
    };
  }, [stats]);

  useEffect(() => {
    dispatch(getAllPrestationsAchat({ pageNumber: 1, pageSize: 10, search }));
  }, [dispatch, search]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllPrestationsAchat({ pageNumber: 1, pageSize, search: value }));
  };

  const handleDelete = (item: PrestationAchatResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deletePrestationAchat(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const openAmortir = (item: PrestationAchatResponse) => {
    setAmortirItem(item);
    setDureeMois('12');
    setTaux('');
    setAmortirDialogOpen(true);
  };

  const confirmAmortir = () => {
    if (amortirItem) {
      dispatch(
        amortirPrestationAchat({
          id: amortirItem.numero,
          dureeMois: Number(dureeMois),
          taux: taux === '' ? null : Number(taux),
        }),
      );
      setAmortirItem(null);
      setAmortirDialogOpen(false);
    }
  };

  const columns: ColumnDef<PrestationAchatResponse>[] = [
    {
      accessorKey: 'numeroBonCommande',
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Bon' sorting />,
      cell: ({ row }) => row.original.numeroBonCommande ? <Chip className='font-mono'>{row.original.numeroBonCommande}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} />,
    },
    {
      accessorKey: 'nomTypologieCharge',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Typologie' />,
      cell: ({ row }) => row.original.nomTypologieCharge ? <Chip>{row.original.nomTypologieCharge}</Chip> : <span className='text-muted-foreground'>—</span>,
    },
    {
      accessorKey: 'prixUnitaireHT',
      header: () => <div className='text-right'>PU HT</div>,
      cell: ({ row }) => <MoneyCell value={row.original.prixUnitaireHT} />,
    },
    {
      accessorKey: 'quantite',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Qté' />,
      cell: ({ row }) => <div className='font-medium'>{row.original.quantite}</div>,
    },
    {
      accessorKey: 'montantTTC',
      header: () => <div className='text-right'>Montant TTC</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montantTTC} />,
    },
    {
      accessorKey: 'estAmorti',
      header: () => <div className='text-center'>Amortissement</div>,
      cell: ({ row }) => (
        <div className='flex justify-center'>
          {row.original.estAmorti ? (
            <span className='inline-block text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'>
              Amorti
            </span>
          ) : row.original.eligibleAmortissement ? (
            <Button variant='outline' size='sm' className='h-7 text-xs' onClick={() => openAmortir(row.original)}>
              <Calculator className='h-3.5 w-3.5 mr-1' />
              Amortir
            </Button>
          ) : (
            <span className='text-muted-foreground text-xs'>N/A</span>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Actions</div>,
      cell: ({ row }) => (
        <RowActions
          onEdit={() => {
            dispatch(setPrestationAchat(row.original));
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
    onPageChange: (newPage: number) => dispatch(getAllPrestationsAchat({ pageNumber: newPage + 1, pageSize, search })),
    onPageSizeChange: (newSize: number) =>
      dispatch(getAllPrestationsAchat({ pageNumber: 1, pageSize: newSize, search })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={ClipboardList}
            actions={<ImportMenu config={PRESTATIONS_ACHAT_IMPORT} onImported={() => dispatch(getAllPrestationsAchat({ pageNumber: 1, pageSize, search }))} />}
            title='Liste des prestations'
            description='Prestations rattachées aux bons de commande'
            buttons={[
              {
                label: 'Ajouter',
                icon: Plus,
                variant: 'default',
                onClick: () => {
                  dispatch(resetPrestationAchat());
                  navigate('ajouter');
                },
              },
            ]}
          />

          <KpiStrip>
            <KpiCard
              icon={ShoppingCart}
              label='Prestations'
              value={kpis ? String(kpis.total) : '—'}
              hint={'au total'}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={Banknote}
              label='Montant TTC'
              value={kpis ? `${fmtKpi(kpis.montant)} MAD` : '—'}
              hint={'toutes prestations'}
              tone={KPI_TONES.sky}
            />
            <KpiCard
              icon={CheckCircle2}
              label='Amorties'
              value={kpis ? String(kpis.amorties) : '—'}
              hint={'immobilisations amorties'}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={Calculator}
              label='À amortir'
              value={kpis ? String(kpis.aAmortir) : '—'}
              hint={'éligibles, pas encore amorties'}
              tone={KPI_TONES.amber}
            />
          </KpiStrip>
        </div>

        <DataTable
          columns={columns}
          data={allItems}
          searchableColumns={[{ id: 'nomBuilding', title: 'Actif' }]}
          onSearchChange={handleSearchChange}
          isLoading={loading}
          onRowDoubleClick={(item) => {
            dispatch(setPrestationAchat(item));
            navigate(`details/${item.numero}`);
          }}
          pagination={pagination}
        />

        <BaseDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description='Êtes-vous sûr de vouloir supprimer cette prestation ?'
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

        <BaseDialog
          open={amortirDialogOpen}
          onOpenChange={setAmortirDialogOpen}
          title='Amortir la prestation'
          description={`Renseignez les paramètres d'amortissement pour "${amortirItem?.nomTypologieCharge || ''}".`}
        >
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='dureeMois' className='text-sm font-medium'>
                Durée (mois)
              </Label>
              <Input
                id='dureeMois'
                type='number'
                value={dureeMois}
                onChange={(e) => setDureeMois(e.target.value)}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='taux' className='text-sm font-medium'>
                Taux (%)
              </Label>
              <Input id='taux' type='number' step='0.01' value={taux} onChange={(e) => setTaux(e.target.value)} />
            </div>
            <div className='flex justify-end gap-2'>
              <Button variant='outline' onClick={() => setAmortirDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={confirmAmortir}>Amortir</Button>
            </div>
          </div>
        </BaseDialog>
      </CardContent>
    </Card>
  );
};

export default PrestationsAchat;
