import { Button } from '@/components/ui/button';
import { cn } from '@/utils/lib/utils';
import { Download, Eye, FileDown, FileImage, LucideIcon, Pencil, Trash2 } from 'lucide-react';
import { Children } from 'react';
import type { MouseEvent, ReactNode } from 'react';

/**
 * Briques communes des listes « pro » (Baux, Locataires, Actifs, Locaux, Factures...) : avatar à initiales,
 * cellule à deux lignes, pastille de statut, montant, actions de ligne et bandeau d'indicateurs. Les couleurs
 * passent par des opacités sur les teintes Tailwind pour rester lisibles dans les trois thèmes (clair, sombre...).
 */

// ---------------------------------------------------------------------------------------------------------------------
// Avatar à initiales
// ---------------------------------------------------------------------------------------------------------------------

// Initiales des deux premiers mots porteurs de lettres/chiffres (« ADL (N7) » -> « AN », pas « A( »).
export const initialsOf = (name?: string | null) =>
  (name ?? '?')
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+/u, ''))
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?';

export const InitialsAvatar = ({ name, className }: { name?: string | null; className?: string }) => (
  <div
    className={cn(
      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary',
      className,
    )}
  >
    {initialsOf(name)}
  </div>
);

// ---------------------------------------------------------------------------------------------------------------------
// Cellule à deux lignes : titre + détail discret
// ---------------------------------------------------------------------------------------------------------------------

export const PrimarySecondary = ({
  primary,
  secondary,
  className,
}: {
  primary?: ReactNode;
  secondary?: ReactNode;
  className?: string;
}) => (
  <div className={cn('min-w-0', className)}>
    <div className='truncate font-medium'>{primary || <span className='text-muted-foreground'>—</span>}</div>
    {secondary ? <div className='truncate text-xs text-muted-foreground'>{secondary}</div> : null}
  </div>
);

/** Avatar + deux lignes (ex. locataire : nom, puis contrat / adresse). */
export const AvatarCell = ({
  name,
  secondary,
  className,
}: {
  name?: string | null;
  secondary?: ReactNode;
  className?: string;
}) => (
  <div className={cn('flex min-w-[200px] items-center gap-3', className)}>
    <InitialsAvatar name={name} />
    <PrimarySecondary primary={name} secondary={secondary} />
  </div>
);

// ---------------------------------------------------------------------------------------------------------------------
// Pastille de statut
// ---------------------------------------------------------------------------------------------------------------------

export type Tone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONE_STYLES: Record<Tone, string> = {
  success: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/25 dark:text-emerald-400',
  warning: 'bg-amber-500/10 text-amber-700 ring-amber-500/25 dark:text-amber-400',
  danger: 'bg-red-500/10 text-red-700 ring-red-500/25 dark:text-red-400',
  info: 'bg-sky-500/10 text-sky-700 ring-sky-500/25 dark:text-sky-400',
  neutral: 'bg-slate-500/10 text-slate-600 ring-slate-500/25 dark:text-slate-300',
};

export const StatusPill = ({ label, tone = 'neutral', dot = true }: { label?: string | null; tone?: Tone; dot?: boolean }) => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset',
      TONE_STYLES[tone],
    )}
  >
    {dot && <span className='h-1.5 w-1.5 rounded-full bg-current' />}
    {label || 'Non renseigné'}
  </span>
);

/** Petite étiquette neutre (type, code...). */
export const Chip = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn('inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium', className)}>
    {children}
  </span>
);

// ---------------------------------------------------------------------------------------------------------------------
// Montants et dates
// ---------------------------------------------------------------------------------------------------------------------

export const fmtMoney = (m?: number | null, digits = 2) =>
  (m ?? 0).toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: digits });

export const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString('fr-FR') : '');

export const daysFromToday = (d?: string | null) => (d ? Math.round((new Date(d).getTime() - Date.now()) / 86_400_000) : null);

export const MoneyCell = ({
  value,
  currency = 'MAD',
  secondary,
  tone,
}: {
  value?: number | null;
  currency?: string;
  secondary?: ReactNode;
  tone?: 'danger' | 'success';
}) => {
  if (value == null) return <div className='text-right text-muted-foreground'>—</div>;
  return (
    <div className='text-right tabular-nums'>
      <div
        className={cn(
          'whitespace-nowrap font-semibold',
          tone === 'danger' && 'text-red-600 dark:text-red-400',
          tone === 'success' && 'text-emerald-600 dark:text-emerald-400',
        )}
      >
        {fmtMoney(value)} <span className='text-xs font-normal text-muted-foreground'>{currency}</span>
      </div>
      {secondary ? <div className='whitespace-nowrap text-xs text-muted-foreground'>{secondary}</div> : null}
    </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------------
// Actions de ligne : consulter / modifier / supprimer (icônes sobres, teinte au survol)
// ---------------------------------------------------------------------------------------------------------------------

type RowActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  /** actions supplémentaires, affichées avant les trois classiques */
  extra?: ReactNode;
};

export const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className: string;
}) => (
  <Button
    type='button'
    variant='ghost'
    size='sm'
    title={label}
    aria-label={label}
    className={cn('h-8 w-8 p-0', className)}
    onClick={(e: MouseEvent) => {
      e.stopPropagation();
      onClick();
    }}
  >
    <Icon className='h-4 w-4' />
  </Button>
);

export const RowActions = ({
  onView,
  onEdit,
  onDelete,
  viewLabel = 'Consulter',
  editLabel = 'Modifier',
  deleteLabel = 'Supprimer',
  extra,
}: RowActionsProps) => (
  <div className='flex justify-end gap-1'>
    {extra}
    {onView && (
      <ActionButton icon={Eye} label={viewLabel} onClick={onView} className='text-primary hover:bg-primary/10 hover:text-primary' />
    )}
    {onEdit && (
      <ActionButton
        icon={Pencil}
        label={editLabel}
        onClick={onEdit}
        className='text-yellow-600 hover:bg-yellow-500/10 hover:text-yellow-600'
      />
    )}
    {onDelete && (
      <ActionButton
        icon={Trash2}
        label={deleteLabel}
        onClick={onDelete}
        className='text-red-600 hover:bg-red-500/10 hover:text-red-600'
      />
    )}
  </div>
);

// ---------------------------------------------------------------------------------------------------------------------
// Pastille d'icône cliquable (colonnes « Encaissement », « Quittance », « Plan », « Fiche »...) : un carré arrondi teinté
// plutôt qu'une petite icône grise. Désactivée (module pas encore disponible), elle reste lisible mais atténuée.
// ---------------------------------------------------------------------------------------------------------------------

const TILE_TONES = {
  green: 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:text-emerald-400',
  sky: 'bg-sky-500/10 text-sky-600 hover:bg-sky-500/20 dark:text-sky-400',
  primary: 'bg-primary/10 text-primary hover:bg-primary/20',
  amber: 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400',
  red: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400',
} as const;

export const IconTile = ({
  icon: Icon,
  label,
  tone = 'primary',
  disabled,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  tone?: keyof typeof TILE_TONES;
  disabled?: boolean;
  onClick?: () => void;
}) => {
  // Téléchargement d'un document (fiche, pièce jointe, plan) : simple icône « flèche vers le bac », sans fond,
  // à la couleur principale du thème.
  if (Icon === FileDown || Icon === FileImage) {
    return (
      <div className='flex justify-center'>
        <button
          type='button'
          title={label}
          aria-label={label}
          disabled={disabled}
          onClick={(e: MouseEvent) => {
            e.stopPropagation();
            onClick?.();
          }}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10',
            disabled && 'cursor-not-allowed opacity-50 hover:bg-transparent',
          )}
        >
          <Download className='h-5 w-5' strokeWidth={2} />
        </button>
      </div>
    );
  }
  return (
  <div className='flex justify-center'>
    <button
      type='button'
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        onClick?.();
      }}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
        TILE_TONES[tone],
        disabled && 'cursor-not-allowed opacity-70',
      )}
    >
      <Icon className='h-4 w-4' strokeWidth={1.75} />
    </button>
  </div>
  );
};

// ---------------------------------------------------------------------------------------------------------------------
// Bandeau d'indicateurs
// ---------------------------------------------------------------------------------------------------------------------

export const KpiCard = ({
  icon: Icon,
  label,
  value,
  hint,
  tone,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
  /** classes de teinte de la pastille d'icône, ex. 'bg-emerald-500/10 text-emerald-600' */
  tone: string;
}) => (
  <div className='flex items-start gap-3 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md'>
    <div className={cn('shrink-0 rounded-lg p-2.5', tone)}>
      <Icon className='h-5 w-5' />
    </div>
    <div className='min-w-0'>
      <p className='truncate text-xs font-medium text-muted-foreground'>{label}</p>
      <p className='text-2xl font-semibold leading-tight tabular-nums'>{value}</p>
      {hint && <p className='mt-0.5 truncate text-xs text-muted-foreground'>{hint}</p>}
    </div>
  </div>
);

// Colonnes selon le nombre de cartes (2, 3 ou 4) : pas de case vide quand il y a trois indicateurs.
const STRIP_COLS: Record<number, string> = {
  1: 'xl:grid-cols-1',
  2: 'xl:grid-cols-2',
  3: 'xl:grid-cols-3',
  4: 'xl:grid-cols-4',
};

export const KpiStrip = ({ children }: { children: ReactNode }) => (
  <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2', STRIP_COLS[Children.count(children)] ?? 'xl:grid-cols-4')}>
    {children}
  </div>
);

/** Teintes prêtes à l'emploi pour les pastilles d'icône des KpiCard. */
export const KPI_TONES = {
  green: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  primary: 'bg-primary/10 text-primary',
  amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  sky: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
  red: 'bg-red-500/10 text-red-600 dark:text-red-400',
} as const;
