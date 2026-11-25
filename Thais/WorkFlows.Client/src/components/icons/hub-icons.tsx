// Icônes des cartes de Leasing Management, redessinées d'après les captures fournies (traits pleins, simples).
// Même signature que les icônes lucide (className, strokeWidth), pour se brancher directement dans HubCardGrid.
import type { SVGProps } from 'react';

type IconProps = { className?: string; strokeWidth?: number | string } & Omit<SVGProps<SVGSVGElement>, 'className' | 'strokeWidth'>;

const base = (strokeWidth: number | string | undefined) => ({
  xmlns: 'http://www.w3.org/2000/svg',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: strokeWidth ?? 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
});

/** Facturation : une facture (cadre, bandeau d'en-tête, lignes de détail, montant en bas à droite). */
export function InvoiceIcon({ className, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(strokeWidth)} className={className} {...rest}>
      <rect x='3' y='4' width='18' height='16' rx='2' />
      <path d='M3 8.5h18' />
      <path d='M6 12h3M12 12h6M6 15h3M12 15h6' />
      <rect x='13' y='17' width='5' height='1.2' rx='0.6' fill='currentColor' stroke='none' />
    </svg>
  );
}

/** Contractualisation : un contrat (feuille avec lignes) et un stylo plein qui signe. */
export function ContractIcon({ className, strokeWidth, ...rest }: IconProps) {
  return (
    <svg {...base(strokeWidth)} className={className} {...rest}>
      <path d='M13.5 21H6.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v3.5' />
      <path d='M8 8h5M8 12h3' />
      <path d='M19.2 10.3a1.4 1.4 0 0 1 2 2L14.6 19l-3.1.9.9-3.1z' fill='currentColor' />
    </svg>
  );
}
