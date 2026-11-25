import Loading from '@/components/loading/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { getDashboard, getDashboardActifs } from '@/store/features/dashboard/dashboardSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { SegmentedMeter } from './SegmentedMeter';
import { WindowsGrid } from './WindowsGrid';

const fmtMontant = (m: number) =>
  m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtEntier = (n: number) => n.toLocaleString('fr-FR');
const fmtPct = (p: number) => `${p.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;

/** Montant en grand : la partie entière domine, les centimes restent discrets. */
const Montant = ({ valeur, className = '' }: { valeur: number; className?: string }) => {
  const [entier, centimes] = fmtMontant(valeur).split(',');
  return (
    <span className={`font-display tabular-nums tracking-tight ${className}`}>
      {entier}
      <span className='text-[0.55em] text-muted-foreground'>,{centimes}</span>
    </span>
  );
};

/** Carte de chiffre clé : calme et lisible, pour laisser la façade être l'élément marquant de la page. */
const StatCard = ({ titre, valeur, unite, precision }: { titre: string; valeur: number; unite: string; precision?: ReactNode }) => (
  <div className='flex flex-col justify-between rounded-2xl border bg-card p-5'>
    <p className='text-sm font-medium text-muted-foreground'>{titre}</p>
    <div className='mt-4'>
      <Montant valeur={valeur} className='text-4xl font-semibold' />
      <p className='mt-1 text-sm text-muted-foreground'>{unite}</p>
      {precision && <p className='mt-3 border-t pt-3 text-sm text-foreground/80'>{precision}</p>}
    </div>
  </div>
);

/** Une ligne de la carte « flux » : intitulé, valeur, puis compteur à segments. */
const Flux = ({
  titre,
  detail,
  taux,
  couleur,
  max,
}: {
  titre: string;
  detail: ReactNode;
  taux: number;
  couleur?: string;
  max?: number;
}) => (
  <div>
    <div className='flex items-baseline justify-between gap-3'>
      <p className='text-sm font-medium'>{titre}</p>
      <p className='font-display text-2xl font-semibold tabular-nums tracking-tight'>{fmtPct(taux)}</p>
    </div>
    <div className='mt-2'>
      <SegmentedMeter value={taux} color={couleur} label={titre} max={max} />
    </div>
    <p className='mt-2 text-sm text-muted-foreground'>{detail}</p>
  </div>
);

const Dashboard = () => {
  const dispatch = useAppDispatch();

  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const { allItems: villes } = useAppSelector((state) => state.cfgVilles);
  const { allItems: typologies } = useAppSelector((state) => state.cfgTypologiesLot);
  const { item, actifs, loading } = useAppSelector((state) => state.dashboard);

  const [noProprietaire, setNoProprietaire] = useState(0);
  const [noCity, setNoCity] = useState(0);
  const [noLocalType, setNoLocalType] = useState(0);
  const [noBuilding, setNoBuilding] = useState(0);

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgVilles.getAll({ pageSize: 1000 }));
    dispatch(lookupModules.cfgTypologiesLot.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  // RMANew : la liste "Actifs" se recharge à chaque changement d'un des 3 autres filtres.
  useEffect(() => {
    dispatch(
      getDashboardActifs({
        noProprietaire: noProprietaire || undefined,
        noCity: noCity || undefined,
        noLocalType: noLocalType || undefined,
      }),
    );
  }, [dispatch, noProprietaire, noCity, noLocalType]);

  useEffect(() => {
    dispatch(
      getDashboard({
        noProprietaire: noProprietaire || undefined,
        noCity: noCity || undefined,
        noLocalType: noLocalType || undefined,
        noBuilding: noBuilding || undefined,
      }),
    );
  }, [dispatch, noProprietaire, noCity, noLocalType, noBuilding]);

  // Changer un des 3 premiers filtres peut sortir l'actif sélectionné du périmètre.
  const resetActif = () => setNoBuilding(0);

  const nbLocaux = item?.nbLocaux ?? 0;
  const nbActifs = item?.nbActifs ?? 0;
  const tauxOccupation = item?.tauxOccupation ?? 0;
  const locaux = item?.locaux ?? [];
  // Nombre réel de locaux occupés quand le détail est fourni, sinon déduit du taux.
  const occupes =
    locaux.length > 0 && locaux.length === nbLocaux
      ? locaux.filter((l) => l.occupe).length
      : Math.round((Math.max(0, Math.min(tauxOccupation, 100)) / 100) * nbLocaux);
  const vacants = Math.max(nbLocaux - occupes, 0);
  const loyerAnnuel = item?.loyerPrevisionnelAnnuel ?? 0;
  const budgetCharge = item?.budgetCharge ?? 0;
  const serie = item?.quittancesVsEncaisses ?? [];

  const totaux = useMemo(
    () => ({
      quittance: serie.reduce((s, m) => s + (m.quittance ?? 0), 0),
      encaisse: serie.reduce((s, m) => s + (m.encaisse ?? 0), 0),
    }),
    [serie],
  );

  const triggerClass = 'h-10 w-full rounded-lg sm:w-52';

  return (
    <div className='space-y-5'>
      {/* Périmètre */}
      <div className='flex flex-wrap items-center gap-3 rounded-2xl border bg-card p-3'>
        <Select
          value={noProprietaire.toString()}
          onValueChange={(v) => {
            setNoProprietaire(Number(v));
            resetActif();
          }}
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>Tous les Propriétaires</SelectItem>
            {proprietaires.map((p) => (
              <SelectItem key={p.numero} value={p.numero.toString()}>
                {p.designation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={noCity.toString()}
          onValueChange={(v) => {
            setNoCity(Number(v));
            resetActif();
          }}
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>Tous le Maroc</SelectItem>
            {villes.map((v) => (
              <SelectItem key={v.numero} value={v.numero.toString()}>
                {v.designation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={noLocalType.toString()}
          onValueChange={(v) => {
            setNoLocalType(Number(v));
            resetActif();
          }}
        >
          <SelectTrigger className={triggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>Tous les types</SelectItem>
            {typologies.map((t) => (
              <SelectItem key={t.numero} value={t.numero.toString()}>
                {t.designation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={noBuilding.toString()} onValueChange={(v) => setNoBuilding(Number(v))}>
          <SelectTrigger className={triggerClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='0'>Tous les Actifs</SelectItem>
            {actifs.map((a) => (
              <SelectItem key={a.numero} value={a.numero.toString()}>
                {a.designation}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && !item ? (
        <div className='flex h-64 items-center justify-center'>
          <Loading />
        </div>
      ) : (
        <>
          <div className='grid gap-5 lg:grid-cols-12'>
            {/* Patrimoine : la façade, un local = une fenêtre, allumée quand il est occupé */}
            <section
              className='relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white sm:p-8 lg:col-span-8'
              style={{ background: 'linear-gradient(135deg, hsl(var(--hero-from)), hsl(var(--hero-to)))' }}
            >
              {/* Trame d'architecte, à peine visible */}
              <div
                aria-hidden='true'
                className='pointer-events-none absolute inset-0 opacity-[0.06]'
                style={{
                  backgroundImage:
                    'linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)',
                  backgroundSize: '36px 36px',
                }}
              />
              <div className='relative grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]'>
                <div>
                  <p className='text-sm font-medium text-white/70'>Patrimoine géré</p>
                  <p className='font-display mt-3 text-7xl font-semibold leading-none tracking-tight tabular-nums sm:text-8xl'>
                    {fmtEntier(nbLocaux)}
                  </p>
                  <p className='mt-2 text-lg text-white/80'>
                    {nbLocaux > 1 ? 'locaux' : 'local'} dans {fmtEntier(nbActifs)} {nbActifs > 1 ? 'actifs' : 'actif'}
                  </p>

                  <div className='mt-8 border-t border-white/20 pt-6'>
                    <p className='font-display text-5xl font-semibold leading-none tracking-tight tabular-nums'>
                      {fmtPct(tauxOccupation)}
                    </p>
                    <p className='mt-2 text-base text-white/80'>d'occupation</p>
                    <p className='mt-1 text-sm text-white/60'>
                      {fmtEntier(occupes)} {occupes > 1 ? 'occupés' : 'occupé'}, {fmtEntier(vacants)}{' '}
                      {vacants > 1 ? 'vacants' : 'vacant'}
                    </p>
                  </div>
                </div>

                <WindowsGrid total={nbLocaux} occupied={occupes} locaux={locaux} />
              </div>
            </section>

            <div className='grid gap-5 lg:col-span-4'>
              <StatCard
                titre='Loyer prévisionnel annuel'
                valeur={loyerAnnuel}
                unite='MAD par an'
                precision={
                  <>
                    Soit <strong className='font-semibold'>{fmtMontant(loyerAnnuel / 12)}</strong> MAD par mois
                  </>
                }
              />
              <StatCard
                titre='Budget de charge'
                valeur={budgetCharge}
                unite='MAD par an'
                precision={
                  loyerAnnuel > 0 ? (
                    <>
                      Soit <strong className='font-semibold'>{fmtPct((budgetCharge / loyerAnnuel) * 100)}</strong> du loyer
                      prévisionnel
                    </>
                  ) : (
                    'Aucun loyer prévisionnel pour comparer'
                  )
                }
              />
            </div>
          </div>

          <div className='grid gap-5 lg:grid-cols-12'>
            {/* Quittancés vs encaissés */}
            <section className='rounded-2xl border bg-card p-5 lg:col-span-8'>
              <div className='flex flex-wrap items-start justify-between gap-4'>
                <div>
                  <h2 className='text-lg font-semibold'>Quittancés vs Encaissés</h2>
                  <p className='text-sm text-muted-foreground'>Six derniers mois</p>
                </div>
                <div className='flex gap-6'>
                  <div>
                    <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <span className='h-0.5 w-4 border-t-2 border-dashed border-primary/60' /> Quittancés
                    </p>
                    <Montant valeur={totaux.quittance} className='text-xl font-semibold' />
                  </div>
                  <div>
                    <p className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <span className='h-1 w-4 rounded-full bg-primary' /> Encaissés
                    </p>
                    <Montant valeur={totaux.encaisse} className='text-xl font-semibold' />
                  </div>
                </div>
              </div>

              <div className='mt-4'>
                <ResponsiveContainer width='100%' height={240}>
                  <AreaChart data={serie} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
                    <defs>
                      <linearGradient id='dash-encaisse' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='0%' stopColor='hsl(var(--primary))' stopOpacity={0.45} />
                        <stop offset='100%' stopColor='hsl(var(--primary))' stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} stroke='hsl(var(--border))' strokeDasharray='3 6' />
                    <XAxis
                      dataKey='libelle'
                      interval={0}
                      padding={{ left: 16, right: 16 }}
                      tickLine={false}
                      axisLine={false}
                      fontSize={12}
                      stroke='hsl(var(--muted-foreground))'
                    />
                    <YAxis hide domain={[0, 'auto']} />
                    <Tooltip
                      formatter={(v) => `${fmtMontant(Number(v ?? 0))} MAD`}
                      cursor={{ stroke: 'hsl(var(--primary))', strokeOpacity: 0.3 }}
                      labelStyle={{ fontSize: 12, fontWeight: 600 }}
                      contentStyle={{
                        fontSize: 12,
                        borderRadius: 12,
                        background: 'hsl(var(--popover))',
                        color: 'hsl(var(--popover-foreground))',
                        border: '1px solid hsl(var(--border))',
                      }}
                    />
                    <Area
                      type='monotone'
                      dataKey='quittance'
                      name='Quittancés'
                      stroke='hsl(var(--primary))'
                      strokeOpacity={0.6}
                      strokeWidth={2}
                      strokeDasharray='5 5'
                      fill='none'
                    />
                    <Area
                      type='monotone'
                      dataKey='encaisse'
                      name='Encaissés'
                      stroke='hsl(var(--primary))'
                      strokeWidth={3}
                      fill='url(#dash-encaisse)'
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* Flux : encaissements, décaissement, rendement */}
            <section className='flex flex-col justify-between gap-6 rounded-2xl border bg-card p-5 lg:col-span-4'>
              <Flux
                titre='Encaissements'
                taux={item?.tauxEncaissement ?? 0}
                detail={
                  <>
                    <strong className='font-semibold text-foreground'>{fmtMontant(item?.montantEncaissements ?? 0)}</strong>{' '}
                    MAD encaissés
                  </>
                }
              />
              <Flux
                titre='Décaissement'
                taux={item?.tauxDecaissement ?? 0}
                couleur='hsl(var(--foreground) / 0.55)'
                detail={
                  <>
                    <strong className='font-semibold text-foreground'>{fmtMontant(item?.montantDecaissement ?? 0)}</strong>{' '}
                    MAD décaissés
                  </>
                }
              />
              <Flux titre='Rendement' taux={item?.rendement ?? 0} max={20} detail='Compteur gradué de 0 à 20 %' />
            </section>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
