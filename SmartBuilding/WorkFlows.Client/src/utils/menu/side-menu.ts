import { DashboardIcon } from '@/components/icons/dashboard-icon';
import { BarChart3, KeyRound, Network, Settings, Wrench } from 'lucide-react';
import type { ElementType } from 'react';

export type MenuItem = {
  name: string;
  url: string;
  // Icône lucide ou icône maison (ex. DashboardIcon) : seule la classe CSS est transmise.
  icon: ElementType<{ className?: string }>;
  role?: string[];
  children?: MenuItem[];
};

export const sideMenu: MenuItem[] = [
  {
    name: 'Tableau de bord',
    url: '/',
    icon: DashboardIcon,
    role: ['Contractor'],
  },
  {
    name: 'Leasing Management',
    url: '/leasing-management',
    icon: KeyRound,
    role: ['Contractor'],
  },
  {
    name: 'Asset Management',
    url: '/patrimoine/asset-management',
    icon: Network,
    role: ['Contractor'],
  },
  {
    name: 'Property Management',
    url: '/property-management',
    icon: Wrench,
    role: ['Contractor'],
  },
  {
    name: 'Reporting',
    url: '/reporting',
    icon: BarChart3,
    role: ['Contractor'],
  },
  {
    name: 'Configuration',
    url: '/configuration-globale',
    icon: Settings,
    role: ['Contractor'],
  },
];
