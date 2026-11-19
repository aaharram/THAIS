import { cn } from '@/utils/lib/utils';

interface AppLogoProps {
  className?: string;
  // 'boxed' / 'bare' : pastille carrée arrondie avec le signe THAIS (le logo complet est blanc, il ne se lit
  // que sur fond sombre). 'bare' garde le même rendu : les deux ne diffèrent plus.
  // 'wordmark' : logo complet THAIS (texte + signe) sur fond sombre, pour les emplacements larges.
  variant?: 'boxed' | 'bare' | 'wordmark';
}

// Logo du client THAIS : fichiers dans public/ (logo-thais-icon.png = pastille carrée, logo-thais-blanc.png =
// logo complet à fond transparent).
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
      src='/logo-thais-icon.png'
      alt='THAIS'
      className={cn('rounded-md shrink-0 object-contain', className)}
      draggable={false}
    />
  );
}
