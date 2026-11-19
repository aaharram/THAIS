// Icônes de type "fiche fichier" (page + coin replié + bandeau de format), plus proches du
// rendu réel RMANew (fa-file-pdf-o/fa-file-excel-o dans rma-list-modern.css) qu'un simple
// glyphe générique dans un badge carré.
export const PdfFileIcon = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 32 32' className={className} fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M7 2h12l7 7v19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z'
      fill='#FEF2F2'
      stroke='#EF4444'
      strokeWidth='1.5'
    />
    <path d='M19 2v6a1 1 0 0 0 1 1h6' fill='none' stroke='#EF4444' strokeWidth='1.5' />
    <rect x='3' y='18' width='21' height='10' rx='2' fill='#EF4444' />
    <text x='13.5' y='25.6' fontSize='8' fontWeight='700' fill='#fff' textAnchor='middle' fontFamily='Arial, sans-serif'>
      PDF
    </text>
  </svg>
);

export const ExcelFileIcon = ({ className }: { className?: string }) => (
  <svg viewBox='0 0 32 32' className={className} fill='none' xmlns='http://www.w3.org/2000/svg'>
    <path
      d='M7 2h12l7 7v19a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z'
      fill='#F0FDF4'
      stroke='#16A34A'
      strokeWidth='1.5'
    />
    <path d='M19 2v6a1 1 0 0 0 1 1h6' fill='none' stroke='#16A34A' strokeWidth='1.5' />
    <rect x='3' y='18' width='21' height='10' rx='2' fill='#16A34A' />
    <text x='13.5' y='25.6' fontSize='8' fontWeight='700' fill='#fff' textAnchor='middle' fontFamily='Arial, sans-serif'>
      XLS
    </text>
  </svg>
);
