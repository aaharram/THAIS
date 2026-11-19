import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import {
  AlertTriangle,
  Banknote,
  Boxes,
  ClipboardList,
  Contact,
  FileText,
  Handshake,
  Landmark,
  MessageSquareWarning,
  Shield,
  Users,
  Wrench,
} from 'lucide-react';

const items = [
  {
    key: 'sinistres',
    name: 'Gestion des sinistres',
    icon: AlertTriangle,
    link: '/property-management/sinistres',
    description: 'Suivi des sinistres par actif',
    enabled: true,
  },
  {
    key: 'assurances',
    name: 'Assurances',
    icon: Shield,
    link: '/property-management/assurances',
    description: 'Gérer les polices d’assurance',
    enabled: true,
  },
  {
    key: 'bon-de-commande',
    name: 'Bon de Commande',
    icon: FileText,
    link: '/property-management/bon-de-commande',
    description: 'Achats et prestations',
    enabled: true,
  },
  {
    key: 'charges',
    name: 'Charges / Budgets',
    icon: Banknote,
    link: '/property-management/charges',
    description: 'Suivi des charges prévues et réelles',
    enabled: true,
  },
  {
    key: 'taxes',
    name: 'Taxes',
    icon: Landmark,
    link: '/property-management/taxes',
    description: 'Suivi des taxes par actif',
    enabled: true,
  },
  {
    key: 'liste-prestations',
    name: 'Liste des prestations',
    icon: ClipboardList,
    link: '/property-management/liste-prestations',
    description: 'Prestations rattachées aux bons de commande',
    enabled: true,
  },
  {
    key: 'reclamations',
    name: 'Suivi Réclamation',
    icon: MessageSquareWarning,
    link: '/property-management/reclamations',
    description: 'Réclamations des locataires',
    enabled: true,
  },
  {
    key: 'prestataire',
    name: 'Prestataire',
    icon: Handshake,
    link: '/property-management/prestataires',
    description: 'Registre des prestataires et contrats',
    enabled: true,
  },
  {
    key: 'immobilisation',
    name: 'Immobilisation en cours',
    icon: Boxes,
    link: '/property-management/liste-prestations',
    description: 'Prestations éligibles à amortir (classe comptable 2) - voir Liste des prestations',
    enabled: true,
  },
  {
    key: 'syndics',
    name: 'Gestion des syndics',
    icon: Users,
    link: '/property-management/syndics',
    description: 'Réunions de syndic par actif',
    enabled: true,
  },
  {
    key: 'membres-syndic',
    name: 'Membres du syndic',
    icon: Contact,
    link: '/property-management/membres-syndic',
    description: 'Registre des membres du bureau syndical',
    enabled: true,
  },
];

const PropertyManagement = () => {

  return (
    <div className='space-y-4'>
      <Title
        icon={Wrench}
        title='Property Management'
        description='Gestion des sinistres, assurances, charges, taxes et prestataires'
      />

      <HubCardGrid items={items} />
    </div>
  );
};

export default PropertyManagement;
