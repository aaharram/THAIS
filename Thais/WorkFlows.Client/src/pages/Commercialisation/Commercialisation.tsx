import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { Building, Handshake, LayoutDashboard, Search } from 'lucide-react';

const items = [
  {
    key: 'prospection',
    name: 'Prospection',
    icon: Search,
    link: '/commercialisation/prospection',
    description: 'Suivi des opportunités de prospection commerciale',
    enabled: true,
  },
  {
    key: 'cession',
    name: 'Cession',
    icon: Handshake,
    link: '/commercialisation/cession',
    description: 'Gestion des dossiers de cession',
    enabled: true,
  },
  {
    key: 'locaux-vacant',
    name: 'Locaux Vacant',
    icon: Building,
    link: '/commercialisation/locaux-vacant',
    description: 'Suivi des locaux vacants',
    enabled: true,
  },
];

const Commercialisation = () => {

  return (
    <div className='space-y-4'>
      <Title
        icon={LayoutDashboard}
        title='Commercialisation'
        description='Prospection, cession et suivi des locaux vacants'
      />

      <HubCardGrid items={items} />
    </div>
  );
};

export default Commercialisation;
