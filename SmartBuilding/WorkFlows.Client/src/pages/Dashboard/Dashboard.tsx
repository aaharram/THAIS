import { Card, CardContent } from '@/components/ui/card';
import Loading from '@/components/loading/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { getDashboard, getDashboardActifs } from '@/store/features/dashboard/dashboardSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  BarChart3,
  Briefcase,
  Building2,
  CreditCard,
  Home,
  Percent,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Gauge } from './Gauge';

const fmtMontant = (m: number) =>
  m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtEntier = (n: number) => n.toLocaleString('fr-FR');

const KpiCard = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Home;
  children: ReactNode;
}) => (
  <div className='rounded-xl border bg-card p-4 shadow-sm'>
    <div className='flex items-center justify-between'>
      <span className='rounded-md bg-muted/60 px-2.5 py-1 text-xs font-medium text-muted-foreground'>{title}</span>
      <span className='flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary'>
        <Icon className='h-4 w-4' />
      </span>
    </div>
    <div className='mt-4 flex min-h-24 items-center justify-center'>{children}</div>
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

  return (
    <Card>
      <CardContent className='p-4'>
        <div className='mb-4 flex flex-wrap items-center gap-3'>
          <Select
            value={noProprietaire.toString()}
            onValueChange={(v) => {
              setNoProprietaire(Number(v));
              resetActif();
            }}
          >
            <SelectTrigger className='h-10 w-56 rounded-full'>
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
            <SelectTrigger className='h-10 w-56 rounded-full'>
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
            <SelectTrigger className='h-10 w-56 rounded-full'>
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
            <SelectTrigger className='h-10 w-56 rounded-full'>
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
          <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <KpiCard title='Patrimoine Géré' icon={Home}>
              <div className='text-center text-2xl font-bold'>
                {fmtEntier(item?.nbActifs ?? 0)} Actifs / {fmtEntier(item?.nbLocaux ?? 0)} Locaux
              </div>
            </KpiCard>

            <KpiCard title='Loyer prévisionnel annuel' icon={Wallet}>
              <div className='text-center'>
                <div className='text-2xl font-bold'>{fmtMontant(item?.loyerPrevisionnelAnnuel ?? 0)}</div>
                <div className='text-xs text-muted-foreground'>MAD/an</div>
              </div>
            </KpiCard>

            <KpiCard title='Budget de charge' icon={Briefcase}>
              <div className='text-center'>
                <div className='text-2xl font-bold'>{fmtMontant(item?.budgetCharge ?? 0)}</div>
                <div className='text-xs text-muted-foreground'>MAD/an</div>
              </div>
            </KpiCard>

            <KpiCard title="Taux d'occupation" icon={Percent}>
              <Gauge value={item?.tauxOccupation ?? 0} />
            </KpiCard>

            <KpiCard title='Quittancés vs Encaissés' icon={BarChart3}>
              <ResponsiveContainer width='100%' height={110}>
                <BarChart data={item?.quittancesVsEncaisses ?? []} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                  <CartesianGrid vertical={false} stroke='#eee' />
                  <XAxis dataKey='libelle' tickLine={false} axisLine={false} fontSize={11} stroke='#6b7280' />
                  <Tooltip
                    formatter={(v) => `${fmtMontant(Number(v ?? 0))} MAD`}
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey='quittance' name='Quittancés' fill='#2f6fb0' radius={[2, 2, 0, 0]} />
                  <Bar dataKey='encaisse' name='Encaissés' fill='#0b1f3a' radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </KpiCard>

            <KpiCard title='Rendement' icon={TrendingUp}>
              <Gauge value={item?.rendement ?? 0} label={`${(item?.rendement ?? 0).toLocaleString('fr-FR')}%`} />
            </KpiCard>

            <KpiCard title='Encaissements' icon={CreditCard}>
              <div className='flex flex-col items-center gap-1'>
                <div className='text-sm font-semibold'>{fmtMontant(item?.montantEncaissements ?? 0)} MAD</div>
                <Gauge value={item?.tauxEncaissement ?? 0} size={86} />
              </div>
            </KpiCard>

            <KpiCard title='Décaissement' icon={Building2}>
              <div className='flex flex-col items-center gap-1'>
                <div className='text-sm font-semibold'>{fmtMontant(item?.montantDecaissement ?? 0)} MAD</div>
                <Gauge value={item?.tauxDecaissement ?? 0} size={86} />
              </div>
            </KpiCard>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default Dashboard;
