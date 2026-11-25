import { ActionTile, DownloadBadge, ExcelGlyph, PdfGlyph, TILE_COLORS } from '@/components/ui/action-tile';
import { useState } from 'react';

type Handler = () => void | Promise<unknown>;

/**
 * Boutons d'export d'une page (PDF bleu, Excel vert) : remplace le menu déroulant « Export ». Chaque bouton appelle
 * le gestionnaire de la page ; s'il est asynchrone, le bouton affiche un indicateur le temps de l'export.
 */
export function ExportTiles({ onPdf, onExcel }: { onPdf?: Handler; onExcel?: Handler }) {
  const [busy, setBusy] = useState<'pdf' | 'excel' | null>(null);

  const run = async (kind: 'pdf' | 'excel', fn: Handler) => {
    setBusy(kind);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className='flex items-center gap-2'>
      {onPdf && (
        <ActionTile
          color={TILE_COLORS.bleu}
          icon={PdfGlyph}
          badge={DownloadBadge}
          label='Exporter en PDF'
          onClick={() => run('pdf', onPdf)}
          busy={busy === 'pdf'}
          disabled={busy !== null}
        />
      )}
      {onExcel && (
        <ActionTile
          color={TILE_COLORS.vert}
          icon={ExcelGlyph}
          badge={DownloadBadge}
          label='Exporter en Excel'
          onClick={() => run('excel', onExcel)}
          busy={busy === 'excel'}
          disabled={busy !== null}
        />
      )}
    </div>
  );
}
