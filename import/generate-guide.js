// Génère le guide Word « Guide de remplissage des fichiers d'import THAIS » (à envoyer au client) dans
// Thais/import/modeles-excel/. Les colonnes viennent du code de l'application (import-configs.ts) : si une
// colonne change, relancez ce script (et generate-templates.js) pour garder le guide et les modèles à jour.
// Usage : node generate-guide.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

// Le module « docx » n'est pas une dépendance du projet : installez-le à part (npm install docx dans un dossier
// quelconque) et indiquez son dossier node_modules dans la variable DOCX_NODE_MODULES, ou lancez simplement
//   NODE_PATH=<dossier>/node_modules node generate-guide.js
let docx;
try {
  docx = require('docx');
} catch {
  if (!process.env.DOCX_NODE_MODULES) {
    console.error('Module « docx » introuvable. Installez-le (npm install docx) puis relancez avec DOCX_NODE_MODULES=<dossier>/node_modules.');
    process.exit(1);
  }
  docx = require(path.join(process.env.DOCX_NODE_MODULES, 'docx'));
}
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType,
  HeadingLevel, LevelFormat, Header, Footer, PageNumber,
} = docx;

// 1. Compile les définitions des listes (TypeScript -> CommonJS), comme generate-templates.js.
const client = path.resolve(__dirname, '../Thais/WorkFlows.Client');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'elease-guide-'));
const esbuild = path.join(client, 'node_modules', '.bin', process.platform === 'win32' ? 'esbuild.cmd' : 'esbuild');
const fichierConfigs = path.join(tmp, 'configs.cjs');
execFileSync(esbuild, [`"${path.join(client, 'src/utils/import/import-configs.ts')}"`, '--bundle', '--platform=node', '--format=cjs', `--outfile="${fichierConfigs}"`, '--log-level=error', '--tsconfig-raw={}'], { shell: true, stdio: 'inherit' });
const configs = require(fichierConfigs);

// 2. Précisions par colonne (clé = « liste:champ »). Le reste (format, caractère obligatoire, exemple) vient des définitions.
const PRECISIONS = {
  'actifs:codeImmeuble': 'Code interne unique de l’actif. Un code déjà utilisé est refusé.',
  'actifs:designation': 'Nom de l’actif. Unique.',
  'actifs:typologie': 'Doit exister dans la liste « Types Actif » (fichier 02).',
  'actifs:titreFoncier': 'Numéro de titre foncier, texte libre.',
  'actifs:ville': 'Doit exister dans la liste « Villes » (fichier 01).',
  'actifs:adresse': 'Texte libre.',
  'actifs:surfaceUtile': 'Superficie utile de l’immeuble en m², nombre positif.',
  'actifs:proprietaire': 'Doit exister dans la liste « Propriétaires » (fichier 04).',
  'locaux:actif': 'Nom ou code analytique d’un actif qui existe déjà (fichier 06).',
  'locaux:designation': 'Nom du local, unique dans son actif.',
  'locaux:typeLocal': 'Doit exister dans la liste « Typologies de lot » (fichier 03).',
  'locaux:etage': 'Texte libre : RDC, 1er, 3ème étage…',
  'locaux:surface': 'Superficie du local en m², nombre positif.',
  'locaux:nbrePiece': 'Nombre entier, zéro ou plus.',
  'locaux:titreFoncier': 'Texte libre.',
  'locaux:adresse': 'Texte libre.',
  'locaux:description': 'Texte libre.',
  'locataires:raisonSociale': 'Pour une société. Laissez vide pour un particulier.',
  'locataires:nom': 'Obligatoire pour un particulier (quand la raison sociale est vide).',
  'locataires:prenom': 'Prénom du particulier.',
  'locataires:ice': 'Identifiant commun de l’entreprise.',
  'locataires:rc': 'Numéro de registre de commerce.',
  'locataires:identifiantFiscal': 'Identifiant fiscal.',
  'locataires:cin': 'Pour un particulier.',
  'locataires:telephone': 'Texte, avec ou sans espaces.',
  'locataires:email': 'Doit contenir un « @ ».',
  'locataires:adresse': 'Texte libre.',
  'locataires:ville': 'Doit exister dans la liste « Villes » (fichier 01).',
  'locataires:codeLocataire': 'Code interne du locataire, texte libre.',
  'baux:locataire': 'Raison sociale du locataire. S’il n’existe pas encore, il est créé.',
  'baux:actif': 'Nom de l’actif (colonne « Building »). S’il n’existe pas encore, il est créé.',
  'baux:surface': 'Superficie louée en m². Enregistrée sur le local créé pour ce bail.',
  'baux:parking': 'Nombre de places de parking, entier.',
  'baux:dateDebut': 'Date de prise d’effet du bail.',
  'baux:dateGestion': 'Date à partir de laquelle la durée du bail est comptabilisée.',
  'baux:dureeContrat': 'Texte libre : 3 ans fermes, renouvelable par tacite reconduction…',
  'baux:preavis': 'Texte libre : 6 mois, 3 mois…',
  'baux:dateFin': 'Date de fin du contrat (délai de préavis pris en compte). Doit être après la date de début.',
  'filiales:nom': 'Nom de la filiale. Unique.',
  'filiales:numeroReference': 'Texte libre.',
  'filiales:date': 'Date associée à la filiale.',
  'filiales:rib': 'RIB sans espaces.',
  'filiales:banque': 'Doit exister dans la liste « Banques » (fichier 05).',
  'filiales:modeReglement': 'Texte libre : Virement, Chèque…',
  'typologies-charge:typologie': 'Nom de la typologie. Unique.',
  'typologies-charge:compte': 'Numéro de compte comptable.',
  'typologies-charge:description': 'Texte libre.',
  'prestataires:designation': 'Nom du prestataire. Unique.',
  'prestataires:activite': 'Texte libre : nettoyage, ascenseurs, sécurité…',
  'prestataires:typePrestataire': 'Texte libre : société, particulier…',
  'prestataires:enseigne': 'Texte libre.',
  'prestataires:rc': 'Numéro de registre de commerce.',
  'prestataires:idf': 'Identifiant fiscal.',
  'prestataires:ice': 'Identifiant commun de l’entreprise.',
  'prestataires:adresse': 'Texte libre.',
  'prestataires:codePostal': 'Texte, par exemple 20000.',
  'prestataires:ville': 'Doit exister dans la liste « Villes » (fichier 01).',
  'prestataires:pays': 'Texte libre.',
  'prestataires:notes': 'Texte libre.',
  'assurances:numPolice': 'Numéro de la police. Avec l’assureur, il identifie la police : une police déjà présente est ignorée.',
  'assurances:assureur': 'Doit exister dans la liste « Assureurs » (fichier 16).',
  'assurances:courtier': 'Doit exister dans la liste « Courtiers » (fichier 17).',
  'assurances:typeCouverture': 'Texte libre : multirisque immeuble, responsabilité civile…',
  'assurances:dateEffetContrat': 'Date de prise d’effet du contrat.',
  'assurances:montant': 'Montant de la prime, nombre positif.',
  'assurances:statut': 'EnCours ou Terminé. Si la case est vide : EnCours.',
  'assurances:notes': 'Texte libre.',
  'charges:actif': 'Nom ou code analytique d’un actif qui existe déjà (fichier 06).',
  'charges:typologie': 'Doit exister dans la liste « Typologies de charge » (fichier 11).',
  'charges:prestataire': 'Doit exister dans la liste « Prestataires » (fichier 21).',
  'charges:annee': 'Année de la charge, par exemple 2026.',
  'charges:montant': 'Budget prévu pour l’année, nombre positif.',
  'charges:realisation': 'Montant réellement dépensé, nombre positif.',
  'charges:dateDecaissement': 'Date du décaissement.',
  'charges:notes': 'Texte libre.',
  'taxes:actif': 'Nom ou code analytique d’un actif qui existe déjà (fichier 06).',
  'taxes:local': 'Nom d’un local de cet actif (fichier 07).',
  'taxes:locataire': 'Raison sociale, ou « nom prénom » pour un particulier (fichier 08).',
  'taxes:typeTaxe': 'Doit exister dans la liste « Types de taxe » (fichier 14).',
  'taxes:idFiscal': 'Identifiant fiscal.',
  'taxes:noArticle': 'Numéro d’article de la taxe, texte libre.',
  'taxes:montantTaxe': 'Montant de la taxe, nombre positif.',
  'taxes:annee': 'Année de la taxe, par exemple 2026.',
  'taxes:paye': 'Oui ou Non. Si la case est vide : Non.',
  'taxes:notes': 'Texte libre.',
  'membres-syndic:nom': 'Nom du membre.',
  'membres-syndic:prenom': 'Prénom du membre. Avec le nom, il identifie le membre : un membre déjà présent est ignoré.',
  'membres-syndic:poste': 'Texte libre : président, trésorier…',
  'membres-syndic:telephone': 'Texte, avec ou sans espaces.',
  'membres-syndic:debutMandat': 'Date de début du mandat.',
  'membres-syndic:finMandat': 'Date de fin du mandat, après la date de début.',
  'membres-syndic:notes': 'Texte libre.',
  'typologies-immobilisation:immobilisationConcernee': 'Nom de la catégorie d’immobilisation (construction, matériel…). Unique.',
  'typologies-immobilisation:compteComptable': 'Numéro de compte comptable.',
  'typologies-immobilisation:compteAmortissement': 'Numéro de compte d’amortissement.',
  'typologies-immobilisation:compteDotation': 'Numéro de compte de dotation.',
  'typologies-immobilisation:taux': 'Pourcentage entre 0 et 100.',
  'typologies-immobilisation:duree': 'Durée d’amortissement, nombre entier.',
  'contrats-prestataires:prestataire': 'Doit exister dans la liste « Prestataires » (fichier 21).',
  'contrats-prestataires:objet': 'Objet du contrat, texte libre. Avec le prestataire et la date de début, il identifie le contrat.',
  'contrats-prestataires:dateContrat': 'Date de signature du contrat.',
  'contrats-prestataires:dateDebut': 'Date de début du contrat.',
  'contrats-prestataires:dateFin': 'Date de fin du contrat.',
  'contrats-prestataires:montant': 'Montant du contrat, nombre positif.',
  'contrats-prestataires:notes': 'Texte libre.',
  'bons-commande:numeroBonCommande': 'Numéro du bon de commande. Unique.',
  'bons-commande:prestataire': 'Doit exister dans la liste « Prestataires » (fichier 21).',
  'bons-commande:dateCommande': 'Date de la commande.',
  'bons-commande:dateReception': 'Date de réception.',
  'bons-commande:compte': 'Texte libre.',
  'bons-commande:compteComptable': 'Numéro de compte comptable.',
  'bons-commande:statutApprobation': 'En attente, Approuvé ou Rejeté. Si la case est vide : En attente.',
  'bons-commande:notes': 'Texte libre.',
  'prestations-achat:numeroBonCommande': 'Doit exister dans la liste « Bons de commande » (fichier 28).',
  'prestations-achat:actif': 'Nom ou code analytique d’un actif qui existe déjà (fichier 06).',
  'prestations-achat:typologie': 'Doit exister dans la liste « Typologies de charge » (fichier 11).',
  'prestations-achat:prixUnitaireHt': 'Prix unitaire hors taxes, nombre positif.',
  'prestations-achat:quantite': 'Nombre positif. Si la case est vide : 1.',
  'prestations-achat:tauxTva': 'Pourcentage entre 0 et 100.',
  'prestations-achat:dureeAmortissementMois': 'Nombre entier de mois.',
  'prestations-achat:tauxAmortissement': 'Pourcentage entre 0 et 100.',
  'prestations-achat:notes': 'Texte libre.',
  'reclamations:actif': 'Nom ou code analytique d’un actif qui existe déjà (fichier 06).',
  'reclamations:local': 'Nom d’un local de cet actif (fichier 07).',
  'reclamations:locataire': 'Raison sociale, ou « nom prénom » pour un particulier (fichier 08).',
  'reclamations:etat': 'Ouverte, En traitement, Résolue ou Fermée. Si la case est vide : Ouverte.',
  'reclamations:dateReclamation': 'Date de la réclamation.',
  'reclamations:objet': 'Texte libre.',
  'reclamations:notes': 'Texte libre.',
  'sinistres:actif': 'Nom ou code analytique d’un actif qui existe déjà (fichier 06).',
  'sinistres:local': 'Nom d’un local de cet actif (fichier 07).',
  'sinistres:numPolice': 'Numéro d’une police qui existe déjà (fichier 22).',
  'sinistres:typeSinistre': 'Doit exister dans la liste « Typologies de sinistre » (fichier 19).',
  'sinistres:etapeSuivi': 'Déclaré, Expertise, Réclamation, Remboursement ou Clôturé. Si la case est vide : Déclaré.',
  'sinistres:dateDeclaration': 'Date de déclaration du sinistre.',
  'sinistres:dateExpertise': 'Date de l’expertise.',
  'sinistres:dateReclamation': 'Date de la réclamation.',
  'sinistres:dateRemboursement': 'Date du remboursement.',
  'sinistres:estimationDegatBailleur': 'Montant estimé, nombre positif.',
  'sinistres:estimationDegatLocataire': 'Montant estimé, nombre positif.',
  'sinistres:montantFacture': 'Montant facturé, nombre positif.',
  'sinistres:montantRemuneration': 'Montant de rémunération, nombre positif.',
  'sinistres:nomExpert': 'Texte libre.',
  'sinistres:refDossierAssurance': 'Texte libre.',
  'sinistres:noSinistre': 'Numéro de sinistre. S’il est renseigné, il identifie le sinistre ; sinon ce sont l’actif, le local, le type et la date de déclaration.',
  'sinistres:notes': 'Texte libre.',
};

const FORMAT = { text: 'Texte', number: 'Nombre (virgule ou point)', int: 'Nombre entier', date: 'Date jj/mm/aaaa', bool: 'Oui ou Non' };

// 3. Mise en forme
const A4_LARGEUR = 11906, MARGE = 1134, UTILE = A4_LARGEUR - 2 * MARGE; // 9638
const BORD = { style: BorderStyle.SINGLE, size: 4, color: 'BFBFBF' };
const BORDS = { top: BORD, bottom: BORD, left: BORD, right: BORD };
const COULEUR = '1F3864';

const cellule = (texte, largeur, { gras = false, fond, centre = false } = {}) =>
  new TableCell({
    width: { size: largeur, type: WidthType.DXA },
    borders: BORDS,
    shading: fond ? { fill: fond, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: String(texte).split('\n').map(
      (l) => new Paragraph({ alignment: centre ? AlignmentType.CENTER : AlignmentType.LEFT, children: [new TextRun({ text: l, bold: gras, size: 18 })] }),
    ),
  });

const tableau = (largeurs, entetes, lignes) =>
  new Table({
    width: { size: largeurs.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: largeurs,
    rows: [
      new TableRow({ tableHeader: true, children: entetes.map((e, i) => cellule(e, largeurs[i], { gras: true, fond: 'DCE6F2' })) }),
      ...lignes.map(
        (l) => new TableRow({ cantSplit: true, children: l.map((c, i) => cellule(c.texte ?? c, largeurs[i], { gras: c.gras, centre: c.centre })) }),
      ),
    ],
  });

const p = (texte, opts = {}) => new Paragraph({ spacing: { after: 100 }, ...opts, children: [new TextRun({ text: texte, size: 21, ...(opts.run ?? {}) })] });
const puce = (texte) => new Paragraph({ numbering: { reference: 'puces', level: 0 }, spacing: { after: 60 }, children: [new TextRun({ text: texte, size: 21 })] });
const h1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const h2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const espace = () => new Paragraph({ spacing: { after: 80 }, children: [] });

const valeurExemple = (config, i) => {
  const v = config.exemple?.[i];
  return v === undefined || v === '' ? '—' : typeof v === 'number' ? String(v).replace('.', ',') : String(v);
};

// 4. Contenu
const listesDetail = [
  ['06', 'Actifs', configs.ACTIFS_IMPORT, 'Les immeubles de votre patrimoine.'],
  ['07', 'Locaux', configs.LOCAUX_IMPORT, 'Les locaux (bureaux, commerces…) de chaque actif, y compris les locaux vacants.'],
  ['08', 'Locataires', configs.LOCATAIRES_IMPORT, 'Les sociétés et les particuliers qui louent.'],
  ['09', 'Baux', configs.BAUX_IMPORT, 'Les contrats de location : une ligne par locataire. C’est le format de votre fichier « Dates début et fin des baux ».'],
  ['10', 'Filiales', configs.FILIALES_IMPORT, 'Les filiales et leurs coordonnées bancaires.'],
  ['11', 'Typologies de charge', configs.TYPOLOGIES_CHARGE_IMPORT, 'Les catégories de charges avec leur compte comptable.'],
  ['21', 'Prestataires', configs.PRESTATAIRES_IMPORT, 'Les entreprises qui interviennent sur vos immeubles (nettoyage, ascenseurs, sécurité…).'],
  ['22', 'Assurances', configs.ASSURANCES_IMPORT, 'Les polices d’assurance : une ligne par police.'],
  ['23', 'Charges', configs.CHARGES_IMPORT, 'Les charges d’un actif pour une année : budget prévu et montant réalisé.'],
  ['24', 'Taxes', configs.TAXES_IMPORT, 'Les taxes par actif, local (facultatif) et année.'],
  ['25', 'Membres du syndic', configs.MEMBRES_SYNDIC_IMPORT, 'Les membres du bureau syndical.'],
  ['26', 'Typologies d’immobilisation', configs.TYPOLOGIES_IMMOBILISATION_IMPORT, 'Les catégories d’immobilisation avec leurs comptes, taux et durée d’amortissement.'],
  ['27', 'Contrats prestataires', configs.CONTRATS_PRESTATAIRES_IMPORT, 'Les contrats conclus avec vos prestataires.'],
  ['28', 'Bons de commande', configs.BONS_COMMANDE_IMPORT, 'Les bons de commande adressés aux prestataires.'],
  ['29', 'Prestations', configs.PRESTATIONS_ACHAT_IMPORT, 'Les lignes de prestation de chaque bon de commande.'],
  ['30', 'Réclamations', configs.RECLAMATIONS_IMPORT, 'Les réclamations des locataires.'],
  ['31', 'Sinistres', configs.SINISTRES_IMPORT, 'Les sinistres déclarés sur vos actifs.'],
];

const refSimples = [
  ['01', 'Villes', 'Casablanca', 'Actifs, Locataires'],
  ['02', 'Types Actif', 'Immeuble de bureaux', 'Actifs'],
  ['03', 'Typologies de lot', 'Bureau', 'Locaux'],
  ['04', 'Propriétaires', 'Propriétaire exemple', 'Actifs'],
  ['05', 'Banques', 'Banque exemple', 'Filiales'],
  ['12', 'Pays', 'Maroc', 'Facultatif'],
  ['13', 'Périodicités', 'Mensuelle', 'Facultatif'],
  ['14', 'Types de taxe', 'Taxe de services communaux', 'Taxes'],
  ['15', 'Encaisseurs', 'Encaisseur exemple', 'Facultatif'],
  ['16', 'Assureurs', 'Assureur exemple', 'Assurances'],
  ['17', 'Courtiers', 'Courtier exemple', 'Assurances'],
  ['18', 'Sociétés immobilières', 'Société immobilière exemple', 'Facultatif'],
  ['19', 'Typologies de sinistre', 'Dégât des eaux', 'Facultatif'],
  ['20', 'Profils', 'Gestionnaire (+ colonne « Accès complet » : Oui ou Non)', 'Facultatif'],
];

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
const nomFichier = (n, nom) => `${n}-${slug(nom)}.xlsx`;

const enfants = [];
// --- En-tête de document
enfants.push(new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun('THAIS')] }));
enfants.push(new Paragraph({ spacing: { after: 60 }, children: [new TextRun({ text: 'Guide de remplissage des fichiers d’import', size: 36, bold: true, color: COULEUR })] }));
enfants.push(new Paragraph({ spacing: { after: 240 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COULEUR, space: 6 } }, children: [new TextRun({ text: 'Liste complète des champs de chaque liste, pour importer vos données sans erreur', size: 22, color: '595959' })] }));

enfants.push(h1('1. À quoi sert ce guide'));
enfants.push(p('Vous nous envoyez vos données dans des fichiers Excel ; elles sont ensuite importées dans THAIS. Chaque liste de l’application (actifs, locaux, locataires, baux…) a son propre fichier modèle, fourni avec ce guide. Ce document décrit, pour chaque fichier, toutes les colonnes à remplir : lesquelles sont obligatoires, le format attendu et un exemple.'));
enfants.push(p('Avant l’import, chaque fichier est contrôlé ligne par ligne. Une ligne en erreur n’empêche pas les autres d’être importées : elle est signalée avec la raison, pour que vous puissiez la corriger.'));

enfants.push(h1('2. Les règles à respecter pour tous les fichiers'));
[
  'Utilisez les fichiers modèles fournis (format Excel .xlsx) : ne changez ni la ligne de titres (ligne 1) ni l’ordre des colonnes.',
  'Les colonnes dont le titre est marqué d’une étoile (*) sur fond jaune sont obligatoires ; les autres, sur fond gris, sont facultatives.',
  'Une ligne par élément (un actif, un local, un locataire, un bail…). Vous pouvez utiliser plusieurs feuilles, par exemple une par immeuble : toutes les feuilles sont lues, sauf « Instructions » et « Exemple ».',
  'Dates : au format jj/mm/aaaa, par exemple 31/12/2028 (ou de vraies dates Excel). Une date qui n’existe pas, comme le 29/02/2029, est ramenée au dernier jour du mois avec un avertissement.',
  'Nombres : la virgule ou le point pour les décimales, sans symbole ni espace (161,40 et non « 161,40 m² »).',
  'Oui / Non : écrivez simplement Oui ou Non.',
  'Un élément déjà présent dans THAIS est ignoré : vous pouvez nous renvoyer un fichier corrigé, ou le même fichier complété, sans créer de doublons.',
  'Les noms doivent être écrits de la même façon d’un fichier à l’autre : une ville citée dans le fichier des actifs doit exister, avec la même orthographe, dans le fichier des villes. La casse (majuscules ou minuscules) n’a pas d’importance.',
].forEach((t) => enfants.push(puce(t)));

enfants.push(h1('3. Dans quel ordre remplir les fichiers'));
enfants.push(p('Certains fichiers se réfèrent à d’autres : un actif doit exister avant ses locaux, et une ville citée dans un actif doit exister dans la liste des villes. Remplissez donc les fichiers dans l’ordre suivant.'));
enfants.push(
  tableau(
    [1100, 3100, 5438],
    ['Étape', 'Fichier', 'À remplir'],
    [
      [{ texte: '1', centre: true }, '01 à 05 — Villes, Types Actif, Typologies de lot, Propriétaires, Banques', 'En premier : ces listes sont utilisées par les autres fichiers. Vous pouvez ne remplir que celles dont vous avez besoin.'],
      [{ texte: '2', centre: true }, '06 — Actifs', 'Vos immeubles.'],
      [{ texte: '2', centre: true }, '07 — Locaux', 'Après les actifs (chaque local est rattaché à un actif existant).'],
      [{ texte: '2', centre: true }, '08 — Locataires', 'Peut être rempli en même temps que les locaux.'],
      [{ texte: '3', centre: true }, '09 — Baux', 'Vos contrats de location. Les actifs et les locataires qui n’existent pas encore sont créés automatiquement.'],
      [{ texte: '—', centre: true }, '10 à 20 — Filiales, Typologies de charge et autres listes', 'Facultatifs, selon vos besoins. Les assureurs (16), courtiers (17), types de taxe (14) et typologies de charge (11) servent aux fichiers Property Management.'],
      [{ texte: '4', centre: true }, '21 à 25 — Prestataires, Assurances, Charges, Taxes, Membres du syndic', 'Property Management, facultatif : après les actifs, locaux, locataires et les listes de référence qu’ils utilisent. Les prestataires (21) avant les charges (23).'],
      [{ texte: '5', centre: true }, '26 à 31 — Typologies d’immobilisation, Contrats, Bons de commande, Prestations, Réclamations, Sinistres', 'Facultatifs. Les prestataires (21) avant les contrats (27) et les bons de commande (28) ; les bons de commande avant les prestations (29) ; les polices (22) et les typologies de sinistre (19) avant les sinistres (31).'],
    ],
  ),
);
enfants.push(espace());

enfants.push(h1('4. Le détail de chaque liste'));
listesDetail.forEach(([num, nom, config, but], idx) => {
  enfants.push(h2(`${num} — ${nom}`));
  enfants.push(p(`Fichier : ${nomFichier(num, nom)}. ${but}`));
  const id = config.id;
  const lignes = config.columns.map((c, i) => [
    { texte: c.header, gras: true },
    { texte: c.required ? 'Oui' : 'Non', centre: true, gras: c.required },
    FORMAT[c.type],
    valeurExemple(config, i),
    PRECISIONS[`${id}:${c.key}`] ?? '',
  ]);
  enfants.push(tableau([2100, 1000, 1500, 1900, 3138], ['Colonne', 'Obligatoire', 'Format', 'Exemple', 'Précisions'], lignes));
  enfants.push(espace());
  config.notes.forEach((n) => enfants.push(puce(n)));
  if (idx < listesDetail.length - 1) enfants.push(espace());
});

enfants.push(h1('5. Les listes de référence'));
enfants.push(p('Ces listes ne comportent qu’une colonne, « Désignation » (obligatoire, texte), sauf « Profils » qui a une colonne supplémentaire facultative « Accès complet » (Oui ou Non, Non par défaut). Elles servent à alimenter les choix proposés dans les autres fichiers.'));
enfants.push(
  tableau(
    [900, 2500, 3638, 2600],
    ['Fichier', 'Liste', 'Exemple de ligne', 'Utilisée par'],
    refSimples.map(([n, nom, ex, util]) => [{ texte: n, centre: true }, { texte: nom, gras: true }, ex, util]),
  ),
);
enfants.push(espace());

enfants.push(h1('6. Les messages que vous pouvez rencontrer'));
enfants.push(p('Lors de l’import, chaque ligne refusée est accompagnée de la raison. Voici les plus fréquentes et comment les corriger.'));
enfants.push(
  tableau(
    [3300, 2700, 3638],
    ['Message', 'Cause', 'Que faire'],
    [
      ['« Colonne » est obligatoire.', 'Une colonne obligatoire est vide.', 'Renseignez la colonne marquée d’une étoile.'],
      ['Ville inconnue : « … » (idem Typologie, Propriétaire, Banque, Type de local)', 'La valeur n’existe pas dans la liste correspondante.', 'Ajoutez-la dans le fichier de la liste (étape 1) ou corrigez l’orthographe pour qu’elle soit identique.'],
      ['Actif introuvable : « … »', 'L’actif cité dans le fichier des locaux n’existe pas.', 'Ajoutez-le dans le fichier des actifs (06) ou corrigez son nom.'],
      ['… n’est pas une date valide (format attendu jj/mm/aaaa)', 'La date est écrite autrement.', 'Écrivez-la au format 31/12/2028.'],
      ['… n’est pas un nombre', 'La cellule contient du texte (par exemple « 161 m² »).', 'Gardez seulement le nombre : 161,4.'],
      ['… doit être Oui ou Non', 'Valeur inattendue dans une colonne Oui / Non.', 'Écrivez Oui ou Non.'],
      ['La date de fin est antérieure à la date de début', 'Dates inversées dans un bail.', 'Vérifiez les deux dates.'],
      ['E-mail invalide', 'L’adresse ne contient pas de « @ ».', 'Corrigez l’adresse.'],
      ['… trop long (n caractères, maximum m)', 'Le texte dépasse la longueur autorisée.', 'Raccourcissez le texte.'],
      ['Déjà existant … : ignoré', 'L’élément est déjà dans THAIS.', 'Aucune action : ce n’est pas une erreur.'],
      ['La feuille « … » ne respecte pas le modèle', 'Les titres du modèle ont été modifiés ou le mauvais fichier a été utilisé.', 'Reprenez le fichier modèle correspondant à la liste et recopiez-y vos données.'],
    ],
  ),
);
enfants.push(espace());

enfants.push(h1('7. Avant d’envoyer vos fichiers'));
[
  'Chaque fichier est au format Excel (.xlsx) et basé sur le modèle fourni.',
  'La ligne de titres n’a pas été modifiée.',
  'Toutes les colonnes obligatoires (*) sont renseignées.',
  'Les dates sont au format jj/mm/aaaa et les nombres ne contiennent pas d’unité.',
  'Les villes, types, propriétaires, banques et actifs cités existent dans leurs propres fichiers, avec la même orthographe.',
  'La feuille « Exemple » ne contient aucune de vos données : ne la remplissez pas.',
].forEach((t) => enfants.push(puce(t)));

const doc = new Document({
  creator: 'THAIS',
  title: 'THAIS — Guide de remplissage des fichiers d’import',
  styles: {
    default: { document: { run: { font: 'Arial', size: 21 } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { font: 'Arial', size: 56, bold: true, color: COULEUR }, paragraph: { spacing: { before: 0, after: 60 }, keepNext: true } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 30, bold: true, color: COULEUR }, paragraph: { spacing: { before: 360, after: 140 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: 'Arial', size: 25, bold: true, color: '2E74B5' }, paragraph: { spacing: { before: 280, after: 100 }, keepNext: true, outlineLevel: 1 } },
    ],
  },
  numbering: { config: [{ reference: 'puces', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 270 } } } }] }] },
  sections: [
    {
      properties: { page: { size: { width: A4_LARGEUR, height: 16838 }, margin: { top: 1134, right: MARGE, bottom: 1134, left: MARGE } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'THAIS — Guide de remplissage des fichiers d’import', size: 16, color: '7F7F7F' })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'Page ', size: 16, color: '7F7F7F' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '7F7F7F' }), new TextRun({ text: ' sur ', size: 16, color: '7F7F7F' }), new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: '7F7F7F' })] })] }) },
      children: enfants,
    },
  ],
});

(async () => {
  const sortie = path.join(__dirname, 'modeles-excel', 'Guide-remplissage-import-THAIS.docx');
  fs.mkdirSync(path.dirname(sortie), { recursive: true });
  fs.writeFileSync(sortie, await Packer.toBuffer(doc));
  fs.rmSync(tmp, { recursive: true, force: true });
  console.log('guide écrit :', sortie);
})();
