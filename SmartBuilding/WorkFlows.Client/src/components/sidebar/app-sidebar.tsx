'use client';

import { SideEntreprise } from '@/components/sidebar/side-entreprise';
import { SideItems } from '@/components/sidebar/side-items';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { logout } from '@/store/features/authentification/authSlice.ts';
import { useAppDispatch, useAppSelector } from '@/store/hooks.ts';
import { sideMenu } from '@/utils/menu/side-menu';
import { LogOut } from 'lucide-react';
import * as React from 'react';
import { useNavigate } from 'react-router';
import Footer from './footer';

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isExpanded = state === 'expanded';
  const userRole = useAppSelector((s) => s.auth.auth?.role);

  const filteredMenu = sideMenu.filter((item) => {
    return !item.role || (userRole && item.role.includes(userRole));
  });

  return (
    <Sidebar collapsible='icon' {...props}>
      <SidebarHeader>
        <SideEntreprise />
      </SidebarHeader>
      <SidebarContent className='mt-2.5'>
        <SideItems items={filteredMenu} />
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenuButton
          asChild
          tooltip='Déconnexion'
          onClick={() => {
            dispatch(logout(false)).then(() => navigate('/login'));
          }}
        >
          <button className='flex items-center w-full rounded-lg transition-colors hover:bg-muted text-muted-foreground'>
            <LogOut className='flex items-center justify-center' />
            {isExpanded && <span className='text-sm font-medium truncate'>Déconnexion</span>}
          </button>
        </SidebarMenuButton>
        {state === 'expanded' && <Footer />}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
