/**
 * Compteur à segments : une rangée de petites cases dont une part est remplie (même langage que la façade de
 * fenêtres). Remplace les anneaux : on lit la proportion d'un coup d'œil, et la valeur exacte est à côté.
 */
export function SegmentedMeter({
  value,
  cells = 24,
  color = 'hsl(var(--primary))',
  label,
  max = 100,
}: {
  value: number;
  /** Valeur qui remplit tout le compteur (100 par défaut) */
  max?: number;
  cells?: number;
  color?: string;
  label: string;
}) {
  const pct = Math.max(0, Math.min((value / max) * 100, 100));
  const remplies = Math.round((pct / 100) * cells);

  return (
    <div
      role='meter'
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className='flex gap-[3px]'
    >
      {Array.from({ length: cells }, (_, i) => (
        <span
          key={i}
          className='h-3 flex-1 rounded-[2px]'
          style={
            i < remplies
              ? { backgroundColor: color, opacity: 0.5 + 0.5 * (i / Math.max(remplies - 1, 1)) }
              : { backgroundColor: 'hsl(var(--muted))' }
          }
        />
      ))}
    </div>
  );
}
