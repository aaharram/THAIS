// IconTabs.tsx
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ReactNode } from 'react';
import { cn } from '../../utils/lib/utils';

type TabItem = {
  value: string;
  label: string;
  icon: ReactNode;
};

type IconTabsProps = {
  tabs: TabItem[];
  selectedTab: string;
  onTabChange: (value: string) => void;
};

export const IconTabs = ({ tabs, selectedTab, onTabChange }: IconTabsProps) => {
  return (
    <Tabs value={selectedTab} onValueChange={onTabChange}>
      <TabsList className='flex flex-wrap gap-2 bg-transparent p-0 w-full'>
        {tabs.map((tab) => {
          const isActive = selectedTab === tab.value;

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'group flex items-center justify-between w-full sm:w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.666rem)] p-3 border rounded-lg shadow-sm transition-all duration-150',
                'text-sm md:text-base font-medium',
                'hover:bg-muted hover:border-muted',
                isActive
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'bg-white border-gray-300 text-gray-800',
              )}
            >
              <div className='flex items-center gap-2'>
                {tab.icon}
                <span className='truncate'>{tab.label}</span>
              </div>

              <div
                className={cn(
                  'w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors',
                  isActive
                    ? 'border-primary bg-white'
                    : 'border-gray-400 group-hover:border-gray-500',
                )}
              >
                {isActive && <div className='w-2 h-2 rounded-full bg-primary' />}
              </div>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
};
