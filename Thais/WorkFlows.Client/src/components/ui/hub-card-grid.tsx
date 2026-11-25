import { cn } from '@/utils/lib/utils';
import type { ElementType, ReactNode } from 'react';
import { useNavigate } from 'react-router';

export type HubCardItem = {
  name: string;
  icon?: ElementType<{ className?: string; strokeWidth?: number | string }>;
  /** page ouverte au clic */
  link?: string;
  /** exécutée à la place du lien (ex. une carte qui télécharge un fichier au lieu d'ouvrir une page) */
  onClick?: () => void;
  /** affichée en infobulle : la carte elle-même ne porte que le titre */
  description?: string;
  /** false = écran pas encore disponible, la carte est grisée et non cliquable */
  enabled?: boolean;
  /** contenu affiché dans la carte sous le titre (ex. un menu déroulant) ; un clic dessus n'ouvre pas la carte */
  footer?: ReactNode;
};

/**
 * Carte des pages d'accueil de module (même rendu que les cartes de configuration d'iAudit) :
 * carte blanche, bordure fine et claire de la couleur primaire (framboise du logo), icône dans un rond teinté, titre centré. Quatre par ligne sur grand écran.
 */
export function HubCardGrid({ items, className }: { items: HubCardItem[]; className?: string }) {
  const navigate = useNavigate();
  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {items.map((item) => {
        const enabled = item.enabled !== false;
        const open = () => {
          if (!enabled) return;
          if (item.onClick) item.onClick();
          else if (item.link) navigate(item.link);
        };
        return (
          <div
            key={item.name}
            role='button'
            tabIndex={enabled ? 0 : -1}
            aria-disabled={!enabled}
            title={enabled ? item.description : 'Bientôt disponible'}
            onClick={open}
            onKeyDown={(e) => {
              if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                open();
              }
            }}
            className={cn(
              'hub-card rounded-2xl bg-primary/60 p-[2px] text-left transition',
              enabled
                ? 'cursor-pointer hover:-translate-y-0.5 hover:bg-primary hover:shadow-lg hover:shadow-primary/25'
                : 'cursor-not-allowed opacity-50',
            )}
          >
            <span className='flex min-h-40 flex-col items-center justify-center gap-3 py-4 rounded-[calc(1rem-2px)] bg-white'>
              <span className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/[0.07] ring-1 ring-primary/10'>
                {item.icon ? <item.icon className='h-9 w-9 hub-card-icon text-primary/90' strokeWidth={1.9} /> : null}
              </span>
              <span className='px-4 text-center text-sm hub-card-title font-medium text-primary/95'>{item.name}</span>
              {item.footer ? (
                <span className='w-56' onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                  {item.footer}
                </span>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}
