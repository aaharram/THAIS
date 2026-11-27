import { BaseDialog } from '@/components/dialog/dialog';
import { fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import {
  ActionButton,
  AvatarCell,
  Chip,
  daysFromToday,
  fmtDate,
  fmtMoney,
  IconTile,
  KPI_TONES,
  KpiCard,
  KpiStrip,
  MoneyCell,
  RowActions,
  StatusPill,
  Tone,
} from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { FactureResponse } from '@/store/features/leasing/facture-schemas';
import {
  deleteFacture,
  demanderAnnulationFacture,
  getAllFactures,
  telechargerFacturePdf,
} from '@/store/features/leasing/facturesSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Ban, CheckCircle2, FileClock, FileDown, Plus, Wallet } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';

const ETAT_TONE: Record<string, Tone> = {
  Payée: 'success',
  'Partiellement payée': 'info',
  Annulée: 'danger',
};

// Facture à régler dont l'échéance est dépassée.
const estEnRetard = (f: FactureResponse) =>
  (f.etat === 'Impayée' || f.etat === 'Partiellement payée') && !f.demandeAnnulation && (daysFromToday(f.dateEcheance) ?? 0) < 0;

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const ANNEES = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + 1 - i);

const FiltreSelect = ({
  value,
  onChange,
  placeholder,
  width,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  width: string;
  children: React.ReactNode;
}) => (
  <div className={width}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='h-10 rounded-lg bg-card'>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  </div>
);

const Factures = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { allItems, totalCount, pageNumber, pageSize, loading } = useAppSelector((state) => state.factures);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FactureResponse | null>(null);
  const [search, setSearch] = useState('');
  // RMANew (ListFacture) : filtres Filiale / Année / Mois.
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [noProprietaire, setNoProprietaire] = useState('0');
  const [annee, setAnnee] = useState('0');
  const [mois, setMois] = useState('0');
  const filters = useMemo(() => {
    const f: Record<string, number[]> = {};
    if (noProprietaire !== '0') f.NoProprietaire = [Number(noProprietaire)];
    if (annee !== '0') f.Annee = [Number(annee)];
    if (mois !== '0') f.Mois = [Number(mois)];
    return f;
  }, [noProprietaire, annee, mois]);
  // Toutes les factures (hors pagination) pour le bandeau de synthèse.
  const [stats, setStats] = useState<FactureResponse[] | null>(null);

  const loadStats = useCallback(() => {
    fetchAllPages<FactureResponse>('/api/factures')
      .then(setStats)
      .catch(() => setStats([]));
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(getAllFactures({ pageNumber: 1, pageSize: 10, search, filters }));
  }, [dispatch, search, filters]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    dispatch(getAllFactures({ pageNumber: 1, pageSize, search: value, filters }));
  };

  const handleDelete = (item: FactureResponse) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedItem) {
      dispatch(deleteFacture(selectedItem.numero)).then(() => loadStats());
      setSelectedItem(null);
      setDeleteDialogOpen(false);
    }
  };

  const kpis = useMemo(() => {
    if (!stats) return null;
    const valides = stats.filter((f) => f.etat !== 'Annulée');
    const payees = valides.filter((f) => f.etat === 'Payée');
    const aRegler = valides.filter((f) => f.etat === 'Impayée' || f.etat === 'Partiellement payée');
    const enRetard = stats.filter(estEnRetard);
    return {
      total: valides.length,
      facture: valides.reduce((s, f) => s + f.montant, 0),
      payees: payees.length,
      encaisse: payees.reduce((s, f) => s + f.montant, 0),
      aRegler: aRegler.reduce((s, f) => s + f.montant, 0),
      nbARegler: aRegler.length,
      enRetard: enRetard.length,
      montantRetard: enRetard.reduce((s, f) => s + f.montant, 0),
    };
  }, [stats]);

  // Colonnes de RMANew (ListFacture) : Référence de Facture, N° Facture, Locataire, Actif, Local, Montant (TC/CC),
  // Avis d'échéance / Quittance, Date de début, Date de fin, Etat, Type, Détails.
  const debutPeriode = (periode: string) => {
    const d = new Date(periode);
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  };
  const finPeriode = (periode: string) => {
    const d = new Date(periode);
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString();
  };

  const columns: ColumnDef<FactureResponse>[] = [
    {
      accessorKey: 'reference',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Référence de Facture' sorting />,
      cell: ({ row }) => <span className='whitespace-nowrap font-medium'>{row.original.reference || '—'}</span>,
    },
    {
      id: 'numero',
      accessorFn: (row) => String(row.numero),
      header: ({ column }) => <DataTableColumnHeader column={column} title='N° Facture' />,
      cell: ({ row }) => <span className='font-medium'>{row.original.numero}</span>,
    },
    {
      accessorKey: 'nomLocataire',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Locataire' sorting />,
      cell: ({ row }) => (
        <AvatarCell
          name={row.original.nomLocataire}
          secondary={row.original.numContratLocations ? `Contrat ${row.original.numContratLocations}` : null}
        />
      ),
    },
    {
      accessorKey: 'nomBuilding',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Actif' />,
      cell: ({ row }) => <span className='font-medium'>{row.original.nomBuilding || '—'}</span>,
    },
    {
      accessorKey: 'nomLocal',
      header: ({ column }) => <DataTableColumnHeader column={column} title='Local' />,
      cell: ({ row }) => <span>{row.original.nomLocal || '—'}</span>,
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Montant (MAD) (TC/CC)</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant} />,
    },
    {
      id: 'avis',
      header: () => <div className='text-center'>Avis d'échéance / Quittance</div>,
      cell: ({ row }) => (
        <IconTile
          icon={FileDown}
          label="Télécharger l'avis d'échéance / quittance (PDF)"
          onClick={() =>
            dispatch(telechargerFacturePdf({ id: row.original.numero, nomLocataire: row.original.nomLocataire }))
          }
        />
      ),
    },
    {
      id: 'dateDebut',
      accessorFn: (row) => fmtDate(debutPeriode(row.periode)),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date de début' />,
      cell: ({ row }) => (
        <span className='whitespace-nowrap'>{fmtDate(debutPeriode(row.original.periode)) || '—'}</span>
      ),
    },
    {
      id: 'dateFin',
      accessorFn: (row) => fmtDate(finPeriode(row.periode)),
      header: ({ column }) => <DataTableColumnHeader column={column} title='Date de fin' />,
      cell: ({ row }) => <span className='whitespace-nowrap'>{fmtDate(finPeriode(row.original.periode)) || '—'}</span>,
    },
    {
      id: 'etat',
      // Le filtre cherche dans ce qui est affiché (le badge affiche « Demande d'annulation » tant que
      // l'annulation n'est pas confirmée).
      accessorFn: (row) => (row.demandeAnnulation ? "Demande d'annulation" : row.etat),
      header: () => <div>Etat</div>,
      cell: ({ row }) => {
        const f = row.original;
        if (f.demandeAnnulation) return <StatusPill label="Demande d'annulation" tone='warning' />;
        const retard = estEnRetard(f) ? Math.abs(daysFromToday(f.dateEcheance) ?? 0) : 0;
        return (
          <div className='space-y-0.5'>
            <StatusPill label={f.etat} tone={estEnRetard(f) ? 'danger' : (ETAT_TONE[f.etat] ?? 'warning')} />
            {retard > 0 && (
              <div className='whitespace-nowrap text-xs text-red-600 dark:text-red-400'>En retard de {retard} j</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'typeFacture',
      header: ({ column }) => <DataTableColumnHeader column={column} title="Type Avis d'échéance" />,
      cell: ({ row }) => <Chip>{row.original.typeFacture}</Chip>,
    },
    {
      id: 'actions',
      size: 110,
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => {
        const f = row.original;
        const modifiable = f.etat === 'Impayée' && !f.demandeAnnulation;
        return (
          <RowActions
            extra={
              modifiable ? (
                <ActionButton
                  icon={Ban}
                  label="Demander l'annulation"
                  onClick={() => dispatch(demanderAnnulationFacture(f.numero))}
                  className='text-orange-600 hover:bg-orange-500/10 hover:text-orange-600'
                />
              ) : undefined
            }
            onDelete={modifiable ? () => handleDelete(f) : undefined}
          />
        );
      },
    },
  ];

  const pagination = {
    pageIndex: pageNumber - 1,
    pageSize,
    onPageChange: (newPage: number) => dispatch(getAllFactures({ pageNumber: newPage + 1, pageSize, search, filters })),
    onPageSizeChange: (newSize: number) => dispatch(getAllFactures({ pageNumber: 1, pageSize: newSize, search, filters })),
    totalCount,
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={FileClock}
            title="Avis d'échéance / Facture"
            description='Génération et suivi des factures de loyer'
            actions={
              <>
                <FiltreSelect value={noProprietaire} onChange={setNoProprietaire} placeholder='Toutes les filiales' width='w-48'>
                  <SelectItem value='0'>Toutes les filiales</SelectItem>
                  {proprietaires.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </FiltreSelect>
                <FiltreSelect value={annee} onChange={setAnnee} placeholder='Année' width='w-44'>
                  <SelectItem value='0'>Toutes les années</SelectItem>
                  {ANNEES.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </FiltreSelect>
                <FiltreSelect value={mois} onChange={setMois} placeholder='Mois' width='w-36'>
                  <SelectItem value='0'>Tous les mois</SelectItem>
                  {MOIS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </FiltreSelect>
              </>
            }
            buttons={[
              {
                label: 'Générer une facture',
                icon: Plus,
                variant: 'default',
                onClick: () => navigate('ajouter'),
              },
            ]}
          />

          <KpiStrip>
            <KpiCard
              icon={FileClock}
              label='Facturé'
              value={kpis ? `${fmtMoney(kpis.facture)} MAD` : '—'}
              hint={kpis ? `${kpis.total} facture(s) hors annulées` : undefined}
              tone={KPI_TONES.primary}
            />
            <KpiCard
              icon={CheckCircle2}
              label='Encaissé'
              value={kpis ? `${fmtMoney(kpis.encaisse)} MAD` : '—'}
              hint={kpis ? `${kpis.payees} facture(s) payée(s)` : undefined}
              tone={KPI_TONES.green}
            />
            <KpiCard
              icon={Wallet}
              label='Reste à régler'
              value={kpis ? `${fmtMoney(kpis.aRegler)} MAD` : '—'}
              hint={kpis ? `${kpis.nbARegler} facture(s) ouverte(s)` : undefined}
              tone={KPI_TONES.amber}
            />
            <KpiCard
              icon={AlertTriangle}
              label='En retard'
              value={kpis ? String(kpis.enRetard) : '—'}
              hint={kpis ? `${fmtMoney(kpis.montantRetard)} MAD échus` : undefined}
              tone={KPI_TONES.red}
            />
          </KpiStrip>
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
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title='Confirmer la suppression'
          description={`Êtes-vous sûr de vouloir supprimer cette facture de "${selectedItem?.nomLocataire || ''}" ?`}
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

export default Factures;
