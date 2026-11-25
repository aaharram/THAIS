import { cn } from '@/utils/lib/utils';
import type { ReactNode } from 'react';

// Couleurs des actions d'import / d'export (reprises des pastilles ISO) : bleu = export, vert = import,
// orange = PDF, violet = modèle. Chaque action est une pastille douce (teinte claire + glyphe de la couleur).
export const ACTION_COLORS = {
  bleu: '#1E8FB8',
  vert: '#4C9A2A',
  orange: '#E08A00',
  violet: '#6B3FA0',
} as const;

/** Pastille arrondie à teinte douce portant un glyphe de la même couleur (dans le style des boutons d'action). */
export const IconTile = ({
  color,
  className,
  children,
}: {
  color: string;
  className?: string;
  children: ReactNode;
}) => (
  <span
    aria-hidden='true'
    className={cn('inline-flex shrink-0 items-center justify-center rounded-lg', className)}
    style={{ color, backgroundColor: `${color}1F` }}
  >
    {children}
  </span>
);

// Icônes des formats (PDF, Excel) : pastille douce, avec le repère du format bien lisible dedans — « PDF » écrit
// en gras et le « X » d'Excel tracé en gros. La taille vient du className reçu (ex. h-6 w-6).
export const PdfFileIcon = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 32 32' className={className} xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
    <rect width='32' height='32' rx='8' fill={ACTION_COLORS.orange} fillOpacity='0.14' />
    <path d='M21 6.5v4a1 1 0 0 0 1 1h4' fill='none' stroke={ACTION_COLORS.orange} strokeOpacity='0.5' strokeWidth='1.6' strokeLinecap='round' />
    <text
      x='16'
      y='22.5'
      fontSize='11.5'
      fontWeight='800'
      fill={ACTION_COLORS.orange}
      textAnchor='middle'
      fontFamily='Arial, Helvetica, sans-serif'
      letterSpacing='-0.3'
    >
      PDF
    </text>
  </svg>
);

export const ExcelFileIcon = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 32 32' className={className} xmlns='http://www.w3.org/2000/svg' aria-hidden='true'>
    <rect width='32' height='32' rx='8' fill={ACTION_COLORS.vert} fillOpacity='0.14' />
    <path d='M21 6.5v4a1 1 0 0 0 1 1h4' fill='none' stroke={ACTION_COLORS.vert} strokeOpacity='0.5' strokeWidth='1.6' strokeLinecap='round' />
    <path d='M10.5 11.5l11 11M21.5 11.5l-11 11' stroke={ACTION_COLORS.vert} strokeWidth='4' strokeLinecap='round' />
  </svg>
);
