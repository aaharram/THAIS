import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import {
  Archive,
  Banknote,
  Building2,
  ClipboardList,
  FileSignature,
  FileX,
  Gavel,
  Home,
  Landmark,
  Receipt,
  Users,
} from 'lucide-react';

// RMANew (Archives.aspx) : hub de navigation pur, une tuile par entité archivée
// (Building.inactif=1, Local.inactif=1, etc.). "Actifs" est la seule implémentée
// pour l'instant - voir la comparaison ViewReporting vs Archives.
const items = [
  {
    key: 'actifs',
    name: 'Actifs',
    icon: Building2,
    link: '/archives/actifs',
    description: 'Actifs désactivés — consulter et réactiver',
    enabled: true,
  },
  {
    key: 'locaux',
    name: 'Locaux',
    icon: Home,
    link: '/archives/locaux',
    description: 'Locaux désactivés',
    enabled: true,
  },
  {
    key: 'locataires',
    name: 'Locataires',
    icon: Users,
    link: '/archives/locataires',
    description: 'Locataires désactivés',
    enabled: true,
  },
  {
    key: 'locations',
    name: 'Locations',
    icon: FileSignature,
    link: '/archives/locations',
    description: 'Baux résiliés / archivés',
    enabled: true,
  },
  {
    key: 'ventes',
    name: 'Ventes',
    icon: Landmark,
    link: '/archives/ventes',
    description: 'Actifs et locaux vendus',
    enabled: true,
  },
  {
    key: 'contentieux',
    name: 'Contentieux Hors Location',
    icon: Gavel,
    link: '/archives/contentieux-hors-location',
    description: 'Dossiers de contentieux pour locataires sans bail actif',
    enabled: true,
  },
  {
    // RMANew (ArchiveEncaissement.aspx) est un rapport d'encaissements filtrable par
    // mois/année/encaisseur - déjà couvert intégralement par la page Encaissement du
    // module Recouvrement (mêmes filtres + export), on y renvoie plutôt que dupliquer.
    key: 'encaissements',
    name: 'Encaissements',
    icon: Banknote,
    link: '/leasing-management/recouvrement/encaissement',
    description: 'Historique des encaissements (renvoie vers Recouvrement)',
    enabled: true,
  },
  {
    // RMANew (HistoriqueQuittances.aspx) est une liste plate (Locataire = simple colonne,
    // pas de drill-down) - la "quittance" RMANew est fusionnée dans Facture côté nouvelle
    // app (cf. Facture.cs), déjà listée avec Locataire/Actif/Local dans Facturation.
    key: 'quittances',
    name: 'Quittances / Locataire',
    icon: Receipt,
    link: '/leasing-management/facturation/factures',
    description: 'Historique des quittances (renvoie vers Facturation)',
    enabled: true,
  },
  {
    // RMANew (HistoriqueEncaissement.aspx) : même principe que "Encaissements" mais table
    // Payement (allocation par facture) au lieu de Bordereau - également une liste plate
    // avec Locataire en colonne, couverte par la même page Encaissement.
    key: 'encaissements-locataire',
    name: 'Encaissements / Locataire',
    icon: Banknote,
    link: '/leasing-management/recouvrement/encaissement',
    description: 'Historique des encaissements par locataire (renvoie vers Recouvrement)',
    enabled: true,
  },
  {
    key: 'annulations',
    name: 'Annulations Quittances',
    icon: FileX,
    link: '/archives/annulations-quittances',
    description: 'Quittances (factures) annulées',
    enabled: true,
  },
  {
    // RMANew (ListHistoriqueCharge.aspx) : historique des charges par actif, déjà couvert
    // par la liste Charges du module Property Management.
    key: 'historique-charges',
    name: 'Historique Charges',
    icon: ClipboardList,
    link: '/property-management/charges',
    description: 'Historique des charges (renvoie vers Property Management)',
    enabled: true,
  },
];

const Archives = () => {

  return (
    <div className='space-y-4'>
      <Title icon={Archive} title='Archives' description="Consulter et réactiver les données archivées" />

      <HubCardGrid items={items} />
    </div>
  );
};

export default Archives;
