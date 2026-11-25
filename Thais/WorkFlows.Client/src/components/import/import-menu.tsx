import { ImportDialog } from '@/components/import/import-dialog';
import { ActionTile, DownloadBadge, ExcelGlyph, TILE_COLORS, UploadBadge } from '@/components/ui/action-tile';
import { useAppSelector } from '@/store/hooks';
import { ImportConfig, downloadImportTemplate } from '@/utils/import/import-engine';
import { useState } from 'react';

// Import d'une liste : deux boutons carrés, comme ceux de l'export — « Importer un fichier Excel » (ouvre la
// fenêtre d'import) et « Télécharger le modèle ».
export function ImportMenu({ config, onImported }: { config: ImportConfig; onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const userId = useAppSelector((state) => state.auth.auth?.id);

  return (
    <>
      <div className='flex items-center gap-2'>
        <ActionTile
          color={TILE_COLORS.orange}
          icon={ExcelGlyph}
          badge={UploadBadge}
          label='Importer un fichier Excel'
          onClick={() => setOpen(true)}
        />
        <ActionTile
          color={TILE_COLORS.violet}
          icon={ExcelGlyph}
          badge={DownloadBadge}
          label='Télécharger le modèle'
          onClick={() => downloadImportTemplate(config)}
        />
      </div>
      <ImportDialog config={config} open={open} onOpenChange={setOpen} onImported={onImported} userId={userId} />
    </>
  );
}
