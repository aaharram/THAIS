import { Users, ShieldCheck, Settings2, LucideIcon } from 'lucide-react';

export interface GlobalConfigItem {
  name: string;
  icon: LucideIcon;
  link: string;
  description: string;
  // false = carte grisée (« Bientôt disponible »), cf. HubCardGrid.
  enabled?: boolean;
}

export const globalConfigMenu: GlobalConfigItem[] = [
  {
    name: 'Utilisateurs',
    icon: Users,
    link: '/configuration-globale/utilisateurs',
    description: 'Gérer les comptes utilisateurs du système',
  },
  {
    name: 'Données de référence',
    icon: Settings2,
    link: '/configuration-globale/reference',
    description: 'Gérer les tables de paramétrage et de référence',
  },
  {
    name: 'LDAP',
    icon: ShieldCheck,
    link: '/configuration-globale/ldap',
    description: "Configuration de l'authentification LDAP",
    enabled: false,
  },
];
