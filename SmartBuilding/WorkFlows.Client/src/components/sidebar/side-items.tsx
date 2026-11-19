'use client';

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { RootState } from '@/store';
import type { MenuItem } from '@/utils/menu/side-menu';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';

type Props = {
  items: MenuItem[];
};

export function SideItems({ items }: Props) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { state } = useSidebar();
  const isExpanded = state === 'expanded';
  const user = useSelector((s: RootState) => s.auth.auth!);
  const [active, setActive] = useState<string>('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const flatten = (list: MenuItem[]): MenuItem[] =>
    list.flatMap((i) => (i.children ? [i, ...i.children] : [i]));

  useEffect(() => {
    const current = flatten(items).find((i) => i.url === pathname);
    if (current) setActive(current.name);
  }, [items, pathname]);

  const filteredItems = items
    .filter((i) => !i.role || (user && i.role.includes(user.role)))
    .map((i) => ({
      ...i,
      children: i.children?.filter((c) => !c.role || (user && c.role.includes(user.role))),
    }));

  const toggleGroup = (name: string) =>
    setOpenGroups((prev) => ({ ...prev, [name]: prev[name] === undefined ? false : !prev[name] }));

  const isGroupOpen = (name: string) => openGroups[name] !== false;

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredItems.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton
              asChild
              isActive={active === item.name}
              tooltip={item.name}
              onClick={() => {
                if (item.children && item.children.length > 0) {
                  toggleGroup(item.name);
                  return;
                }
                setActive(item.name);
                navigate(item.url);
              }}
            >
              <button
                className={`flex items-center w-full py-4 rounded-lg transition-colors  ${
                  active === item.name
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-muted-foreground'
                }`}
              >
                <item.icon className='flex items-center justify-center' />

                {isExpanded && (
                  <span className='text-sm font-medium truncate flex-1 text-left'>
                    {item.name}
                  </span>
                )}
                {isExpanded && item.children && item.children.length > 0 && (
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isGroupOpen(item.name) ? '' : '-rotate-90'
                    }`}
                  />
                )}
              </button>
            </SidebarMenuButton>

            {item.children && item.children.length > 0 && isGroupOpen(item.name) && (
              <SidebarMenuSub>
                {item.children.map((child) => (
                  <SidebarMenuSubItem key={child.name}>
                    <SidebarMenuSubButton
                      asChild
                      isActive={active === child.name}
                      onClick={() => {
                        setActive(child.name);
                        navigate(child.url);
                      }}
                    >
                      <button className='flex items-center w-full'>
                        <child.icon className='h-4 w-4' />
                        <span>{child.name}</span>
                      </button>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
