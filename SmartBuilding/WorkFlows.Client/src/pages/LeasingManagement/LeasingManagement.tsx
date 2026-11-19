import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { getDashboardActifs } from '@/store/features/dashboard/dashboardSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  FileSignature,
  FileText,
  HandCoins,
  KeyRound,
  Receipt,
  TrendingUp,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

const baseItems = [
  {
    key: 'contractualisation',
    name: 'Contractualisation',
    icon: FileSignature,
    link: '/leasing-management/contractualisation',
    description: 'Gérer les baux et contrats de location',
    enabled: true,
  },
  {
    key: 'locataires',
    name: 'Gestion des locataires',
    icon: Users,
    link: '/leasing-management/locataires',
    description: 'Suivi des locataires par actif',
    enabled: true,
  },
  {
    key: 'avoirs',
    name: 'Gestion des Avoirs',
    icon: Receipt,
    link: '/leasing-management/avoirs',
    description: 'Gérer les avoirs émis',
    enabled: true,
  },
  {
    key: 'facturation',
    name: 'Facturation',
    icon: FileText,
    link: '/leasing-management/facturation',
    description: 'Facturation des loyers et charges',
    enabled: true,
  },
  {
    key: 'recouvrement',
    name: 'Recouvrement',
    icon: HandCoins,
    link: '/leasing-management/recouvrement',
    description: 'Suivi des impayés et relances',
    enabled: true,
  },
  {
    key: 'revisions-loyers',
    name: 'Révisions loyers',
    icon: TrendingUp,
    link: '/leasing-management/revisions-loyers',
    description: 'Gérer les révisions de loyers',
    enabled: true,
  },
];

const LeasingManagement = () => {
  const dispatch = useAppDispatch();
  const { actifs } = useAppSelector((state) => state.dashboard);
  const [noBuilding, setNoBuilding] = useState<string>('0');

  useEffect(() => {
    dispatch(getDashboardActifs({}));
  }, [dispatch]);

  // Un actif choisi est transmis aux listes ouvertes depuis les blocs (?building=).
  const items = baseItems.map((item) =>
    noBuilding !== '0' && (item.key === 'contractualisation' || item.key === 'locataires')
      ? { ...item, link: `${item.link}?building=${noBuilding}` }
      : item,
  );

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] sm:items-center gap-4'>
        <Title
          icon={KeyRound}
          title='Leasing Management'
          description='Contractualisation, facturation et recouvrement des loyers'
        />
        <div className='w-full sm:w-64'>
          <Select value={noBuilding} onValueChange={setNoBuilding}>
            <SelectTrigger>
              <SelectValue placeholder='Tous les actifs' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='0'>Tous les actifs</SelectItem>
              {actifs.map((b) => (
                <SelectItem key={b.numero} value={b.numero.toString()}>
                  {b.designation}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <HubCardGrid items={items} />
    </div>
  );
};

export default LeasingManagement;
