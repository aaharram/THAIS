import { cn } from '@/utils/lib/utils';
import type { ElementType } from 'react';
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
};

/** Seconde couleur du dégradé de bordure ; la première est la couleur primaire de l'application. */
const BRAND_SECOND = '#4338ca';

/**
 * Carte des pages d'accueil de module (même rendu que les cartes de configuration d'iAudit) :
 * carte blanche, bordure en dégradé de la couleur primaire (haut) vers l'indigo de la marque
 * (bas), icône dans un rond teinté, titre centré. Quatre par ligne sur grand écran.
 */
export function HubCardGrid({ items, className }: { items: HubCardItem[]; className?: string }) {
  const navigate = useNavigate();
  return (
    <div className={cn('grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4', className)}>
      {items.map((item) => {
        const enabled = item.enabled !== false;
        return (
          <button
            key={item.name}
            type='button'
            disabled={!enabled}
            title={enabled ? item.description : 'Bientôt disponible'}
            onClick={() => {
              if (!enabled) return;
              if (item.onClick) item.onClick();
              else if (item.link) navigate(item.link);
            }}
            style={{ backgroundImage: `linear-gradient(to bottom, hsl(var(--primary)), ${BRAND_SECOND})` }}
            className={cn(
              'rounded-2xl p-[3px] text-left transition',
              enabled ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-lg' : 'cursor-not-allowed opacity-50',
            )}
          >
            <span className='flex h-40 flex-col items-center justify-center gap-3 rounded-[calc(1rem-3px)] bg-white'>
              <span className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20'>
                {item.icon ? <item.icon className='h-8 w-8 text-primary' strokeWidth={1.75} /> : null}
              </span>
              <span className='px-4 text-center text-sm font-semibold text-primary'>{item.name}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
