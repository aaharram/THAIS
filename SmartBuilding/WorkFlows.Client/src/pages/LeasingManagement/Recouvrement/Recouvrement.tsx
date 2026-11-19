import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import {
  CreditCard,
  Gavel,
  HandCoins,
  Receipt,
  RefreshCcw,
  Search,
  XCircle,
} from 'lucide-react';

// RMANew (ViewRecouvrement.aspx) : 7 blocs, tous repris côté Smart-Building. "Suivi
// Remises" (ListRemise.aspx) n'a que la liste/filtres/actions de masse - RMANew le peuple
// via un appel à l'API bancaire réelle de RMA (GetRemises(), clé en dur), non repris ici.
const items = [
  {
    key: 'paiement-client',
    name: 'Paiement Client',
    icon: CreditCard,
    link: '/leasing-management/recouvrement/paiement-client',
    description: 'Paiements reçus des locataires',
    enabled: true,
  },
  {
    key: 'encaissement',
    name: 'Encaissement',
    icon: HandCoins,
    link: '/leasing-management/recouvrement/encaissement',
    description: 'Gérer les encaissements',
    enabled: true,
  },
  {
    key: 'annulation-encaissement',
    name: 'Annulation Encaissement En cours',
    icon: RefreshCcw,
    link: '/leasing-management/recouvrement/annulation-encaissement',
    description: "Demandes d'annulation en cours",
    enabled: true,
  },
  {
    key: 'encaissements-annules',
    name: 'Encaissements annulés',
    icon: XCircle,
    link: '/leasing-management/recouvrement/encaissements-annules',
    description: 'Historique des encaissements annulés',
    enabled: true,
  },
  {
    key: 'suivi-remises',
    name: 'Suivi Remises',
    icon: Search,
    link: '/leasing-management/recouvrement/suivi-remises',
    description: 'Suivi des remises de chèques/effets',
    enabled: true,
  },
  {
    key: 'suivi-recouvrement',
    name: 'Suivi Recouvrement',
    icon: Receipt,
    link: '/leasing-management/recouvrement/suivi-recouvrement',
    description: 'Suivi des impayés et relances par bail',
    enabled: true,
  },
  {
    key: 'suivi-contentieux',
    name: 'Suivi Contentieux',
    icon: Gavel,
    link: '/leasing-management/recouvrement/suivi-contentieux',
    description: 'Suivi des dossiers contentieux',
    enabled: true,
  },
];

const Recouvrement = () => {

  return (
    <div className='space-y-4'>
      <Title icon={HandCoins} title='Recouvrement' description='Suivi des impayés et relances' />

      <HubCardGrid items={items} />
    </div>
  );
};

export default Recouvrement;
