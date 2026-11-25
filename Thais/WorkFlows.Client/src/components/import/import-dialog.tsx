import { BaseDialog } from '@/components/dialog/dialog';
import { ExcelFileIcon } from '@/components/icons/file-icons';
import { ActionTile, DownloadBadge, ExcelGlyph, TILE_COLORS } from '@/components/ui/action-tile';
import { Button } from '@/components/ui/button';
import { cn } from '@/utils/lib/utils';
import {
  ImportColumn,
  ImportConfig,
  ImportSummary,
  ParsedFile,
  ParsedRow,
  downloadImportTemplate,
  parseImportFile,
  sendImport,
} from '@/utils/import/import-engine';
import { AlertTriangle, CheckCircle2, Info, Loader2, Upload, XCircle } from 'lucide-react';
import { useRef, useState } from 'react';

const fmtValue = (col: ImportColumn, v: string | number | boolean | null | undefined) => {
  if (v == null || v === '') return '-';
  if (col.type === 'date') return String(v).split('-').reverse().join('/');
  if (col.type === 'number') return Number(v).toFixed(2);
  if (col.type === 'bool') return v ? 'Oui' : 'Non';
  return String(v);
};

// Premier texte de la ligne (nom du locataire, de l'actif…) pour la retrouver dans la liste des problèmes.
const libelleLigne = (row: ParsedRow, config: ImportConfig) => {
  for (const key of config.previewKeys) {
    const v = row.values[key];
    if (typeof v === 'string' && v) return v;
  }
  return '';
};

// Import Excel d'une liste (THAIS) : choix du fichier -> aperçu et contrôle des lignes -> import -> résultat.
export function ImportDialog({
  config,
  open,
  onOpenChange,
  onImported,
  userId,
}: {
  config: ImportConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
  userId?: number;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [parsed, setParsed] = useState<ParsedFile | null>(null);
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportSummary | null>(null);
  const [dragging, setDragging] = useState(false);

  const reset = () => {
    setFileName('');
    setParsed(null);
    setError(null);
    setResult(null);
    setParsing(false);
    setImporting(false);
  };

  const close = (next: boolean) => {
    if (!next) {
      const imported = result != null;
      reset();
      if (imported) onImported();
    }
    onOpenChange(next);
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setParsed(null);
    setError(null);
    setParsing(true);
    try {
      setParsed(await parseImportFile(file, config));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fichier illisible.');
    } finally {
      setParsing(false);
    }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && !importing) void processFile(file);
  };

  const handleImport = async () => {
    // Message identique à RMANew (page Importation) quand aucun fichier n'a été choisi.
    if (!parsed) {
      setError("Aucun fichier n'est sélectionné. Merci de choisir un fichier Excel (.xlsx) avant de cliquer sur Importer.");
      return;
    }
    setImporting(true);
    setError(null);
    try {
      setResult(await sendImport(config, parsed.valides, userId));
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message ?? "L'import a échoué. Aucune donnée n'a été enregistrée.");
    } finally {
      setImporting(false);
    }
  };

  const previewCols = config.previewKeys
    .map((k) => config.columns.find((c) => c.key === k))
    .filter((c): c is ImportColumn => c != null);
  const nbErreurs = parsed ? parsed.rows.filter((r) => r.erreurs.length > 0).length : 0;
  const nbAvert = parsed ? parsed.rows.filter((r) => r.avertissements.length > 0).length : 0;
  const lignesProblemes = parsed ? parsed.rows.filter((r) => r.erreurs.length > 0 || r.avertissements.length > 0) : [];

  const footer = result ? (
    <Button onClick={() => close(false)}>Fermer</Button>
  ) : (
    <>
      <Button variant='outline' onClick={() => close(false)} disabled={importing}>
        Annuler
      </Button>
      <Button onClick={handleImport} disabled={importing || parsing || (parsed != null && parsed.valides.length === 0)}>
        {importing ? <Loader2 className='animate-spin' /> : <Upload />}
        {parsed ? `Importer ${parsed.valides.length} ligne(s)` : 'Importer'}
      </Button>
    </>
  );

  return (
    <BaseDialog open={open} onOpenChange={close} title={config.title} description={config.description} size='lg' footer={footer}>
      <div className='space-y-4 text-sm'>
        {!result && (
          <>
            <section className='space-y-3 rounded-2xl border bg-gradient-to-b from-primary/[0.04] to-transparent p-4'>
              <div className='flex items-center justify-between gap-3'>
                <p className='font-display text-sm font-semibold'>Colonnes attendues (ligne 1 = titres)</p>
                <span className='inline-flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground'>
                  <span className='h-2 w-2 rounded-full bg-primary' /> obligatoire
                </span>
              </div>
              <ul className='flex flex-wrap gap-1.5'>
                {config.columns.map((c) => (
                  <li
                    key={c.header}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs',
                      c.required ? 'bg-primary/10 font-medium text-primary' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {c.required && <span className='h-1.5 w-1.5 rounded-full bg-primary' />}
                    {c.header}
                  </li>
                ))}
              </ul>
              <ul className='space-y-1.5 text-xs text-muted-foreground'>
                {config.notes.map((n) => (
                  <li key={n} className='flex items-start gap-2'>
                    <Info className='mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70' />
                    <span>{n}</span>
                  </li>
                ))}
              </ul>
              <div className='flex items-center gap-2.5 border-t pt-3'>
                <ActionTile
                  color={TILE_COLORS.violet}
                  icon={ExcelGlyph}
                  badge={DownloadBadge}
                  label='Télécharger le modèle Excel'
                  onClick={() => downloadImportTemplate(config)}
                />
                <button
                  type='button'
                  onClick={() => downloadImportTemplate(config)}
                  className='text-sm font-medium text-foreground underline-offset-4 hover:underline'
                >
                  Télécharger le modèle Excel
                </button>
              </div>
            </section>

            <div
              role='button'
              tabIndex={0}
              onClick={() => !importing && inputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              className={cn(
                'group flex cursor-pointer items-center gap-4 rounded-2xl border-2 border-dashed p-4 transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
                dragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/30 hover:border-primary hover:bg-primary/5',
                fileName && !error && 'border-solid border-primary/40 bg-primary/5',
              )}
            >
              <ExcelFileIcon className='h-12 w-12 shrink-0 transition-transform group-hover:scale-105' />
              <div className='min-w-0 flex-1'>
                <p className='truncate font-medium'>{fileName || 'Choisir un fichier Excel'}</p>
                <p className='text-xs text-muted-foreground'>
                  {fileName ? 'Cliquez pour choisir un autre fichier' : 'Cliquez ou déposez un fichier .xlsx ici'}
                </p>
              </div>
              {parsing ? (
                <Loader2 className='h-5 w-5 shrink-0 animate-spin text-muted-foreground' />
              ) : (
                <span className='shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary group-hover:bg-primary/15'>
                  Parcourir
                </span>
              )}
              <input ref={inputRef} type='file' accept='.xlsx' className='hidden' onChange={handleFile} />
            </div>
          </>
        )}

        {error && (
          <div className='flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-red-700'>
            <XCircle className='mt-0.5 h-4 w-4 shrink-0' />
            <span>{error}</span>
          </div>
        )}

        {parsed && !result && (
          <div className='space-y-3'>
            <p>
              <span className='font-medium'>{parsed.rows.length}</span> ligne(s) lue(s) ·{' '}
              <span className='font-medium text-green-700'>{parsed.valides.length}</span> valide(s)
              {nbErreurs > 0 && (
                <>
                  {' '}
                  · <span className='font-medium text-red-700'>{nbErreurs}</span> avec erreur (non importées)
                </>
              )}
              {nbAvert > 0 && (
                <>
                  {' '}
                  · <span className='font-medium text-amber-700'>{nbAvert}</span> avertissement(s)
                </>
              )}
            </p>

            <div className='max-h-56 overflow-auto rounded-md border'>
              <table className='w-full text-left text-xs'>
                <thead className='sticky top-0 bg-gray-100'>
                  <tr>
                    <th className='px-2 py-1.5' />
                    {previewCols.map((c) => (
                      <th key={c.key} className='px-2 py-1.5 font-semibold'>
                        {c.label ?? c.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {parsed.rows.slice(0, 10).map((r) => (
                    <tr key={`${r.feuille}-${r.ligneExcel}`} className='border-t'>
                      <td className='px-2 py-1'>
                        {r.erreurs.length > 0 ? (
                          <XCircle className='h-4 w-4 text-red-600' />
                        ) : r.avertissements.length > 0 ? (
                          <AlertTriangle className='h-4 w-4 text-amber-600' />
                        ) : (
                          <CheckCircle2 className='h-4 w-4 text-green-600' />
                        )}
                      </td>
                      {previewCols.map((c) => (
                        <td key={c.key} className='px-2 py-1'>
                          {fmtValue(c, r.values[c.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsed.rows.length > 10 && (
              <p className='text-xs text-muted-foreground'>… et {parsed.rows.length - 10} autre(s) ligne(s).</p>
            )}

            {lignesProblemes.length > 0 && (
              <ul className='max-h-32 space-y-1 overflow-auto rounded-md border bg-gray-50 p-3 text-xs'>
                {lignesProblemes.slice(0, 15).map((r) => (
                  <li key={`${r.feuille}-${r.ligneExcel}`}>
                    <span className='font-medium'>
                      {r.feuille}, ligne {r.ligneExcel}
                      {libelleLigne(r, config) ? ` (${libelleLigne(r, config)})` : ''} :
                    </span>{' '}
                    <span className={r.erreurs.length > 0 ? 'text-red-700' : 'text-amber-700'}>
                      {[...r.erreurs, ...r.avertissements].join(' ')}
                    </span>
                  </li>
                ))}
                {lignesProblemes.length > 15 && <li>… et {lignesProblemes.length - 15} autre(s).</li>}
              </ul>
            )}
          </div>
        )}

        {result && (
          <div className='space-y-3'>
            <div className='flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3 text-green-800'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0' />
              <div>
                <p className='font-medium'>Import terminé.</p>
                {result.lignes.map((l) => (
                  <p key={l}>{l}</p>
                ))}
              </div>
            </div>
            {result.ignorees.length > 0 && (
              <div>
                <p className='mb-1 font-medium'>{result.ignorees.length} ligne(s) ignorée(s) :</p>
                <ul className='max-h-32 space-y-1 overflow-auto rounded-md border bg-gray-50 p-3 text-xs'>
                  {result.ignorees.slice(0, 20).map((i) => (
                    <li key={`${i.ligne}-${i.libelle}`}>
                      Ligne {i.ligne} {i.libelle ? `(${i.libelle})` : ''} : {i.message}
                    </li>
                  ))}
                  {result.ignorees.length > 20 && <li>… et {result.ignorees.length - 20} autre(s).</li>}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </BaseDialog>
  );
}
