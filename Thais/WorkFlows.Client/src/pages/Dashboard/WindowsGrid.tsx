import type { DashboardLocalResponse } from '@/store/features/dashboard/dashboard-schemas';
import { cn } from '@/utils/lib/utils';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { useMemo } from 'react';

const fmtMAD = (m: number) =>
  `${m.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD`;

// Infobulle d'une fenêtre : le local qu'elle représente (occupé ou vacant) et, s'il est loué, son locataire et son loyer.
function DetailLocal({ local }: { local: DashboardLocalResponse }) {
  const lignes: [string, string][] = [];
  if (local.actif) lignes.push(['Actif', local.actif]);
  if (local.type) lignes.push(['Type', local.type]);
  if (local.etage) lignes.push(['Étage', local.etage]);
  if (local.surface) lignes.push(['Surface', `${local.surface.toLocaleString('fr-FR')} m²`]);
  if (local.occupe && local.locataire) lignes.push(['Locataire', local.locataire]);
  if (local.occupe && local.loyer) lignes.push(['Loyer', `${fmtMAD(local.loyer)} / mois`]);

  // Même présentation que l'infobulle du graphique « Quittancés vs Encaissés » : titre en gras, puis une ligne
  // « Libellé : valeur » par information, dans la couleur du thème.
  return (
    <div className='min-w-[170px] max-w-[280px] text-xs'>
      <p className='font-semibold text-popover-foreground'>{local.designation}</p>
      <ul className='mt-2 space-y-1.5' style={{ color: 'hsl(var(--primary))' }}>
        <li>Statut : {local.occupe ? 'Occupé' : 'Vacant'}</li>
        {lignes.map(([cle, valeur]) => (
          <li key={cle}>
            {cle} : {valeur}
          </li>
        ))}
      </ul>
    </div>
  );
}

const pgcd = (a: number, b: number): number => (b === 0 ? a : pgcd(b, a % b));

// Choisit le nombre de colonnes de la façade : proche d'une forme large (≈ 1,7 fois plus large que haute), de
// préférence un diviseur du nombre de locaux pour que la dernière rangée soit pleine (78 locaux -> 13 x 6).
function choisirColonnes(n: number): number {
  const cible = Math.sqrt(n * 1.7);
  let meilleur = Math.min(16, Math.max(6, Math.round(cible)));
  let meilleurScore = -Infinity;
  for (let c = 6; c <= 16; c += 1) {
    const reste = n % c;
    const remplissage = reste === 0 ? 1 : reste / c; // part de la dernière rangée occupée
    const score = remplissage * 3 - Math.abs(c - cible) * 0.6;
    if (score > meilleurScore) {
      meilleurScore = score;
      meilleur = c;
    }
  }
  return meilleur;
}

// Ordre dans lequel les fenêtres s'allument : une permutation qui disperse les fenêtres allumées sur toute la
// façade (comme un immeuble le soir) au lieu de remplir la grille ligne par ligne. Le pas est premier avec le
// nombre de fenêtres, donc chaque fenêtre apparaît exactement une fois.
function ordreAllumage(total: number): number[] {
  if (total <= 1) return Array.from({ length: total }, (_, i) => i);
  let pas = Math.max(1, Math.round(total * 0.618));
  while (pas % total === 0 || pgcd(pas, total) !== 1) pas += 1;
  return Array.from({ length: total }, (_, k) => (k * pas) % total);
}

/**
 * Façade de l'immeuble : une fenêtre par local, allumée quand le local est occupé.
 * Sur un périmètre sans local, on dessine une façade éteinte.
 */
export function WindowsGrid({
  total,
  occupied,
  locaux = [],
}: {
  total: number;
  occupied: number;
  /** Détail des locaux, occupés d'abord : la fenêtre de rang k porte le k-ième local (infobulle au survol). */
  locaux?: DashboardLocalResponse[];
}) {
  const vide = total <= 0;
  const n = vide ? 40 : total;
  const allumees = vide ? 0 : Math.max(0, Math.min(occupied, total));
  const colonnes = choisirColonnes(n);

  // rang[i] = position de la fenêtre i dans l'ordre d'allumage
  const rang = useMemo(() => {
    const resultat = new Array<number>(n);
    ordreAllumage(n).forEach((fenetre, k) => {
      resultat[fenetre] = k;
    });
    return resultat;
  }, [n]);

  return (
    <div
      role='img'
      aria-label={vide ? 'Aucun local dans ce périmètre' : `${allumees} locaux occupés sur ${total}`}
      className='ml-auto w-full max-w-[540px] rounded-2xl border border-white/15 bg-white/[0.06] p-3 backdrop-blur-sm'
    >
      <TooltipPrimitive.Provider delayDuration={0} skipDelayDuration={300}>
        <div className='grid gap-1' style={{ gridTemplateColumns: `repeat(${colonnes}, minmax(0, 1fr))` }}>
          {Array.from({ length: n }, (_, i) => {
            const allumee = rang[i] < allumees;
            // Les locaux sont triés occupés d'abord, comme l'ordre d'allumage : rang k -> k-ième local.
            const local = !vide && locaux.length === total ? locaux[rang[i]] : undefined;
            const fenetre = (
              <span
                className={cn(
                  'aspect-[3/4] rounded-[2px] transition-transform',
                  allumee ? 'dash-window-lit' : 'bg-white/10',
                  local && 'cursor-pointer hover:scale-110 hover:ring-2 hover:ring-white/70',
                )}
                style={
                  allumee
                    ? {
                        backgroundColor: 'hsl(var(--lit))',
                        boxShadow: '0 0 14px hsl(var(--lit) / 0.65)',
                        animationDelay: `${Math.min(rang[i] * 14, 900)}ms`,
                      }
                    : undefined
                }
              />
            );
            if (!local) return <span key={i} className='contents'>{fenetre}</span>;
            return (
              <TooltipPrimitive.Root key={i}>
                <TooltipPrimitive.Trigger asChild>{fenetre}</TooltipPrimitive.Trigger>
                <TooltipPrimitive.Portal>
                  <TooltipPrimitive.Content
                    side='top'
                    sideOffset={8}
                    collisionPadding={12}
                    className='z-50 shadow-xl animate-in fade-in-0 zoom-in-95'
                    style={{
                      borderRadius: 12,
                      padding: '10px 14px',
                      background: 'hsl(var(--popover))',
                      color: 'hsl(var(--popover-foreground))',
                      border: '1px solid hsl(var(--border))',
                    }}
                  >
                    <DetailLocal local={local} />
                  </TooltipPrimitive.Content>
                </TooltipPrimitive.Portal>
              </TooltipPrimitive.Root>
            );
          })}
        </div>
      </TooltipPrimitive.Provider>

      {/* Légende : même couleur que les fenêtres (rose allumé = occupé, gris éteint = vacant). */}
      <div className='mt-3 flex items-center justify-center gap-5 text-xs text-white/80'>
        <span className='flex items-center gap-1.5'>
          <span
            className='h-2.5 w-2.5 rounded-full'
            style={{ backgroundColor: 'hsl(var(--lit))', boxShadow: '0 0 8px hsl(var(--lit) / 0.65)' }}
          />
          Occupé
        </span>
        <span className='flex items-center gap-1.5'>
          <span className='h-2.5 w-2.5 rounded-full bg-white/30' />
          Vacant
        </span>
      </div>
    </div>
  );
}
