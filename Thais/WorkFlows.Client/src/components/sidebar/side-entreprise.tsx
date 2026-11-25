'use client';

import { AppLogo } from '@/components/brand/AppLogo';
import { APP_TAGLINE } from '@/components/brand/company';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Link } from 'react-router';

export function SideEntreprise() {
  const { state } = useSidebar();
  const isExpanded = state === 'expanded';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        {/* Le logo et le nom ramènent au tableau de bord. */}
        <SidebarMenuButton
          asChild
          size='lg'
          className='flex items-center rounded-lg hover:bg-sidebar-hover transition-colors duration-200'
          style={{
            minHeight: '56px',
            minWidth: '48px',
            gap: isExpanded ? '12px' : '0',
          }}
        >
          <Link to='/' title='Tableau de bord'>
            <AppLogo className='w-9 h-9 mx-auto' />

            {isExpanded && (
              <div className='grid flex-1 text-left leading-tight'>
                <img src='/logo-thais-couleur.png' alt='THAIS' className='h-5 w-auto max-w-full self-start object-contain object-left' draggable={false} />
                <span className='truncate text-caption font-normal text-gray-400' title={APP_TAGLINE}>
                  {APP_TAGLINE}
                </span>
              </div>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
