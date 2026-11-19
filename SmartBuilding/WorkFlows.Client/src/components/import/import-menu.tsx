import { ExcelFileIcon } from '@/components/icons/file-icons';
import { ImportDialog } from '@/components/import/import-dialog';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppSelector } from '@/store/hooks';
import { ImportConfig, downloadImportTemplate } from '@/utils/import/import-engine';
import { ChevronDown, Upload } from 'lucide-react';
import { useState } from 'react';

// Bouton « Import » d'une liste, présenté comme le menu Export des autres listes : un menu avec
// « Importer un fichier Excel » (ouvre la fenêtre d'import) et « Télécharger le modèle ».
export function ImportMenu({ config, onImported }: { config: ImportConfig; onImported: () => void }) {
  const [open, setOpen] = useState(false);
  const userId = useAppSelector((state) => state.auth.auth?.id);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant='outline' className='h-8'>
            <Upload className='mr-2 h-4 w-4' />
            Import
            <ChevronDown className='ml-2 h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuItem onClick={() => setOpen(true)} className='gap-2'>
            <ExcelFileIcon className='h-6 w-6' />
            Importer un fichier Excel
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => downloadImportTemplate(config)} className='gap-2'>
            <ExcelFileIcon className='h-6 w-6' />
            Télécharger le modèle
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ImportDialog config={config} open={open} onOpenChange={setOpen} onImported={onImported} userId={userId} />
    </>
  );
}
