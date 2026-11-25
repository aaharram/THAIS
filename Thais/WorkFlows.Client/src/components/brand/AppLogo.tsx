import { cn } from '@/utils/lib/utils';

interface AppLogoProps {
  className?: string;
  // 'boxed' / 'bare' : le signe THAIS seul (triangle framboise en dégradé, creux blanc), sans fond, lisible sur
  // fond clair. 'bare' garde le même rendu : les deux ne diffèrent plus.
  // 'wordmark' : logo complet THAIS (texte + signe) sur fond sombre, pour les emplacements larges.
  variant?: 'boxed' | 'bare' | 'wordmark';
}

// Logo du client THAIS : fichiers dans public/ (logo-thais-triangle.svg = signe seul, logo-thais-blanc.png =
// logo complet blanc à fond transparent).
export function AppLogo({ className, variant = 'boxed' }: AppLogoProps) {
  if (variant === 'wordmark') {
    return (
      <div className={cn('flex items-center justify-center rounded-xl bg-[#1b1b3a] px-4 py-3', className)}>
        <img src='/logo-thais-blanc.png' alt='THAIS' className='w-full h-auto' draggable={false} />
      </div>
    );
  }

  return (
    <img
      src='/logo-thais-triangle.svg'
      alt='THAIS'
      className={cn('shrink-0 object-contain', className)}
      draggable={false}
    />
  );
}
