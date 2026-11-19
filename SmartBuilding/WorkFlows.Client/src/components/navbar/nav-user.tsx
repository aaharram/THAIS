'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { AppDispatch, RootState } from '@/store';
import { logout } from '@/store/features/authentification/authSlice';
import { getMyProfile } from '@/store/features/profile/profileSlice';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { ChevronsUpDown, LogOut, Settings, SquareUser, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

export function NavUser() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { auth: user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const profile = useSelector((state: RootState) => state.profile.profile);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getMyProfile());
    }
  }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    if (!profile?.urlPicture) {
      setPhotoUrl(null);
      return;
    }

    let objectUrl: string | null = null;
    let cancelled = false;

    api
      .get(`${API_BASE_URL}/api/profile/${profile.numero}/photo`, { responseType: 'blob' })
      .then((res) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(res.data);
        setPhotoUrl(objectUrl);
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [profile?.urlPicture, profile?.numero]);

  if (!isAuthenticated || !user) return null;

  const handleLogout = () => {
    dispatch(logout(false));
    navigate('/login');
  };

  const profilLabel = profile?.nomPatrimoineType || '';

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size='lg'
              className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground'
            >
              <div className='flex items-center gap-3'>
                {/* Copie THAIS : sans photo de profil, on affiche une simple icône utilisateur. */}
                <Avatar className='rounded-lg'>
                  <AvatarImage src={photoUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className='rounded-lg bg-muted text-muted-foreground'>
                    <User className='size-5' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col items-start'>
                  <span className='text-sm font-semibold'>{user.name}</span>
                  {profilLabel && (
                    <span className='text-xs text-muted-foreground'>{profilLabel}</span>
                  )}
                </div>
              </div>
              <ChevronsUpDown className='ml-auto size-4' />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className='w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg'
            side='bottom'
            align='end'
            sideOffset={4}
          >
            <DropdownMenuLabel className='p-0 font-normal'>
              <div className='flex items-center gap-2 px-1 py-1.5 text-left'>
                <Avatar>
                  <AvatarImage src={photoUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className='rounded-lg bg-muted text-muted-foreground'>
                    <User className='size-5' />
                  </AvatarFallback>
                </Avatar>
                <div className='flex flex-col items-start'>
                  <span className='text-sm font-semibold'>{user.name}</span>
                  {profilLabel && (
                    <span className='text-xs text-muted-foreground'>{profilLabel}</span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/mon-compte')}>
                <SquareUser className='mr-2 h-4 w-4' />
                Mon compte
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/configuration-globale')}>
                <Settings className='mr-2 h-4 w-4' />
                Configuration
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className='mr-2 h-4 w-4' />
              Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
