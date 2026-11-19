import { ImportColumn, ImportConfig, ImportSummary, ImportValue } from './import-engine';

// Configuration de l'import Excel de chaque liste de THAIS (voir import-engine.ts). Les clés des colonnes
// correspondent aux champs des modèles de requête du serveur (Design.Contract/Requests/ImportRequests.cs).

interface GenericResult {
  crees: number;
  ignorees: { ligne: number; libelle: string; message: string }[];
}

const summarizeGeneric =
  (unite: string) =>
  (result: unknown): ImportSummary => {
    const r = result as GenericResult;
    return { lignes: [`${r.crees} ${unite} créé(s).`], ignorees: r.ignorees };
  };

const col = (key: string, header: string, type: ImportColumn['type'] = 'text', required = false, label?: string): ImportColumn => ({
  key,
  header,
  type,
  required,
  label,
});

// ------------------------------------------------------------------ Baux (fichier CFC « Dates début et fin des baux »)
interface BailResult {
  actifsCrees: number;
  locatairesCrees: number;
  locauxCrees: number;
  bauxCrees: number;
  ignorees: { ligne: number; locataire: string; message: string }[];
}

export const BAUX_IMPORT: ImportConfig = {
  id: 'baux',
  title: 'Importer des baux',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par locataire.',
  endpoint: '/api/baux/import',
  templateFileName: 'Modele-import-baux.xlsx',
  sheetName: 'Baux',
  firstHeaderKeyword: 'locataire',
  columns: [
    col('locataire', 'Locataire', 'text', true),
    col('actif', 'Building', 'text', true, 'Actif (colonne Building)'),
    col('surface', 'Superficie (m2)', 'number', false, 'Superficie'),
    col('parking', 'Nbr place parking', 'int', false, 'Places de parking'),
    col('dateDebut', "Date de prise d'effet du bail", 'date', true, "Date de prise d'effet"),
    col('dateGestion', 'Date à partir de laquelle la durée de bail est comptabilisée', 'date', false, 'Date de gestion'),
    col('dureeContrat', 'Durée du contrat', 'text'),
    col('preavis', 'Délai de préavis', 'text'),
    col('dateFin', 'Date de fin du contrat de bail (prenant en considération délai de préavis)', 'date', false, 'Date de fin'),
  ],
  previewKeys: ['locataire', 'actif', 'surface', 'dateDebut', 'dateFin'],
  notes: [
    'Les actifs et locataires qui n’existent pas encore sont créés automatiquement ; un local « Local - <locataire> » est créé pour chaque bail.',
    'Un bail déjà présent (même actif, même locataire, même date de début) est ignoré.',
    'Dates : au format jj/mm/aaaa (ou vraies dates Excel).',
  ],
  exemple: [
    'Société Exemple SARL',
    'Immeuble Exemple',
    250.5,
    2,
    '01/01/2026',
    '01/01/2026',
    '3 ans fermes renouvelables par tacite reconduction',
    '6 mois',
    '31/12/2028',
  ],
  validateRow: (v) => {
    const erreurs: string[] = [];
    if (typeof v.dateDebut === 'string' && typeof v.dateFin === 'string' && v.dateFin < v.dateDebut) {
      erreurs.push('La date de fin est antérieure à la date de début.');
    }
    if (typeof v.surface === 'number' && v.surface < 0) erreurs.push('Superficie négative.');
    return erreurs;
  },
  summarize: (result) => {
    const r = result as BailResult;
    return {
      lignes: [
        `${r.bauxCrees} bail(aux), ${r.locauxCrees} local(aux), ${r.locatairesCrees} locataire(s) et ${r.actifsCrees} actif(s) créé(s).`,
      ],
      ignorees: r.ignorees.map((i) => ({ ligne: i.ligne, libelle: i.locataire, message: i.message })),
    };
  },
};

// ------------------------------------------------------------------ Locaux
export const LOCAUX_IMPORT: ImportConfig = {
  id: 'locaux',
  title: 'Importer des locaux',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par local.',
  endpoint: '/api/import/locaux',
  templateFileName: 'Modele-import-locaux.xlsx',
  sheetName: 'Locaux',
  firstHeaderKeyword: 'actif',
  columns: [
    col('actif', 'Actif', 'text', true),
    col('designation', 'Nom du local', 'text', true),
    col('typeLocal', 'Type local'),
    col('etage', 'Etage'),
    col('surface', 'Superficie (m²)', 'number', false, 'Superficie'),
    col('nbrePiece', 'Nb pièces', 'int', false, 'Nombre de pièces'),
    col('titreFoncier', 'Titre foncier'),
    col('adresse', 'Adresse'),
    col('description', 'Description'),
  ],
  previewKeys: ['actif', 'designation', 'typeLocal', 'etage', 'surface'],
  notes: [
    'L’actif doit déjà exister (nom ou code analytique) : importez ou créez les actifs d’abord.',
    'Le type de local, s’il est renseigné, doit exister dans Configuration > Données de référence > Typologies de lot.',
    'Un local déjà présent dans le même actif (même nom) est ignoré.',
  ],
  validateRow: (v) => [
    ...(typeof v.surface === 'number' && v.surface < 0 ? ['Superficie négative.'] : []),
    ...(typeof v.nbrePiece === 'number' && v.nbrePiece < 0 ? ['Nombre de pièces négatif.'] : []),
  ],
  exemple: ['Immeuble Exemple', 'Plateau 3A', 'Bureau', '3ème étage', 161.4, 4, 'TF 12345/C', 'Boulevard Exemple, Casablanca', 'Plateau ouvert avec salle de réunion'],
  summarize: summarizeGeneric('local(aux)'),
};

// ------------------------------------------------------------------ Actifs
export const ACTIFS_IMPORT: ImportConfig = {
  id: 'actifs',
  title: 'Importer des actifs',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par actif.',
  endpoint: '/api/import/actifs',
  templateFileName: 'Modele-import-actifs.xlsx',
  sheetName: 'Actifs',
  firstHeaderKeyword: 'code',
  columns: [
    col('codeImmeuble', 'Code analytique', 'text', true),
    col('designation', 'Actif', 'text', true, 'Actif (désignation)'),
    col('typologie', 'Typologie'),
    col('titreFoncier', 'Titre foncier'),
    col('ville', 'Ville'),
    col('adresse', 'Adresse'),
    col('surfaceUtile', 'Superficie (m²)', 'number', false, 'Superficie'),
    col('proprietaire', 'Propriétaire'),
  ],
  previewKeys: ['codeImmeuble', 'designation', 'typologie', 'ville', 'surfaceUtile'],
  notes: [
    'La typologie, la ville et le propriétaire, s’ils sont renseignés, doivent exister dans Configuration > Données de référence (Types Actif, Villes, Propriétaires) : importez ces listes d’abord si besoin.',
    'Un actif déjà présent (même code ou même désignation) est ignoré.',
  ],
  validateRow: (v) => (typeof v.surfaceUtile === 'number' && v.surfaceUtile < 0 ? ['Superficie négative.'] : []),
  exemple: ['EX-01', 'Immeuble Exemple', 'Bureau', 'TF 12345/C', 'Casablanca', 'Boulevard Exemple', 12000.5, 'Propriétaire exemple'],
  summarize: summarizeGeneric('actif(s)'),
};

// ------------------------------------------------------------------ Locataires
const nonVide = (v: ImportValue) => typeof v === 'string' && v.trim() !== '';

export const LOCATAIRES_IMPORT: ImportConfig = {
  id: 'locataires',
  title: 'Importer des locataires',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par locataire.',
  endpoint: '/api/import/locataires',
  templateFileName: 'Modele-import-locataires.xlsx',
  sheetName: 'Locataires',
  firstHeaderKeyword: 'raison',
  columns: [
    col('raisonSociale', 'Raison sociale'),
    col('nom', 'Nom'),
    col('prenom', 'Prénom'),
    col('ice', 'ICE'),
    col('rc', 'RC'),
    col('identifiantFiscal', 'Identifiant fiscal'),
    col('cin', 'CIN'),
    col('telephone', 'Téléphone'),
    col('email', 'E-mail'),
    col('adresse', 'Adresse'),
    col('ville', 'Ville'),
    col('codeLocataire', 'Code locataire'),
  ],
  previewKeys: ['raisonSociale', 'nom', 'prenom', 'ice', 'ville'],
  notes: [
    'Société : renseignez la « Raison sociale ». Particulier : laissez-la vide et renseignez le « Nom » (et le « Prénom »).',
    'La ville, si elle est renseignée, doit exister dans Configuration > Données de référence > Villes.',
    'Un locataire déjà présent (même raison sociale ou même nom et prénom) est ignoré.',
  ],
  validateRow: (v) => [
    ...(!nonVide(v.raisonSociale) && !nonVide(v.nom) ? ['Raison sociale ou nom manquant.'] : []),
    ...(nonVide(v.email) && !String(v.email).includes('@') ? ['E-mail invalide.'] : []),
  ],
  exemple: ['Société Exemple SARL', '', '', '001234567000089', '123456', '12345678', '', '0522000000', 'contact@exemple.ma', 'Boulevard Exemple', 'Casablanca', 'LOC-001'],
  summarize: summarizeGeneric('locataire(s)'),
};

// ------------------------------------------------------------------ Filiales
export const FILIALES_IMPORT: ImportConfig = {
  id: 'filiales',
  title: 'Importer des filiales',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par filiale.',
  endpoint: '/api/import/filiales',
  templateFileName: 'Modele-import-filiales.xlsx',
  sheetName: 'Filiales',
  firstHeaderKeyword: 'nom',
  columns: [
    col('nom', 'Nom', 'text', true),
    col('numeroReference', 'Numéro de référence'),
    col('date', 'Date', 'date'),
    col('rib', 'RIB'),
    col('banque', 'Banque'),
    col('modeReglement', 'Mode de règlement'),
  ],
  previewKeys: ['nom', 'numeroReference', 'date', 'banque'],
  notes: [
    'La banque, si elle est renseignée, doit exister dans Configuration > Données de référence > Banques.',
    'Une filiale déjà présente (même nom) est ignorée.',
  ],
  exemple: ['Filiale exemple', 'REF-001', '15/01/2026', '011780000012345678901234', 'Banque exemple', 'Virement'],
  summarize: summarizeGeneric('filiale(s)'),
};

// ------------------------------------------------------------------ Typologies de charge
export const TYPOLOGIES_CHARGE_IMPORT: ImportConfig = {
  id: 'typologies-charge',
  title: 'Importer des typologies de charge',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par typologie.',
  endpoint: '/api/import/typologies-charge',
  templateFileName: 'Modele-import-typologies-charge.xlsx',
  sheetName: 'Typologies de charge',
  firstHeaderKeyword: 'typologie',
  columns: [col('typologie', 'Typologie', 'text', true), col('compte', 'Compte'), col('description', 'Description')],
  previewKeys: ['typologie', 'compte', 'description'],
  notes: ['Une typologie déjà présente (même nom) est ignorée.'],
  exemple: ['Entretien', '6111', "Charges d'entretien"],
  summarize: summarizeGeneric('typologie(s)'),
};

// ------------------------------------------------------------------ Listes de référence génériques
// Exemples (fictifs) de la feuille « Exemple » du modèle de chaque liste de référence.
const LOOKUP_EXEMPLES: Record<string, string> = {
  villes: 'Casablanca',
  'building-types': 'Immeuble de bureaux',
  'typologies-lot': 'Bureau',
  proprietaires: 'Propriétaire exemple',
  banques: 'Banque exemple',
  pays: 'Maroc',
  periodicites: 'Mensuelle',
  'types-taxe': 'Taxe de services communaux',
  encaisseurs: 'Encaisseur exemple',
  assureurs: 'Assureur exemple',
  courtiers: 'Courtier exemple',
  'societes-immobilieres': 'Société immobilière exemple',
  'typologies-sinistre': 'Dégât des eaux',
  'service-profils': 'Gestionnaire',
};

// segment = segment d'URL du module (villes, banques, building-types…), voir lookupModules.ts.
export const lookupImportConfig = (segment: string, label: string, flagLabel?: string): ImportConfig => ({
  id: `reference-${segment}`,
  title: `Importer : ${label}`,
  description: `Importation depuis un fichier Excel (.xlsx) : une ligne par élément de la liste « ${label} ».`,
  endpoint: `/api/import/reference/${segment}`,
  templateFileName: `Modele-import-${segment}.xlsx`,
  sheetName: label.slice(0, 31).replace(/[\\/?*[\]:]/g, ' '),
  firstHeaderKeyword: 'désignation',
  columns: [col('designation', 'Désignation', 'text', true), ...(flagLabel ? [col('accesComplet', flagLabel, 'bool')] : [])],
  previewKeys: flagLabel ? ['designation', 'accesComplet'] : ['designation'],
  notes: [
    ...(flagLabel ? [`« ${flagLabel} » : Oui ou Non (Non par défaut).`] : []),
    'Un élément déjà présent (même désignation) est ignoré.',
  ],
  exemple: LOOKUP_EXEMPLES[segment] ? [LOOKUP_EXEMPLES[segment], ...(flagLabel ? ['Non'] : [])] : undefined,
  summarize: summarizeGeneric('élément(s)'),
});
