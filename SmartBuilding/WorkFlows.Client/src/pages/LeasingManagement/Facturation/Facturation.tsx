import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { Ban, BookOpen, FileText as FileTextIcon, PenLine, Receipt } from 'lucide-react';

// RMANew (ViewFacturation.aspx) : page de menu vers les 4 sous-modules de facturation.
const items = [
  {
    key: 'journal',
    name: 'Journal Comptable',
    icon: BookOpen,
    link: '/leasing-management/facturation/journal',
    description: 'Suivi comptable des loyers facturés',
    enabled: true,
  },
  {
    key: 'factures',
    name: "Avis d'échéance / Facture",
    icon: Receipt,
    link: '/leasing-management/facturation/factures',
    description: 'Génération des avis et factures de loyer',
    enabled: true,
  },
  {
    key: 'facturation-manuelle',
    name: 'Facturation Manuelle',
    icon: PenLine,
    link: '/leasing-management/facturation/facturation-manuelle',
    description: 'Émettre une facture manuellement par locataire',
    enabled: true,
  },
  {
    key: 'annulation-facture',
    name: 'Annulation Facture',
    icon: Ban,
    link: '/leasing-management/facturation/annulation-facture',
    description: 'Confirmer les demandes d’annulation de facture',
    enabled: true,
  },
];

const Facturation = () => {

  return (
    <div className='space-y-4'>
      <Title
        icon={FileTextIcon}
        title='Facturation'
        description='Facturation des loyers et charges'
      />

      <HubCardGrid items={items} />
    </div>
  );
};

export default Facturation;
