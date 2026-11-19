import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { lookupModuleConfigs } from '@/store/features/configuration/lookupModules';
import { Banknote, Briefcase, Building2, DollarSign, FolderTree, Globe, Landmark, MapPin, Settings2, Shield, Tags, User, Users } from 'lucide-react';

const iconByKey: Record<string, typeof MapPin> = {
  cfgVilles: Building2,
  cfgTypologiesLot: FolderTree,
  cfgTypologiesSinistre: FolderTree,
  cfgBanques: Banknote,
  cfgServiceProfils: Users,
  cfgCourtiers: Briefcase,
  cfgAssureurs: Shield,
  cfgEncaisseurs: Landmark,
  cfgSocietesImmobilieres: Building2,
  cfgBuildingTypes: Building2,
  cfgProprietaires: User,
  cfgPays: Globe,
};

// Modules dédiés (relations / champs spécifiques au-delà d'une simple désignation).
const dedicatedItems = [
  {
    key: 'cfgFiliales',
    name: 'Filiales',
    icon: Building2,
    link: '/configuration-globale/reference-dediee/filiales',
    description: 'Gérer les filiales',
  },
  {
    key: 'cfgTypologiesCharge',
    name: 'Typologies de charge',
    icon: DollarSign,
    link: '/configuration-globale/reference-dediee/typologies-charge',
    description: 'Gérer les typologies de charge',
  },
];

// RMANew (LeasingParameters.aspx) : "Typologies d'immobilisation" n'apparaît pas sur cette
// page de paramétrage - elle est déjà accessible depuis Reporting et Patrimoine > Asset
// Management (même route), pas dupliquée ici, suivant la même logique que le commentaire
// de LeasingParameters.aspx qui retire délibérément les tuiles déjà atteignables ailleurs.

const ReferenceDataConfig = () => {
  const items = [
    ...lookupModuleConfigs.map((c) => ({
      key: c.key,
      name: c.label,
      icon: iconByKey[c.key] ?? Tags,
      link: `/configuration-globale/reference/${c.key}`,
      description: c.description,
    })),
    ...dedicatedItems,
  ];

  return (
    <div className="space-y-4">
      <Title
        icon={Settings2}
        title="Données de référence"
        description="Gérer les tables de paramétrage et de référence"
      />
      <HubCardGrid items={items} />
    </div>
  );
};

export default ReferenceDataConfig;
