import { COMPANY_NAME, COMPANY_URL } from '@/components/brand/company';

// Pied du menu latéral : deux lignes (mention de droits en gris puis nom de la
// société en gras bleu marine, centré sous elle), sur le même modèle que le bas de page (AppFooter).
const Footer = () => {
  return (
    // px-4 : le bouton « Déconnexion » a 16 px de marge interne (p-4) dans le pied de menu (p-2),
    // son icône est donc à 24 px du bord ; le texte part au même endroit pour être aligné dessus.
    <div className='flex min-h-[3.5rem] items-center px-4 text-xs leading-tight'>
      {/* Le nom est centré sous la mention de droits : le bloc ne fait que la largeur de cette mention. */}
      <div className='flex flex-col items-center gap-0.5'>
        <span className='text-[#7B8794]'>&copy; {new Date().getFullYear()} – Tous droits réservés.</span>
        <a
          href={COMPANY_URL}
          target='_blank'
          rel='noopener noreferrer'
          className='font-semibold text-primary hover:underline'
        >
          {COMPANY_NAME}
        </a>
      </div>
    </div>
  );
};

export default Footer;
