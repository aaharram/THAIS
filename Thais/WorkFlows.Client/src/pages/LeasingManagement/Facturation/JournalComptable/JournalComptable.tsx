import { ExportMenu, fetchAllPages } from '@/components/export/export-menu';
import { fmtMoney } from '@/components/table/list-cells';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { FactureResponse } from '@/store/features/leasing/facture-schemas';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { BookOpen, Building2, Inbox } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

const MOIS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const ANNEES = Array.from({ length: 8 }, (_, i) => new Date().getFullYear() + 1 - i);

const FiltreSelect = ({
  value,
  onChange,
  width,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  width: string;
  children: React.ReactNode;
}) => (
  <div className={width}>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className='h-10 rounded-lg bg-card'>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  </div>
);

interface Actif {
  numero: number;
  designation: string;
  noProprietaire?: number | null;
}

const n = (v?: number | null) => v ?? 0;
const HEADERS = ['N° Locataire', 'Locataire', 'Cpte Général', 'Etage', 'App N°', 'Loyer', 'Charges', 'Taxe', 'TVA', 'Autres charges', 'Total Mois'];
const NUM_COLS = new Set([5, 6, 7, 8, 9, 10]);

// RMANew (JournalLoyer.aspx) : journal du mois, regroupé par actif — N° locataire, locataire, compte général, étage,
// n° d'appartement, loyer, charges, taxe, TVA, autres charges, total du mois ; total par actif puis total général.
// La génération des loyers et la validation du journal ne sont pas reprises ici.
const JournalComptable = () => {
  const dispatch = useAppDispatch();
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const today = new Date();
  const [noProprietaire, setNoProprietaire] = useState('0');
  const [noBuilding, setNoBuilding] = useState('0');
  const [annee, setAnnee] = useState(String(today.getFullYear()));
  const [mois, setMois] = useState(String(today.getMonth() + 1));
  const [actifs, setActifs] = useState<Actif[]>([]);
  const [items, setItems] = useState<FactureResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    fetchAllPages<Actif>('/api/buildings')
      .then(setActifs)
      .catch(() => setActifs([]));
  }, [dispatch]);

  const filters = useMemo(() => {
    const f: Record<string, number[]> = { Annee: [Number(annee)], Mois: [Number(mois)] };
    if (noProprietaire !== '0') f.NoProprietaire = [Number(noProprietaire)];
    if (noBuilding !== '0') f.NoBuilding = [Number(noBuilding)];
    return f;
  }, [annee, mois, noProprietaire, noBuilding]);

  useEffect(() => {
    let annule = false;
    setLoading(true);
    fetchAllPages<FactureResponse>('/api/factures', undefined, filters)
      .then((rows) => {
        if (!annule) setItems(rows.filter((f) => f.etat !== 'Annulée'));
      })
      .catch(() => {
        if (!annule) setItems([]);
      })
      .finally(() => {
        if (!annule) setLoading(false);
      });
    return () => {
      annule = true;
    };
  }, [filters]);

  const actifsFiltres = useMemo(
    () => actifs.filter((a) => noProprietaire === '0' || String(a.noProprietaire ?? '') === noProprietaire),
    [actifs, noProprietaire],
  );

  // Regroupement par actif (dans l'ordre alphabétique, comme RMANew : order by Building.designation).
  const groupes = useMemo(() => {
    const map = new Map<string, FactureResponse[]>();
    items.forEach((f) => {
      const k = f.nomBuilding || '—';
      map.set(k, [...(map.get(k) ?? []), f]);
    });
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b, 'fr'))
      .map(([nom, rows]) => ({
        nom,
        compte: rows[0]?.compteGeneral ?? '',
        rows: [...rows].sort((a, b) => (a.nomLocataire ?? '').localeCompare(b.nomLocataire ?? '', 'fr')),
        total: rows.reduce((s, f) => s + f.montant, 0),
      }));
  }, [items]);

  const totalGeneral = groupes.reduce((s, g) => s + g.total, 0);
  const periodeLabel = `${MOIS[Number(mois) - 1]} ${annee}`;

  const ligne = (f: FactureResponse): string[] => [
    f.codeLocataire ?? '',
    f.nomLocataire ?? '',
    f.compteGeneral ?? '',
    f.etage ?? '',
    f.nomLocal ?? '',
    ...[f.loyerNet, f.charges, f.taxe, f.tva, f.autres, f.montant].map((v) => fmtMoney(n(v))),
  ];

  const getRows = async () => {
    const rows: string[][] = [];
    groupes.forEach((g) => {
      g.rows.forEach((f) => rows.push([g.nom, ...ligne(f)]));
      rows.push([g.nom, 'Total par Actif', '', '', '', '', '', '', '', '', '', fmtMoney(g.total)]);
    });
    rows.push(['', 'Total général', '', '', '', '', '', '', '', '', '', fmtMoney(totalGeneral)]);
    return rows;
  };

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='space-y-4'>
          <Title
            icon={BookOpen}
            title='Journal Comptable'
            description={`Journal des loyers de ${periodeLabel}, par actif`}
            actions={
              <>
                <FiltreSelect value={noProprietaire} onChange={(v) => { setNoProprietaire(v); setNoBuilding('0'); }} width='w-48'>
                  <SelectItem value='0'>Toutes les filiales</SelectItem>
                  {proprietaires.map((p) => (
                    <SelectItem key={p.numero} value={p.numero.toString()}>
                      {p.designation}
                    </SelectItem>
                  ))}
                </FiltreSelect>
                <FiltreSelect value={noBuilding} onChange={setNoBuilding} width='w-52'>
                  <SelectItem value='0'>Tous les actifs</SelectItem>
                  {actifsFiltres.map((a) => (
                    <SelectItem key={a.numero} value={a.numero.toString()}>
                      {a.designation}
                    </SelectItem>
                  ))}
                </FiltreSelect>
                <FiltreSelect value={mois} onChange={setMois} width='w-36'>
                  {MOIS.map((m, i) => (
                    <SelectItem key={m} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </FiltreSelect>
                <FiltreSelect value={annee} onChange={setAnnee} width='w-28'>
                  {ANNEES.map((y) => (
                    <SelectItem key={y} value={String(y)}>
                      {y}
                    </SelectItem>
                  ))}
                </FiltreSelect>
                <ExportMenu
                  fileName={`Journal-Loyer-${annee}-${mois.padStart(2, '0')}`}
                  pdfTitle={`Journal Loyer ${periodeLabel}`}
                  header={['Actif', ...HEADERS]}
                  getRows={getRows}
                />
              </>
            }
          />
        </div>

        <div className='mt-4 space-y-5'>
          {loading ? (
            <div className='space-y-3'>
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className='h-24 w-full rounded-xl' />
              ))}
            </div>
          ) : groupes.length === 0 ? (
            <div className='flex flex-col items-center gap-2 rounded-xl border bg-card py-14 text-muted-foreground'>
              <Inbox className='h-8 w-8' />
              <p className='text-sm font-medium'>Aucun loyer pour {periodeLabel}</p>
            </div>
          ) : (
            <>
              {groupes.map((g) => (
                <div key={g.nom} className='overflow-hidden rounded-xl border bg-card shadow-sm'>
                  <div className='flex items-center gap-3 border-b bg-primary/5 px-4 py-3'>
                    <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary'>
                      <Building2 className='h-4 w-4' />
                    </span>
                    <span className='font-semibold'>{g.nom}</span>
                    {g.compte && (
                      <span className='rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary'>
                        Cpte {g.compte}
                      </span>
                    )}
                    <span className='ml-auto text-xs text-muted-foreground'>{g.rows.length} loyer(s)</span>
                  </div>
                  <div className='overflow-x-auto'>
                    <table className='w-full text-sm'>
                      <thead>
                        <tr className='border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground'>
                          {HEADERS.map((h, i) => (
                            <th key={h} className={`whitespace-nowrap px-3 py-2 font-semibold ${NUM_COLS.has(i) ? 'text-right' : ''}`}>
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {g.rows.map((f) => (
                          <tr key={f.numero} className='border-b last:border-0 hover:bg-muted/30'>
                            {ligne(f).map((c, i) => (
                              <td
                                key={i}
                                className={`px-3 py-2 ${NUM_COLS.has(i) ? 'text-right tabular-nums' : ''} ${i === 10 ? 'font-semibold' : ''}`}
                              >
                                {c || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className='flex justify-end border-t bg-muted/30 px-4 py-2.5'>
                    <span className='rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary'>
                      Total par Actif : {fmtMoney(g.total)}
                    </span>
                  </div>
                </div>
              ))}
              <div className='flex justify-end'>
                <span className='rounded-full bg-primary px-4 py-1.5 text-sm font-semibold text-primary-foreground shadow-sm'>
                  Total général : {fmtMoney(totalGeneral)}
                </span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default JournalComptable;
