import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { THEMES, useTheme } from '@/utils/theme/theme';
import { Check, ChevronDown } from 'lucide-react';

/**
 * Choix du thème (THAIS / Bleu classique / Sombre) pour les écrans sans menu de compte, comme la page de connexion.
 * Même liste et même mémorisation que « Apparence » dans le menu de l'utilisateur (utils/theme/theme.ts).
 * Les couleurs du bouton sont écrites directement : il se pose sur le fond clair de la page de connexion, y compris
 * quand le thème Sombre est actif, et ne doit donc pas suivre les couleurs du thème.
 */
export function ThemePicker({ className }: { className?: string }) {
  const { theme, choose } = useTheme();
  const courant = THEMES.find((t) => t.id === theme) ?? THEMES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type='button'
          aria-label="Choisir l'apparence"
          className={
            'inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium shadow-sm backdrop-blur transition-colors ' +
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a81254]/40 ' +
            (className ?? '')
          }
          style={{ backgroundColor: 'rgba(255,255,255,0.85)', borderColor: 'rgba(148,163,184,0.5)', color: '#334155' }}
        >
          <span
            className='h-4 w-4 rounded-full border border-black/10'
            style={{ backgroundColor: courant.swatch }}
            aria-hidden='true'
          />
          Apparence
          <ChevronDown className='h-4 w-4' style={{ color: '#64748b' }} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' sideOffset={6} className='w-52 rounded-xl p-1.5 shadow-lg'>
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            className='cursor-pointer gap-3 rounded-md px-2 py-2 text-sm font-medium focus:bg-primary/10 focus:text-primary'
            onSelect={(e) => {
              e.preventDefault(); // le menu reste ouvert pour essayer plusieurs thèmes
              choose(t.id);
            }}
          >
            <span
              className={`h-5 w-5 rounded-full shadow-sm ${
                t.id === 'sombre' && theme === 'sombre' ? 'border-2 border-primary' : 'border border-black/10'
              }`}
              style={{ backgroundColor: t.swatch }}
            />
            <span className='flex-1'>{t.label}</span>
            {theme === t.id && <Check className='h-4 w-4 text-primary' />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
