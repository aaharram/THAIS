// Icône « tableau de bord » de RMANew : le glyphe Font Awesome 4 « tachometer » (f0e4), extrait de
// plugins/font-awesome/fonts/fontawesome-webfont.svg de RMANew pour obtenir exactement le même
// dessin (cadran plein, repères et aiguille). La bibliothèque d'icônes de Smart Building (lucide)
// n'a que des compteurs en contour.
// Le tracé est dans le repère de la police (axe y vers le haut) : le groupe est retourné.
// L'icône suit currentColor, donc elle prend la couleur du menu (actif ou non).
export const DashboardIcon = ({
  className,
  size = 24,
}: {
  className?: string;
  size?: number | string;
}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    viewBox='0 -1280 1792 1408'
    width={size}
    height={size}
    className={className}
    fill='currentColor'
    aria-hidden='true'
  >
    <g transform='scale(1 -1)'>
      <path d='M384 384q0 53 -37.5 90.5t-90.5 37.5t-90.5 -37.5t-37.5 -90.5t37.5 -90.5t90.5 -37.5t90.5 37.5t37.5 90.5zM576 832q0 53 -37.5 90.5t-90.5 37.5t-90.5 -37.5t-37.5 -90.5t37.5 -90.5t90.5 -37.5t90.5 37.5t37.5 90.5zM1004 351l101 382q6 26 -7.5 48.5t-38.5 29.5t-48 -6.5t-30 -39.5l-101 -382q-60 -5 -107 -43.5t-63 -98.5q-20 -77 20 -146t117 -89t146 20t89 117q16 60 -6 117t-72 91zM1664 384q0 53 -37.5 90.5t-90.5 37.5t-90.5 -37.5t-37.5 -90.5t37.5 -90.5t90.5 -37.5t90.5 37.5t37.5 90.5zM1024 1024q0 53 -37.5 90.5t-90.5 37.5t-90.5 -37.5t-37.5 -90.5t37.5 -90.5t90.5 -37.5t90.5 37.5t37.5 90.5zM1472 832q0 53 -37.5 90.5t-90.5 37.5t-90.5 -37.5t-37.5 -90.5t37.5 -90.5t90.5 -37.5t90.5 37.5t37.5 90.5zM1792 384q0 -261 -141 -483q-19 -29 -54 -29h-1402q-35 0 -54 29q-141 221 -141 483q0 182 71 348t191 286t286 191t348 71t348 -71t286 -191t191 -286t71 -348z' />
    </g>
  </svg>
);
