import { ExportMenu, fetchAllPages } from '@/components/export/export-menu';
import { DataTable } from '@/components/table/data-table';
import { DataTableColumnHeader } from '@/components/table/data-table-column-header';
import { AvatarCell, MoneyCell, PrimarySecondary, StatusPill } from '@/components/table/list-cells';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Title } from '@/components/ui/title';
import { AppDispatch } from '@/store';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { BailResponse } from '@/store/features/leasing/bail-schemas';
import { genererFacture, getAllFactures } from '@/store/features/leasing/facturesSlice';
import { useAppSelector } from '@/store/hooks';
import { ColumnDef } from '@tanstack/react-table';
import { PenLine } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

const moisCourant = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

interface Actif {
  numero: number;
  noProprietaire?: number | null;
}

// RMANew (ListLocatairesGestionQuittance.aspx + DataEntryQuittance.vb) : liste Locataire / Actif / Loyer mensuel TTC,
// filtrée par filiale, exportable en PDF et Excel. À la différence d'"Avis d'échéance/Facture" qui liste les
// factures déjà émises, cet écran liste les baux actifs pour balayer une période et générer en un clic celles qui
// manquent - le même moteur de génération que "Générer une facture", juste une entrée différente.
const FacturationManuelle = () => {
  const dispatch = useDispatch<AppDispatch>();
  const userId = useAppSelector((state) => state.auth.auth!.id);
  const { allItems: factures } = useAppSelector((state) => state.factures);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [baux, setBaux] = useState<BailResponse[]>([]);
  const [actifs, setActifs] = useState<Actif[]>([]);
  const [loading, setLoading] = useState(true);
  const [noProprietaire, setNoProprietaire] = useState('0');
  const [periodeMois, setPeriodeMois] = useState(moisCourant());
  const [generatingId, setGeneratingId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(getAllFactures({ pageNumber: 1, pageSize: 100 }));
    fetchAllPages<BailResponse>('/api/baux')
      .then(setBaux)
      .catch(() => setBaux([]))
      .finally(() => setLoading(false));
    fetchAllPages<Actif>('/api/buildings')
      .then(setActifs)
      .catch(() => setActifs([]));
  }, [dispatch]);

  const periodeDate = `${periodeMois}-01`;

  // Les factures de la période choisie (chargées pour la période, pas toute la table).
  const [facturesPeriode, setFacturesPeriode] = useState<Set<number>>(new Set());
  useEffect(() => {
    const [annee, mois] = periodeMois.split('-').map(Number);
    fetchAllPages<{ noLocation: number; etat: string }>('/api/factures', undefined, { Annee: [annee], Mois: [mois] })
      .then((rows) => setFacturesPeriode(new Set(rows.filter((f) => f.etat !== 'Annulée').map((f) => f.noLocation))))
      .catch(() => setFacturesPeriode(new Set()));
  }, [periodeMois, factures.length]);

  const baux_filtres = useMemo(() => {
    if (noProprietaire === '0') return baux;
    const ids = new Set(actifs.filter((a) => String(a.noProprietaire ?? '') === noProprietaire).map((a) => a.numero));
    return baux.filter((b) => ids.has(b.noBuilding));
  }, [baux, actifs, noProprietaire]);

  const handleGenerer = async (bail: BailResponse) => {
    setGeneratingId(bail.numero);
    try {
      await dispatch(
        genererFacture({
          addUser: userId,
          noLocation: bail.numero,
          periode: periodeDate,
          loyerNet: bail.loyerNet ?? null,
          charges: bail.charges ?? null,
          tva: bail.tva ?? null,
          taxe: bail.taxe ?? null,
          autres: bail.autres ?? null,
        }),
      ).unwrap();
      setFacturesPeriode((prev) => new Set(prev).add(bail.numero));
      dispatch(getAllFactures({ pageNumber: 1, pageSize: 100 }));
    } catch {
      // l'erreur est déjà remontée via le toast du thunk
    } finally {
      setGeneratingId(null);
    }
  };

  // Colonnes de RMANew : Locataire, Actif, Loyer mensuel TTC, Détails (ici : statut de la période + génération).
  const columns: ColumnDef<BailResponse>[] = [
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
      cell: ({ row }) => <PrimarySecondary primary={row.original.nomBuilding} secondary={row.original.nomLocal} />,
    },
    {
      accessorKey: 'montant',
      header: () => <div className='text-right'>Loyer mensuel TTC</div>,
      cell: ({ row }) => <MoneyCell value={row.original.montant ?? 0} />,
    },
    {
      id: 'statut',
      accessorFn: (row) => (facturesPeriode.has(row.numero) ? 'Facture générée' : 'À générer'),
      header: () => <div>Statut période</div>,
      cell: ({ row }) => {
        const dejaGeneree = facturesPeriode.has(row.original.numero);
        return <StatusPill label={dejaGeneree ? 'Facture générée' : 'À générer'} tone={dejaGeneree ? 'success' : 'warning'} />;
      },
    },
    {
      id: 'actions',
      header: () => <div className='text-right'>Détails</div>,
      cell: ({ row }) => {
        const dejaGeneree = facturesPeriode.has(row.original.numero);
        return (
          <div className='flex justify-end'>
            <Button
              size='sm'
              disabled={dejaGeneree || generatingId === row.original.numero}
              onClick={(e) => {
                e.stopPropagation();
                handleGenerer(row.original);
              }}
            >
              {generatingId === row.original.numero ? 'Génération...' : 'Générer'}
            </Button>
          </div>
        );
      },
    },
  ];

  const getRows = async () =>
    baux_filtres.map((b) => [
      b.nomLocataire ?? '',
      [b.nomBuilding, b.nomLocal].filter(Boolean).join(' - '),
      (b.montant ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    ]);

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={PenLine}
            title='Facturation Manuelle'
            description='Émettre une facture par locataire pour une période choisie'
            actions={
              <>
                <div className='w-48'>
                  <Select value={noProprietaire} onValueChange={setNoProprietaire}>
                    <SelectTrigger className='h-10 rounded-lg bg-card'>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='0'>Toutes les filiales</SelectItem>
                      {proprietaires.map((p) => (
                        <SelectItem key={p.numero} value={p.numero.toString()}>
                          {p.designation}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type='month'
                  aria-label='Période à facturer'
                  title='Période à facturer'
                  value={periodeMois}
                  onChange={(e) => e.target.value && setPeriodeMois(e.target.value)}
                  className='h-10 w-44 rounded-lg bg-card'
                />
                <ExportMenu
                  fileName='Facturation-Manuelle'
                  pdfTitle='Facturation manuelle'
                  header={['Locataire', 'Actif', 'Loyer mensuel TTC']}
                  getRows={getRows}
                />
              </>
            }
          />
        </div>

        <DataTable
          columns={columns}
          data={baux_filtres}
          searchableColumns={[{ id: 'nomLocataire', title: 'Locataire' }]}
          isLoading={loading}
        />
      </CardContent>
    </Card>
  );
};

export default FacturationManuelle;
