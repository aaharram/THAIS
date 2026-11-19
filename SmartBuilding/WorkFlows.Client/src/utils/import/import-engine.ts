import { API_BASE_URL } from '@/store/services/api';
import { api } from '@/store/services/authConfig';
import { SHEETS_IGNORED_BY_IMPORT, buildTemplateWorkbook } from './import-template';

// Moteur d'import Excel des listes de THAIS. Même principe que les imports de RMANew (page
// « Importation » : un fichier Excel à colonnes fixes, titres en ligne 1, lecture par position).
// Chaque liste est décrite par une ImportConfig (voir import-configs.ts) ; le fichier est lu dans le
// navigateur, contrôlé ligne par ligne, puis seules les lignes valides sont envoyées au serveur.

export type ImportValue = string | number | boolean | null;
export type ColumnType = 'text' | 'number' | 'int' | 'date' | 'bool';

export interface ImportColumn {
  key: string; // nom du champ envoyé au serveur
  header: string; // titre de la colonne dans le fichier Excel
  label?: string; // libellé court pour les messages (par défaut : header)
  type: ColumnType;
  required?: boolean;
}

export interface ImportIssue {
  ligne: number;
  libelle: string;
  message: string;
}

export interface ImportSummary {
  lignes: string[]; // phrases du compte rendu (« 12 local(aux) créé(s). »)
  ignorees: ImportIssue[];
}

export interface ImportConfig {
  id: string;
  title: string; // titre de la fenêtre
  description: string;
  endpoint: string; // route de l'API, sans le préfixe de l'API
  templateFileName: string;
  sheetName: string;
  firstHeaderKeyword: string; // la cellule A1 doit contenir ce mot (contrôle que le fichier suit le modèle)
  columns: ImportColumn[];
  previewKeys: string[]; // colonnes affichées dans l'aperçu
  notes: string[]; // instructions (feuille « Instructions » du modèle et texte de la fenêtre)
  exemple?: (string | number)[]; // une ligne d'exemple (feuille « Exemple » du modèle, ignorée par l'import)
  validateRow?: (values: Record<string, ImportValue>) => string[];
  summarize: (result: unknown) => ImportSummary;
}

export interface ParsedRow {
  feuille: string;
  ligneExcel: number; // numéro de ligne dans le fichier (titres = ligne 1)
  values: Record<string, ImportValue>;
  erreurs: string[];
  avertissements: string[];
}

export interface ParsedFile {
  rows: ParsedRow[];
  valides: ParsedRow[];
}

type CellValue = string | number | boolean | Date | null | undefined | { richText?: { text: string }[]; result?: unknown; text?: unknown };

const cellText = (c: CellValue): string => {
  if (c == null) return '';
  if (c instanceof Date) return c.toISOString().slice(0, 10);
  if (typeof c === 'object') {
    if (c.richText) return c.richText.map((r) => r.text).join('').replace(/\s+/g, ' ').trim();
    return String(c.result ?? c.text ?? '').replace(/\s+/g, ' ').trim();
  }
  return String(c).replace(/\s+/g, ' ').trim();
};

const pad = (n: number) => String(n).padStart(2, '0');
const labelOf = (col: ImportColumn) => col.label ?? col.header;

// Date Excel (vraie date) ou texte jj/mm/aaaa. Un jour inexistant (ex. 29/02/2029) est ramené au dernier
// jour du mois avec un avertissement, comme l'import initial des données de CFC.
const parseDate = (c: CellValue, col: ImportColumn, row: ParsedRow): string | null => {
  if (c == null || c === '') return null;
  if (c instanceof Date) return Number.isNaN(c.getTime()) ? null : c.toISOString().slice(0, 10);
  const s = cellText(c);
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) {
    row.erreurs.push(`${labelOf(col)} : « ${s} » n'est pas une date valide (format attendu jj/mm/aaaa).`);
    return null;
  }
  const jour = Number(m[1]);
  const mois = Number(m[2]);
  const annee = Number(m[3]);
  if (mois < 1 || mois > 12 || jour < 1) {
    row.erreurs.push(`${labelOf(col)} : « ${s} » n'est pas une date valide.`);
    return null;
  }
  const dernierJour = new Date(annee, mois, 0).getDate();
  if (jour > dernierJour) {
    row.avertissements.push(`${labelOf(col)} : ${s} n'existe pas, ramenée au ${dernierJour}/${pad(mois)}/${annee}.`);
  }
  return `${annee}-${pad(mois)}-${pad(Math.min(jour, dernierJour))}`;
};

const parseNombre = (c: CellValue, col: ImportColumn, row: ParsedRow): number | null => {
  const s = cellText(c).replace(/\s/g, '').replace(',', '.');
  if (!s) return null;
  const n = Number(s);
  if (Number.isNaN(n)) {
    row.erreurs.push(`${labelOf(col)} : « ${cellText(c)} » n'est pas un nombre.`);
    return null;
  }
  return n;
};

const parseBool = (c: CellValue, col: ImportColumn, row: ParsedRow): boolean | null => {
  if (typeof c === 'boolean') return c;
  const s = cellText(c).toLowerCase();
  if (!s) return null;
  if (['oui', 'o', 'vrai', 'true', '1', 'x', 'yes'].includes(s)) return true;
  if (['non', 'n', 'faux', 'false', '0', 'no'].includes(s)) return false;
  row.erreurs.push(`${labelOf(col)} : « ${cellText(c)} » doit être Oui ou Non.`);
  return null;
};

const parseCell = (c: CellValue, col: ImportColumn, row: ParsedRow): ImportValue => {
  switch (col.type) {
    case 'number':
      return parseNombre(c, col, row);
    case 'int': {
      const n = parseNombre(c, col, row);
      return n == null ? null : Math.round(n);
    }
    case 'date':
      return parseDate(c, col, row);
    case 'bool':
      return parseBool(c, col, row);
    default:
      return cellText(c) || null;
  }
};

export async function parseImportFile(file: File, config: ImportConfig): Promise<ParsedFile> {
  if (!/\.xlsx$/i.test(file.name)) {
    throw new Error('Format non supporté : choisissez un fichier Excel .xlsx.');
  }
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(await file.arrayBuffer());
  } catch {
    throw new Error("Le fichier n'a pas pu être lu : est-il bien un fichier Excel (.xlsx) valide ?");
  }

  const rows: ParsedRow[] = [];
  let feuillesLues = 0;
  for (const ws of workbook.worksheets) {
    if (ws.state !== 'visible' || SHEETS_IGNORED_BY_IMPORT.test(ws.name)) continue;
    const entete = cellText(ws.getRow(1).getCell(1).value as CellValue).toLowerCase();
    if (!entete.includes(config.firstHeaderKeyword.toLowerCase())) {
      throw new Error(
        `La feuille « ${ws.name} » ne respecte pas le modèle : la cellule A1 doit contenir « ${config.columns[0].header} ». Téléchargez le modèle Excel pour voir les colonnes attendues.`,
      );
    }
    feuillesLues++;
    ws.eachRow((excelRow, numero) => {
      if (numero === 1) return;
      const cells = config.columns.map((_, i) => excelRow.getCell(i + 1).value as CellValue);
      if (cells.every((c) => cellText(c) === '')) return;

      const row: ParsedRow = { feuille: ws.name, ligneExcel: numero, values: {}, erreurs: [], avertissements: [] };
      config.columns.forEach((col, i) => {
        row.values[col.key] = parseCell(cells[i], col, row);
      });
      config.columns.forEach((col) => {
        const v = row.values[col.key];
        const dejaSignale = row.erreurs.some((e) => e.startsWith(labelOf(col)));
        if (col.required && (v == null || v === '') && !dejaSignale) {
          row.erreurs.push(`« ${labelOf(col)} » est obligatoire.`);
        }
      });
      row.erreurs.push(...(config.validateRow?.(row.values) ?? []));
      rows.push(row);
    });
  }

  if (feuillesLues === 0) throw new Error('Le fichier ne contient aucune feuille à importer.');
  if (rows.length === 0) throw new Error('Le fichier ne contient aucune ligne de données.');
  return { rows, valides: rows.filter((r) => r.erreurs.length === 0) };
}

const download = (blob: Blob, name: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
};

// Modèle Excel d'une liste (titres, instructions, exemple) : voir import-template.ts.
export async function downloadImportTemplate(config: ImportConfig) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = buildTemplateWorkbook(ExcelJS, config);
  const buffer = await workbook.xlsx.writeBuffer();
  download(
    new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    config.templateFileName,
  );
}

export async function sendImport(config: ImportConfig, rows: ParsedRow[], addUser?: number): Promise<ImportSummary> {
  const { data } = await api.post<unknown>(`${API_BASE_URL}${config.endpoint}`, {
    addUser,
    lignes: rows.map((r) => r.values),
  });
  return config.summarize(data);
}
