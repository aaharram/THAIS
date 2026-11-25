import { createLookupSlice } from './lookupSliceFactory';

// Préfixe "cfg" pour éviter toute collision avec les slices existants (ex. `villes`/`province`
// utilisés par les listes déroulantes en cascade Pays→Province→Ville du formulaire Membres).
export const lookupModules = {
  cfgVilles: createLookupSlice('cfgVilles', 'villes'),
  cfgTypologiesLot: createLookupSlice('cfgTypologiesLot', 'typologies-lot'),
  cfgTypologiesSinistre: createLookupSlice('cfgTypologiesSinistre', 'typologies-sinistre'),
  cfgBanques: createLookupSlice('cfgBanques', 'banques'),
  cfgServiceProfils: createLookupSlice('cfgServiceProfils', 'service-profils'),
  cfgCourtiers: createLookupSlice('cfgCourtiers', 'courtiers'),
  cfgAssureurs: createLookupSlice('cfgAssureurs', 'assureurs'),
  cfgEncaisseurs: createLookupSlice('cfgEncaisseurs', 'encaisseurs'),
  cfgSocietesImmobilieres: createLookupSlice('cfgSocietesImmobilieres', 'societes-immobilieres'),
  cfgBuildingTypes: createLookupSlice('cfgBuildingTypes', 'building-types'),
  cfgProprietaires: createLookupSlice('cfgProprietaires', 'proprietaires'),
  cfgPays: createLookupSlice('cfgPays', 'pays'),
  cfgPeriodicites: createLookupSlice('cfgPeriodicites', 'periodicites'),
  cfgTypesTaxe: createLookupSlice('cfgTypesTaxe', 'types-taxe'),
} as const;

export type LookupModuleKey = keyof typeof lookupModules;

export interface LookupModuleConfig {
  key: LookupModuleKey;
  label: string;
  labelSingular: string;
  description: string;
  hasRate?: boolean;
  hasFlag?: boolean;
  inputType?: 'text' | 'email';
  designationLabel?: string;
  rateLabel?: string;
  flagLabel?: string;
}

export const lookupModuleConfigs: LookupModuleConfig[] = [
  { key: 'cfgVilles', label: 'Villes', labelSingular: 'ville', description: 'Gérer les villes' },
  {
    key: 'cfgTypologiesLot',
    label: 'Typologies de lot',
    labelSingular: 'typologie de lot',
    description: 'Gérer les typologies de lot',
  },
  {
    key: 'cfgTypologiesSinistre',
    label: 'Typologies de sinistre',
    labelSingular: 'typologie de sinistre',
    description: 'Gérer les typologies de sinistre',
  },
  { key: 'cfgBanques', label: 'Banques', labelSingular: 'banque', description: 'Gérer les banques' },
  {
    key: 'cfgServiceProfils',
    label: 'Profils',
    labelSingular: 'profil',
    description: "Gérer les profils utilisateurs et leur droit d'accès",
    hasFlag: true,
    flagLabel: 'Accès complet',
  },
  {
    key: 'cfgCourtiers',
    label: 'Courtiers',
    labelSingular: 'courtier',
    description: 'Gérer les courtiers',
  },
  {
    key: 'cfgAssureurs',
    label: 'Assureurs',
    labelSingular: 'assureur',
    description: 'Gérer les assureurs',
  },
  {
    key: 'cfgEncaisseurs',
    label: 'Encaisseurs',
    labelSingular: 'encaisseur',
    description: 'Gérer les encaisseurs',
  },
  {
    key: 'cfgSocietesImmobilieres',
    label: 'Sociétés immobilières',
    labelSingular: 'société immobilière',
    description: 'Gérer les sociétés immobilières',
  },
  {
    key: 'cfgBuildingTypes',
    label: 'Types Actif',
    labelSingular: "type d'actif",
    description: "Gérer les types d'actif immobilier",
  },
  {
    key: 'cfgProprietaires',
    label: 'Propriétaires',
    labelSingular: 'propriétaire',
    description: 'Gérer les propriétaires',
  },
  {
    key: 'cfgPays',
    label: 'Pays',
    labelSingular: 'pays',
    description: 'Gérer les pays',
  },
  {
    key: 'cfgPeriodicites',
    label: 'Périodicités',
    labelSingular: 'périodicité',
    description: 'Gérer les périodicités de facturation',
  },
  {
    key: 'cfgTypesTaxe',
    label: 'Types de taxe',
    labelSingular: 'type de taxe',
    description: 'Gérer les types de taxe',
  },
];

export const getLookupModuleConfig = (key: string): LookupModuleConfig | undefined =>
  lookupModuleConfigs.find((c) => c.key === key);
