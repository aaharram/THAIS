import { ActionTile, DownloadBadge, ExcelGlyph, PdfGlyph, TILE_COLORS } from '@/components/ui/action-tile';
import { setToastOpen } from '@/store/features/toast/toastSlice';
import { useAppDispatch } from '@/store/hooks';
import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { useState } from 'react';

/** Récupère toutes les pages d'une liste de l'API (100 lignes par appel) avec la recherche et les filtres de l'écran. */
export async function fetchAllPages<T>(
  endpoint: string,
  search?: string,
  filters?: Record<string, (number | string)[]>,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let total = 0;
  do {
    const params = new URLSearchParams({ pageNumber: String(page), pageSize: '100' });
    if (search) params.append('search', search);
    Object.entries(filters ?? {}).forEach(([field, values], i) => {
      params.append(`Filters[${i}].Field`, field);
      values.forEach((value, j) => params.append(`Filters[${i}].Values[${j}]`, String(value)));
    });
    const { data } = await api.get<{ items: T[]; totalCount: number }>(`${API_BASE_URL}${endpoint}?${params.toString()}`);
    all.push(...data.items);
    total = data.totalCount;
    page += 1;
  } while (all.length < total && page < 1000);
  return all;
}

export interface ExportMenuProps {
  /** Nom du fichier (sans extension), de la feuille Excel et titre du PDF : « Contrats » -> Contrats-2026-11-20.xlsx */
  fileName: string;
  /** Titre affiché en haut du PDF (par défaut : « Liste - <fileName> ») */
  pdfTitle?: string;
  header: string[];
  /** Appelée à chaque export : renvoie toutes les lignes (déjà mises en forme en texte), pas seulement la page affichée. */
  getRows: () => Promise<string[][]>;
  /** Largeurs et alignements du PDF par index de colonne ; sans cela, le tableau se répartit automatiquement. */
  pdfColumnStyles?: Record<number, { cellWidth?: number; halign?: 'left' | 'center' | 'right' }>;
}

/** Boutons d'export (PDF bleu, Excel vert) de la barre d'outils d'une liste. */
export function ExportMenu({ fileName, pdfTitle, header, getRows, pdfColumnStyles }: ExportMenuProps) {
  const dispatch = useAppDispatch();
  const [busy, setBusy] = useState<'pdf' | 'excel' | null>(null);
  const stamp = new Date().toISOString().slice(0, 10);

  const run = async (kind: 'pdf' | 'excel', fn: (rows: string[][]) => Promise<void>) => {
    setBusy(kind);
    try {
      await fn(await getRows());
    } catch (error) {
      // Sans ce message, un échec (API injoignable, session expirée...) ne laissait aucune trace à l'écran.
      console.error('Export impossible :', error);
      dispatch(setToastOpen({ isOpen: true, error: "L'export a échoué. Vérifiez la connexion puis réessayez." }));
    } finally {
      setBusy(null);
    }
  };

  const toExcel = () =>
    run('excel', async (rows) => {
      const ExcelJS = (await import('exceljs')).default;
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet(fileName.slice(0, 31));
      sheet.addRow(header).font = { bold: true };
      rows.forEach((row) => sheet.addRow(row));
      sheet.columns.forEach((column) => {
        column.width = 22;
      });
      const buffer = await workbook.xlsx.writeBuffer();
      const url = URL.createObjectURL(
        new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}-${stamp}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
    });

  const toPdf = () =>
    run('pdf', async (rows) => {
      const { default: JsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      const doc = new JsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.text(pdfTitle ?? `Liste - ${fileName}`, doc.internal.pageSize.getWidth() / 2, 14, { align: 'center' });
      autoTable(doc, {
        startY: 22,
        head: [header],
        body: rows,
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8, cellPadding: 1.8, valign: 'middle', overflow: 'linebreak' },
        headStyles: { fillColor: [160, 160, 160], textColor: 255, fontStyle: 'bold' },
        columnStyles: pdfColumnStyles,
      });
      doc.save(`${fileName}-${stamp}.pdf`);
    });

  return (
    <div className='order-3 flex items-center gap-2'>
      <ActionTile
        color={TILE_COLORS.bleu}
        icon={PdfGlyph}
        badge={DownloadBadge}
        label='Exporter en PDF'
        onClick={toPdf}
        busy={busy === 'pdf'}
        disabled={busy !== null}
      />
      <ActionTile
        color={TILE_COLORS.vert}
        icon={ExcelGlyph}
        badge={DownloadBadge}
        label='Exporter en Excel'
        onClick={toExcel}
        busy={busy === 'excel'}
        disabled={busy !== null}
      />
    </div>
  );
}
