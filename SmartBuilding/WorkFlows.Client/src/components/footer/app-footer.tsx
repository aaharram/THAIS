import { COMPANY_NAME, COMPANY_URL } from '@/components/brand/company';

// Bas de page de l'application (sous le contenu de chaque écran) : mention centrée, texte gris et
// nom de la société en gras bleu marine, comme le pied du menu latéral.
const AppFooter = () => {
  return (
    <footer className='flex min-h-[4.5rem] items-center justify-center bg-sidebar px-4 text-center text-xs text-[#7B8794]'>
      <p>
        Copyright &copy; {new Date().getFullYear()}{' '}
        <a
          href={COMPANY_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='font-semibold text-[#1D3F72] hover:underline'
        >
          {COMPANY_NAME}
        </a>
        . Tous droits réservés.
      </p>
    </footer>
  );
};

export default AppFooter;
