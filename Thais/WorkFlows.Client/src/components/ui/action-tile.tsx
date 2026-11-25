import { cn } from '@/utils/lib/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { Loader2 } from 'lucide-react';
import type { ComponentType } from 'react';

type Glyph = ComponentType<{ className?: string }>;


const sw = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.1, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const PAGE = 'M14 3H8a2.5 2.5 0 0 0-2.5 2.5v13A2.5 2.5 0 0 0 8 21h8a2.5 2.5 0 0 0 2.5-2.5V7.5z';

// Pictogrammes au trait à deux tons : contour et repère (« PDF » ou « X ») de la couleur du bouton, sur un léger aplat.
export const PdfGlyph: Glyph = ({ className }) => (
  <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
    <path d={PAGE} fill='currentColor' fillOpacity='0.24' />
    <path d={PAGE} {...sw} />
    <path d='M14 3v4.5h4.5' {...sw} />
    <text x='12' y='16.2' fontSize='6.4' fontWeight='800' fill='currentColor' textAnchor='middle' fontFamily='Arial, Helvetica, sans-serif'>
      PDF
    </text>
  </svg>
);

export const ExcelGlyph: Glyph = ({ className }) => (
  <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
    <path d={PAGE} fill='currentColor' fillOpacity='0.24' />
    <path d={PAGE} {...sw} />
    <path d='M14 3v4.5h4.5M9.5 11.5l5 5.5M14.5 11.5l-5 5.5' {...sw} strokeWidth={2.1} />
  </svg>
);

// Pastilles d'action pleines, comme sur les boutons de Madaef : une flèche épaisse au-dessus d'un petit bac à deux
// points. Les points prennent la couleur du bouton (variable --c posée sur la pastille).
export const UploadBadge: Glyph = ({ className }) => (
  <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
    <path d='M12 2.5l6.5 7.5H14v5.5h-4V10H5.5z' fill='currentColor' />
    <rect x='2.5' y='16.5' width='19' height='5.5' rx='1.6' fill='currentColor' />
    <circle cx='16.8' cy='19.25' r='0.95' fill='var(--c)' />
    <circle cx='19.4' cy='19.25' r='0.95' fill='var(--c)' />
  </svg>
);

export const DownloadBadge: Glyph = ({ className }) => (
  <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
    <path d='M12 15.5l6.5-7.5H14V2.5h-4V8H5.5z' fill='currentColor' />
    <rect x='2.5' y='16.5' width='19' height='5.5' rx='1.6' fill='currentColor' />
    <circle cx='16.8' cy='19.25' r='0.95' fill='var(--c)' />
    <circle cx='19.4' cy='19.25' r='0.95' fill='var(--c)' />
  </svg>
);

/** Couleurs des boutons d'import / d'export (reprises des pastilles ISO) : une couleur par bouton. */
export const TILE_COLORS = {
  bleu: '#1E8FB8',
  vert: '#4C9A2A',
  orange: '#E08A00',
  violet: '#7B4BB8',
} as const;

/**
 * Bouton carré à teinte douce : un glyphe de fichier et, en bas à droite, une petite pastille pleine qui dit
 * l'action (flèche vers le bas = export, vers le haut = import). Le nom de l'action est dans l'infobulle.
 */
export function ActionTile({
  color,
  icon: Icon,
  badge: Badge,
  label,
  onClick,
  busy,
  disabled,
}: {
  color: string;
  icon: Glyph;
  badge: Glyph;
  label: string;
  onClick: () => void;
  busy?: boolean;
  disabled?: boolean;
}) {
  // Fond pastel plein (comme les boutons d'action de Madaef) : la pastille s'y détache par un liseré de la même teinte.
  const fond = `color-mix(in srgb, ${color} 14%, hsl(var(--background)))`;
  const bouton = (
    <button
      type='button'
      aria-label={label}
      onClick={onClick}
      disabled={disabled || busy}
      className={cn(
        'relative inline-flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[10px] transition-all',
        'hover:-translate-y-0.5 hover:shadow-[0_6px_12px_var(--tile-shadow)] active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
        'disabled:pointer-events-none disabled:opacity-60',
      )}
      style={{
        color,
        backgroundColor: fond,
        ['--tw-ring-color' as string]: color,
        ['--tile-shadow' as string]: `color-mix(in srgb, ${color} 24%, transparent)`,
      }}
    >
      {busy ? <Loader2 className='h-4 w-4 animate-spin' /> : <Icon className='-translate-x-[4px] -translate-y-[4px] h-[22px] w-[22px]' />}
      {!busy && (
        <span
          className='absolute bottom-[2px] right-[2px] flex h-[18px] w-[18px] items-center justify-center rounded-full text-white'
          style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${fond}`, ['--c' as string]: color }}
        >
          <Badge className='h-[12px] w-[12px]' />
        </span>
      )}
    </button>
  );

  // Infobulle aux couleurs de THAIS : fond sombre du thème (comme le grand cadre du tableau de bord), pastille de
  // la couleur du bouton, coins arrondis et petite pointe vers le bouton.
  return (
    <TooltipPrimitive.Provider delayDuration={120}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{bouton}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side='bottom'
            sideOffset={8}
            className='z-50 flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[side=bottom]:slide-in-from-top-1'
            style={{ background: 'linear-gradient(135deg, hsl(var(--hero-from)), hsl(var(--hero-to)))' }}
          >
            <span className='h-2 w-2 shrink-0 rounded-full' style={{ backgroundColor: color, boxShadow: `0 0 0 2px ${color}55` }} />
            {label}
            <TooltipPrimitive.Arrow width={12} height={6} style={{ fill: 'hsl(var(--hero-from))' }} />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}
