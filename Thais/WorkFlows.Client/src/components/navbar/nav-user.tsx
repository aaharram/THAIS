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
import { THEMES, useTheme } from '@/utils/theme/theme';
import { Check, ChevronsUpDown, LogOut, Settings, SquareUser } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router';

export function NavUser() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { auth: user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const profile = useSelector((state: RootState) => state.profile.profile);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const { theme, choose: chooseTheme } = useTheme();

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
  const initiales =
    (user.name ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((m) => m[0]?.toUpperCase())
      .join('') || 'U';
  // Pastille d'initiales aux couleurs THAIS (framboise vers marine) quand il n'y a pas de photo.
  const avatarFallback = 'rounded-lg bg-gradient-to-br from-primary/70 to-primary text-sm font-semibold text-white';
  // Lignes du menu : survol et focus en rose THAIS, icône dans une petite tuile teintée.
  const itemClass =
    'cursor-pointer gap-3 rounded-md px-2 py-2 text-sm font-medium focus:bg-primary/10 focus:text-primary';
  const tile = 'flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary';

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
                  <AvatarFallback className={avatarFallback}>{initiales}</AvatarFallback>
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
            className='w-72 overflow-hidden rounded-xl border-slate-200 bg-white p-0 shadow-[0_20px_50px_-12px_rgba(27,27,58,0.30)]'
            side='bottom'
            align='end'
            sideOffset={8}
          >
            {/* En-tête : fond rose très léger, filet framboise à gauche */}
            <DropdownMenuLabel className='border-l-[3px] border-primary bg-primary/5 p-0 font-normal'>
              <div className='flex items-center gap-3 px-4 py-3.5 text-left'>
                <Avatar className='h-11 w-11 rounded-lg'>
                  <AvatarImage src={photoUrl ?? undefined} alt={user.name} />
                  <AvatarFallback className={avatarFallback}>{initiales}</AvatarFallback>
                </Avatar>
                <div className='flex min-w-0 flex-col items-start gap-1'>
                  <span className='truncate text-sm font-semibold text-foreground'>{user.name}</span>
                  {profilLabel && (
                    <span className='rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary'>
                      {profilLabel}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <div className='p-1.5'>
              <DropdownMenuGroup>
                <DropdownMenuItem className={itemClass} onClick={() => navigate('/mon-compte')}>
                  <span className={tile}>
                    <SquareUser />
                  </span>
                  Mon compte
                </DropdownMenuItem>
                <DropdownMenuItem className={itemClass} onClick={() => navigate('/configuration-globale')}>
                  <span className={tile}>
                    <Settings />
                  </span>
                  Configuration
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className='my-1.5' />
              {/* Apparence : thème de l'application, appliqué tout de suite et mémorisé dans le navigateur. */}
              <div className='px-2 pb-1 pt-1 text-xs font-medium text-muted-foreground'>Apparence</div>
              {THEMES.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  className={itemClass}
                  onSelect={(e) => {
                    e.preventDefault(); // le menu reste ouvert pour essayer plusieurs thèmes
                    chooseTheme(t.id);
                  }}
                >
                  <span className='flex h-8 w-8 items-center justify-center'>
                    <span
                      className={`h-5 w-5 rounded-full shadow-sm ${
                        // Sombre : la pastille marine disparaît sur le fond foncé du menu, on l'entoure de rose (couleur du thème).
                        t.id === 'sombre' && theme === 'sombre'
                          ? 'border-2 border-primary'
                          : 'border border-black/10'
                      }`}
                      style={{ backgroundColor: t.swatch }}
                    />
                  </span>
                  <span className='flex-1'>{t.label}</span>
                  {theme === t.id && <Check className='h-4 w-4 text-primary' />}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className='my-1.5' />
              <DropdownMenuItem
                className={itemClass + ' text-red-600 focus:bg-red-50 focus:text-red-700'}
                onClick={handleLogout}
              >
                <span className='flex h-8 w-8 items-center justify-center rounded-md bg-red-100 text-red-600'>
                  <LogOut />
                </span>
                Se déconnecter
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
