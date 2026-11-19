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
import { getAllBuildings } from '@/store/features/patrimoine/buildingsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Building2, Network } from 'lucide-react';
import { useEffect, useState } from 'react';

const AssetManagement = () => {
  const dispatch = useAppDispatch();
  const { totalCount } = useAppSelector((state) => state.buildings);
  const { actifs } = useAppSelector((state) => state.dashboard);
  const [noBuilding, setNoBuilding] = useState<string>('0');

  // Liste des actifs du menu déroulant.
  useEffect(() => {
    dispatch(getDashboardActifs({}));
  }, [dispatch]);

  useEffect(() => {
    dispatch(
      getAllBuildings({
        pageNumber: 1,
        pageSize: 1,
        filters: {
          ...(noBuilding !== '0' ? { Numero: [Number(noBuilding)] } : {}),
        },
      }),
    );
  }, [dispatch, noBuilding]);

  const items = [
    {
      key: 'actifs',
      name: `${totalCount} ${totalCount > 1 ? 'Actifs' : 'Actif'}`,
      icon: Building2,
      link: noBuilding !== '0' ? `/patrimoine/actifs?actif=${noBuilding}` : '/patrimoine/actifs',
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
      </div>

      <HubCardGrid items={items} />
    </div>
  );
};

export default AssetManagement;
