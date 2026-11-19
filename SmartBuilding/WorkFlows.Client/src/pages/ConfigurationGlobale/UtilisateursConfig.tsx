import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { UserPlus } from 'lucide-react';

const items = [
  {
    name: 'Membres',
    icon: UserPlus,
    link: '/configuration-globale/utilisateurs/membres',
    description: 'Gestion des comptes membres',
  },
];

const UtilisateursConfig = () => {

  return (
    <div className='space-y-4'>
      <Title title='Utilisateurs' description='Gérer les utilisateurs et leurs profils' />
      <HubCardGrid items={items} />
    </div>
  );
};

export default UtilisateursConfig;
