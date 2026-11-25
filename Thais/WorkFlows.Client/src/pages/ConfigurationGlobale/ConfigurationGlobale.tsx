import { HubCardGrid } from '@/components/ui/hub-card-grid';
import { Title } from '@/components/ui/title';
import { globalConfigMenu } from '@/utils/menu/global-config-menu';
import { Settings } from 'lucide-react';

const ConfigurationGlobale = () => {

  return (
    <div className='space-y-4'>
      <Title icon={Settings} title='Configuration Globale' description='Paramètres généraux du système' />
      <HubCardGrid items={globalConfigMenu} />
    </div>
  );
};

export default ConfigurationGlobale;
