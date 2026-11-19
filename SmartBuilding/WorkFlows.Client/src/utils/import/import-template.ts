import type { ImportConfig } from './import-engine';

// Fabrication du modèle Excel d'une liste, sans aucune dépendance au navigateur : utilisée à la fois par
// le bouton « Télécharger le modèle » de l'application et par le script qui prépare les modèles à envoyer
// aux clients (E-Lease/import/generate-templates.js). Un seul code, donc des fichiers toujours identiques.

type ExcelLib = { Workbook: typeof import('exceljs').Workbook };

// Feuilles ignorées par l'import (ce ne sont pas des données).
export const SHEETS_IGNORED_BY_IMPORT = /^(instructions|exemple)$/i;

const ROUGE_CLAIR = 'FFFFF2CC'; // titre d'une colonne obligatoire
const GRIS_CLAIR = 'FFE7E6E6'; // titre d'une colonne facultative

export function buildTemplateWorkbook(ExcelJS: ExcelLib, config: ImportConfig) {
  const workbook = new ExcelJS.Workbook();
  const titre = (c: ImportConfig['columns'][number]) => (c.required ? `${c.header} *` : c.header);

  // --- Feuille de saisie : seulement les titres (aucune ligne d'exemple, pour qu'elle ne soit jamais importée par erreur)
  const sheet = workbook.addWorksheet(config.sheetName, { views: [{ state: 'frozen', ySplit: 1 }] });
  const header = sheet.addRow(config.columns.map(titre));
  header.font = { bold: true };
  header.alignment = { wrapText: true, vertical: 'middle' };
  header.height = 42;
  config.columns.forEach((col, i) => {
    const colonne = sheet.getColumn(i + 1);
    colonne.width = Math.min(Math.max(titre(col).length + 4, 16), 40);
    if (col.type === 'date') colonne.numFmt = 'dd/mm/yyyy';
    header.getCell(i + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: col.required ? ROUGE_CLAIR : GRIS_CLAIR } };
    if (col.type === 'bool') {
      for (let r = 2; r <= 1000; r++) {
        sheet.getCell(r, i + 1).dataValidation = { type: 'list', allowBlank: true, formulae: ['"Oui,Non"'] };
      }
    }
  });

  // --- Instructions
  const aide = workbook.addWorksheet('Instructions');
  aide.getColumn(1).width = 120;
  const obligatoires = config.columns.filter((c) => c.required).map((c) => c.header);
  [
    `${config.title} — une ligne par élément. Remplissez la feuille « ${config.sheetName} » en gardant la ligne de titres telle quelle.`,
    '',
    obligatoires.length
      ? `Colonnes obligatoires (titre sur fond jaune, marquées *) : ${obligatoires.join(', ')}.`
      : 'Aucune colonne n’est obligatoire individuellement : voir les règles ci-dessous.',
    ...config.notes,
    'Dates : au format jj/mm/aaaa (ou vraies dates Excel). Nombres : avec une virgule ou un point pour les décimales.',
    'Un élément déjà présent est ignoré : vous pouvez réimporter le même fichier sans créer de doublons.',
    'Vous pouvez utiliser plusieurs feuilles (par exemple une par actif) : toutes les feuilles visibles sont lues, sauf « Instructions » et « Exemple ».',
    config.exemple ? 'La feuille « Exemple » montre une ligne remplie à titre indicatif : ne la recopiez pas telle quelle.' : '',
  ]
    .filter((t, i, tout) => !(t === '' && i === tout.length - 1))
    .forEach((t, i) => {
      aide.getCell(i + 1, 1).value = t;
      aide.getCell(i + 1, 1).alignment = { wrapText: true, vertical: 'top' };
    });
  aide.getCell(1, 1).font = { bold: true };

  // --- Exemple (ignoré par l'import)
  if (config.exemple) {
    const ex = workbook.addWorksheet('Exemple');
    const exHeader = ex.addRow(config.columns.map(titre));
    exHeader.font = { bold: true };
    exHeader.alignment = { wrapText: true, vertical: 'middle' };
    exHeader.height = 42;
    ex.addRow(config.exemple);
    config.columns.forEach((col, i) => {
      ex.getColumn(i + 1).width = sheet.getColumn(i + 1).width;
      exHeader.getCell(i + 1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: col.required ? ROUGE_CLAIR : GRIS_CLAIR } };
    });
  }

  return workbook;
}
