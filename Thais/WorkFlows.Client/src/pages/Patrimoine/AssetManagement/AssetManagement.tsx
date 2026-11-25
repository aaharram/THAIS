import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { lookupModules } from '@/store/features/configuration/lookupModules';
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Building2, Network } from 'lucide-react';
import { useEffect, useState } from 'react';

const AssetManagement = () => {
  const dispatch = useAppDispatch();
  const { totalCount } = useAppSelector((state) => state.buildings);
  const { allItems: proprietaires } = useAppSelector((state) => state.cfgProprietaires);
  const [noProprietaire, setNoProprietaire] = useState<string>('0');

  useEffect(() => {
    dispatch(lookupModules.cfgProprietaires.getAll({ pageSize: 1000 }));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAllBuildings({
        pageNumber: 1,
        pageSize: 1,
        filters: {
          ...(noProprietaire !== '0' ? { NoProprietaire: [Number(noProprietaire)] } : {}),
        },
      }),
    );
  }, [dispatch, noProprietaire]);

  const changeProprietaire = (v: string) => {
    setNoProprietaire(v);
  };

  const items = [
    {
      key: 'actifs',
      name: `${totalCount} ${totalCount > 1 ? 'Actifs' : 'Actif'}`,
      icon: Building2,
      link: '/patrimoine/actifs',
      description: 'Voir tous les actifs et biens',
      enabled: true,
    },
  ];

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] sm:items-center gap-4'>
        <Title
          icon={Network}
          title='Asset Management'
          description='Valorisation et suivi du patrimoine immobilier'
        />
        <div className='flex flex-col sm:flex-row justify-center gap-3'>
          <div className='w-full sm:w-64'>
            <Select value={noProprietaire} onValueChange={changeProprietaire}>
              <SelectTrigger>
                <SelectValue placeholder='Tous les sites' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='0'>Tous les sites</SelectItem>
                {proprietaires.map((p) => (
                  <SelectItem key={p.numero} value={p.numero.toString()}>
                    {p.designation}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <HubCardGrid items={items} />
    </div>
  );
};

export default AssetManagement;
