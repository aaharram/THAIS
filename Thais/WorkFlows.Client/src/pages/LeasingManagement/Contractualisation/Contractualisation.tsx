import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { FileSignature, FileText, Lock, XCircle } from 'lucide-react';
import { useSearchParams } from 'react-router';

const baseItems = [
  {
    key: 'gestion-contrats',
    name: 'Gestion des Contrats',
    icon: FileSignature,
    link: '/leasing-management/baux',
    description: 'Gérer les baux et contrats de location',
    enabled: true,
  },
  {
    key: 'gestion-resiliations',
    name: 'Gestion des Résiliations',
    icon: XCircle,
    link: '/leasing-management/resiliations',
    description: 'Gérer les résiliations de baux',
    enabled: false,
  },
  {
    key: 'suspensions',
    name: 'Suspensions',
    icon: Lock,
    link: '/leasing-management/suspensions',
    description: 'Gérer les suspensions de baux',
    enabled: false,
  },
  {
    key: 'attestation-fiscal',
    name: 'Attestation fiscal',
    icon: FileText,
    link: '/leasing-management/attestations',
    description: "Générer les attestations fiscales",
    enabled: false,
  },
];

const Contractualisation = () => {
  // ?building= (actif choisi dans Leasing Management) : transmis à la liste des contrats.
  const [searchParams] = useSearchParams();
  const buildingId = Number(searchParams.get('building')) || 0;
  const items = baseItems.map((item) =>
    buildingId && item.key === 'gestion-contrats' ? { ...item, link: `${item.link}?building=${buildingId}` } : item,
  );

  return (
    <div className='space-y-4'>
      <Title
        icon={FileSignature}
        title='Contractualisation'
        description='Gérer les baux et contrats de location'
      />

      <HubCardGrid items={items} />
    </div>
  );
};

export default Contractualisation;
