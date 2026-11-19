// Génère les modèles Excel d'import de THAIS (un fichier par liste) + le guide LISEZ-MOI.txt, dans
// E-Lease/import/modeles-excel/ : prêts à être envoyés au client, sans aucune donnée réelle.
// Les colonnes viennent du code de l'application (src/utils/import/import-configs.ts) : si une colonne change
// dans l'application, relancez ce script pour régénérer les modèles.
// Usage : node generate-templates.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const client = path.resolve(__dirname, '../SmartBuilding/WorkFlows.Client');
const sortie = path.join(__dirname, 'modeles-excel');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'elease-modeles-'));

// 1. Compile les deux modules TypeScript (sans dépendance au navigateur) en CommonJS.
const esbuild = path.join(client, 'node_modules', '.bin', process.platform === 'win32' ? 'esbuild.cmd' : 'esbuild');
const bundle = (entree, nom) => {
  const fichier = path.join(tmp, nom);
  execFileSync(esbuild, [`"${path.join(client, 'src/utils/import', entree)}"`, '--bundle', '--platform=node', '--format=cjs', `--outfile="${fichier}"`, '--log-level=error', '--tsconfig-raw={}'], { shell: true, stdio: 'inherit' });
  return require(fichier);
};
const configs = bundle('import-configs.ts', 'configs.cjs');
const { buildTemplateWorkbook } = bundle('import-template.ts', 'template.cjs');
const ExcelJS = require(path.join(client, 'node_modules', 'exceljs'));

// 2. Les listes, dans l'ordre conseillé pour l'import. (segment/libellé : voir lookupModules.ts de l'application)
const lookup = (segment, label, flag) => ({ nom: label, config: configs.lookupImportConfig(segment, label, flag) });
const groupes = [
  {
    titre: 'ÉTAPE 1 — Listes de référence (à remplir en premier : les autres fichiers s’y réfèrent)',
    listes: [
      lookup('villes', 'Villes'),
      lookup('building-types', 'Types Actif'),
      lookup('typologies-lot', 'Typologies de lot'),
      lookup('proprietaires', 'Propriétaires'),
      lookup('banques', 'Banques'),
    ],
  },
  {
    titre: 'ÉTAPE 2 — Patrimoine et locataires',
    listes: [
      { nom: 'Actifs', config: configs.ACTIFS_IMPORT },
      { nom: 'Locaux', config: configs.LOCAUX_IMPORT },
      { nom: 'Locataires', config: configs.LOCATAIRES_IMPORT },
    ],
  },
  { titre: 'ÉTAPE 3 — Baux (contrats de location)', listes: [{ nom: 'Baux', config: configs.BAUX_IMPORT }] },
  {
    titre: 'AUTRES LISTES (facultatives, selon vos besoins)',
    listes: [
      { nom: 'Filiales', config: configs.FILIALES_IMPORT },
      { nom: 'Typologies de charge', config: configs.TYPOLOGIES_CHARGE_IMPORT },
      lookup('pays', 'Pays'),
      lookup('periodicites', 'Périodicités'),
      lookup('types-taxe', 'Types de taxe'),
      lookup('encaisseurs', 'Encaisseurs'),
      lookup('assureurs', 'Assureurs'),
      lookup('courtiers', 'Courtiers'),
      lookup('societes-immobilieres', 'Sociétés immobilières'),
      lookup('typologies-sinistre', 'Typologies de sinistre'),
      lookup('service-profils', 'Profils', 'Accès complet'),
    ],
  },
];

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');

(async () => {
  fs.rmSync(sortie, { recursive: true, force: true });
  fs.mkdirSync(sortie, { recursive: true });

  const lignes = [];
  lignes.push('MODÈLES EXCEL D’IMPORT — THAIS', '=================================', '');
  lignes.push(
    'Chaque fichier ci-joint correspond à une liste de THAIS. Remplissez-le (une ligne par élément) puis envoyez-le',
    'à l’équipe THAIS, qui l’importe dans l’application : le fichier est contrôlé ligne par ligne avant l’import et',
    'les lignes en erreur sont signalées avec la raison.',
    '',
    'COMMENT REMPLIR',
    '  - Gardez la ligne de titres (ligne 1) telle quelle et ne changez pas l’ordre des colonnes.',
    '  - Les titres sur fond JAUNE, marqués d’une étoile (*), sont obligatoires. Fond gris : facultatif.',
    '  - Dates : jj/mm/aaaa (exemple 31/12/2028). Nombres : virgule ou point pour les décimales (exemple 161,40).',
    '  - Une ligne par élément ; vous pouvez utiliser plusieurs feuilles (par exemple une par immeuble).',
    '  - La feuille « Exemple » (quand elle existe) montre une ligne remplie avec des données fictives ; la feuille',
    '    « Instructions » rappelle les règles. Ces deux feuilles ne sont pas importées.',
    '  - Un élément déjà présent dans THAIS est ignoré : on peut renvoyer un fichier corrigé sans créer de doublons.',
    '',
    'IMPORTANT — L’ORDRE',
    '  Un actif doit exister avant ses locaux ; une ville, un type d’actif, un propriétaire ou une banque cités dans un',
    '  fichier doivent exister dans leur propre liste. Remplissez donc les fichiers dans l’ordre ci-dessous.',
    '',
  );

  let n = 0;
  for (const groupe of groupes) {
    lignes.push(groupe.titre, '-'.repeat(groupe.titre.length));
    for (const { nom, config } of groupe.listes) {
      n++;
      const fichier = `${String(n).padStart(2, '0')}-${slug(nom)}.xlsx`;
      await buildTemplateWorkbook(ExcelJS, config).xlsx.writeFile(path.join(sortie, fichier));
      const colonnes = config.columns.map((c) => (c.required ? `${c.header} *` : c.header)).join(' | ');
      lignes.push(`${fichier}`, `    Colonnes : ${colonnes}`);
      for (const note of config.notes) lignes.push(`    - ${note}`);
      lignes.push('');
    }
  }
  lignes.push('* = colonne obligatoire.');
  fs.writeFileSync(path.join(sortie, 'LISEZ-MOI.txt'), '﻿' + lignes.join('\r\n'), 'utf8');

  console.log(`${n} modèles écrits dans ${sortie}`);
  fs.rmSync(tmp, { recursive: true, force: true });
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
