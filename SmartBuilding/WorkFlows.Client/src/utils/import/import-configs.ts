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

// ------------------------------------------------------------------ Property Management : prestataires
export const PRESTATAIRES_IMPORT: ImportConfig = {
  id: 'prestataires',
  title: 'Importer des prestataires',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par prestataire.',
  endpoint: '/api/import/prestataires',
  templateFileName: 'Modele-import-prestataires.xlsx',
  sheetName: 'Prestataires',
  firstHeaderKeyword: 'désignation',
  columns: [
    col('designation', 'Désignation', 'text', true),
    col('activite', 'Activité'),
    col('typePrestataire', 'Type de prestataire'),
    col('enseigne', 'Enseigne'),
    col('rc', 'RC'),
    col('idf', 'Identifiant fiscal'),
    col('ice', 'ICE'),
    col('adresse', 'Adresse'),
    col('codePostal', 'Code postal'),
    col('ville', 'Ville'),
    col('pays', 'Pays'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['designation', 'activite', 'ice', 'ville'],
  notes: [
    'La ville, si elle est renseignée, doit exister dans Configuration > Données de référence > Villes.',
    'Un prestataire déjà présent (même désignation) est ignoré.',
  ],
  exemple: ['Entreprise exemple', 'Nettoyage', 'Société', 'Enseigne exemple', '123456', '12345678', '001234567000012', 'Rue exemple', '20000', 'Casablanca', 'Maroc', ''],
  summarize: summarizeGeneric('prestataire(s)'),
};

// ------------------------------------------------------------------ Property Management : assurances
export const ASSURANCES_IMPORT: ImportConfig = {
  id: 'assurances',
  title: 'Importer des assurances',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par police d’assurance.',
  endpoint: '/api/import/assurances',
  templateFileName: 'Modele-import-assurances.xlsx',
  sheetName: 'Assurances',
  firstHeaderKeyword: 'police',
  columns: [
    col('numPolice', 'N° de police', 'text', true),
    col('assureur', 'Assureur', 'text', true),
    col('courtier', 'Courtier'),
    col('typeCouverture', 'Type de couverture'),
    col('dateEffetContrat', "Date d'effet", 'date'),
    col('montant', 'Montant', 'number'),
    col('statut', 'Statut'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['numPolice', 'assureur', 'dateEffetContrat', 'montant'],
  notes: [
    "L'assureur doit exister dans Configuration > Données de référence > Assureurs ; le courtier, s'il est renseigné, dans Courtiers.",
    'Statut : EnCours ou Terminé (EnCours par défaut).',
    'Une police déjà présente (même assureur et même numéro) est ignorée.',
  ],
  exemple: ['POL-2026-001', 'Assureur exemple', 'Courtier exemple', 'Multirisque immeuble', '01/01/2026', 25000, 'EnCours', ''],
  summarize: summarizeGeneric('assurance(s)'),
};

// ------------------------------------------------------------------ Property Management : charges
export const CHARGES_IMPORT: ImportConfig = {
  id: 'charges',
  title: 'Importer des charges',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par charge (budget prévu et réalisé d’une année).',
  endpoint: '/api/import/charges',
  templateFileName: 'Modele-import-charges.xlsx',
  sheetName: 'Charges',
  firstHeaderKeyword: 'actif',
  columns: [
    col('actif', 'Actif', 'text', true),
    col('typologie', 'Typologie de charge', 'text', true),
    col('prestataire', 'Prestataire'),
    col('annee', 'Année', 'int', true),
    col('montant', 'Montant prévu', 'number'),
    col('realisation', 'Montant réalisé', 'number'),
    col('dateDecaissement', 'Date de décaissement', 'date'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['actif', 'typologie', 'annee', 'montant', 'realisation'],
  notes: [
    "L'actif doit déjà exister (nom ou code analytique), ainsi que la typologie de charge (Configuration > Typologies de charge) et le prestataire s'il est renseigné.",
    'Le code de la charge (CH + numéro) est attribué automatiquement.',
    'Une charge déjà présente (même actif, typologie, année et prestataire) est ignorée.',
  ],
  exemple: ['Immeuble Exemple', 'Entretien', 'Entreprise exemple', 2026, 120000, 95000, '31/12/2026', ''],
  summarize: summarizeGeneric('charge(s)'),
};

// ------------------------------------------------------------------ Property Management : taxes
export const TAXES_IMPORT: ImportConfig = {
  id: 'taxes',
  title: 'Importer des taxes',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par taxe (actif, local, année).',
  endpoint: '/api/import/taxes',
  templateFileName: 'Modele-import-taxes.xlsx',
  sheetName: 'Taxes',
  firstHeaderKeyword: 'actif',
  columns: [
    col('actif', 'Actif', 'text', true),
    col('local', 'Local'),
    col('locataire', 'Locataire'),
    col('typeTaxe', 'Type de taxe', 'text', true),
    col('idFiscal', 'Identifiant fiscal'),
    col('noArticle', "N° d'article"),
    col('montantTaxe', 'Montant', 'number'),
    col('annee', 'Année', 'int', true),
    col('paye', 'Payée', 'bool'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['actif', 'local', 'typeTaxe', 'annee', 'montantTaxe'],
  notes: [
    "L'actif doit déjà exister ; le type de taxe doit exister dans Configuration > Données de référence > Types de taxe.",
    "Le local (nom, dans cet actif) et le locataire (raison sociale ou « nom prénom »), s'ils sont renseignés, doivent déjà exister.",
    '« Payée » : Oui ou Non (Non par défaut).',
    'Une taxe déjà présente (même actif, local, locataire, type et année) est ignorée.',
  ],
  exemple: ['Immeuble Exemple', 'Plateau 3A', '', 'Taxe de services communaux', '12345678', 'A-1024', 18000, 2026, 'Non', ''],
  summarize: summarizeGeneric('taxe(s)'),
};

// ------------------------------------------------------------------ Property Management : membres du syndic
export const MEMBRES_SYNDIC_IMPORT: ImportConfig = {
  id: 'membres-syndic',
  title: 'Importer des membres du syndic',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par membre.',
  endpoint: '/api/import/membres-syndic',
  templateFileName: 'Modele-import-membres-syndic.xlsx',
  sheetName: 'Membres du syndic',
  firstHeaderKeyword: 'nom',
  columns: [
    col('nom', 'Nom', 'text', true),
    col('prenom', 'Prénom'),
    col('poste', 'Poste'),
    col('telephone', 'Téléphone'),
    col('debutMandat', 'Début du mandat', 'date'),
    col('finMandat', 'Fin du mandat', 'date'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['nom', 'prenom', 'poste', 'debutMandat', 'finMandat'],
  notes: [
    'La fin du mandat ne peut pas précéder son début.',
    "L'identifiant du membre (SYN + numéro) est attribué automatiquement.",
    'Un membre déjà présent (même nom et même prénom) est ignoré.',
  ],
  exemple: ['Alami', 'Karim', 'Président', '0600000000', '01/01/2026', '31/12/2027', ''],
  summarize: summarizeGeneric('membre(s)'),
};

// ------------------------------------------------------------------ Typologies d'immobilisation
export const TYPOLOGIES_IMMOBILISATION_IMPORT: ImportConfig = {
  id: 'typologies-immobilisation',
  title: "Importer des typologies d'immobilisation",
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par typologie.',
  endpoint: '/api/import/typologies-immobilisation',
  templateFileName: 'Modele-import-typologies-immobilisation.xlsx',
  sheetName: "Typologies d'immobilisation",
  firstHeaderKeyword: 'immobilisation',
  columns: [
    col('immobilisationConcernee', 'Immobilisation concernée', 'text', true),
    col('compteComptable', 'Compte comptable'),
    col('compteAmortissement', "Compte d'amortissement"),
    col('compteDotation', 'Compte de dotation'),
    col('taux', 'Taux (%)', 'number'),
    col('duree', 'Durée', 'int'),
  ],
  previewKeys: ['immobilisationConcernee', 'compteComptable', 'taux', 'duree'],
  notes: ['Le taux est un pourcentage entre 0 et 100.', 'Une typologie déjà présente (même immobilisation concernée) est ignorée.'],
  exemple: ['Construction', '2321', '2832', '6193', 4, 25],
  summarize: summarizeGeneric('typologie(s)'),
};

// ------------------------------------------------------------------ Property Management : contrats prestataires
export const CONTRATS_PRESTATAIRES_IMPORT: ImportConfig = {
  id: 'contrats-prestataires',
  title: 'Importer des contrats prestataires',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par contrat.',
  endpoint: '/api/import/contrats-prestataires',
  templateFileName: 'Modele-import-contrats-prestataires.xlsx',
  sheetName: 'Contrats prestataires',
  firstHeaderKeyword: 'prestataire',
  columns: [
    col('prestataire', 'Prestataire', 'text', true),
    col('objet', 'Objet', 'text', true),
    col('dateContrat', 'Date du contrat', 'date'),
    col('dateDebut', 'Date de début', 'date'),
    col('dateFin', 'Date de fin', 'date'),
    col('montant', 'Montant', 'number'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['prestataire', 'objet', 'dateDebut', 'dateFin', 'montant'],
  notes: [
    'Le prestataire doit déjà exister (importez ou créez-le d’abord).',
    'Le numéro du contrat (CNTR + numéro) est attribué automatiquement.',
    'Un contrat déjà présent (même prestataire, objet et date de début) est ignoré.',
  ],
  exemple: ['Entreprise exemple', 'Contrat de nettoyage annuel', '15/12/2025', '01/01/2026', '31/12/2026', 60000, ''],
  summarize: summarizeGeneric('contrat(s)'),
};

// ------------------------------------------------------------------ Property Management : bons de commande
export const BONS_COMMANDE_IMPORT: ImportConfig = {
  id: 'bons-commande',
  title: 'Importer des bons de commande',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par bon de commande.',
  endpoint: '/api/import/bons-commande',
  templateFileName: 'Modele-import-bons-commande.xlsx',
  sheetName: 'Bons de commande',
  firstHeaderKeyword: 'bon',
  columns: [
    col('numeroBonCommande', 'N° de bon de commande', 'text', true),
    col('prestataire', 'Prestataire', 'text', true),
    col('dateCommande', 'Date de commande', 'date', true),
    col('dateReception', 'Date de réception', 'date'),
    col('compte', 'Compte'),
    col('compteComptable', 'Compte comptable'),
    col('statutApprobation', "Statut d'approbation"),
    col('notes', 'Notes'),
  ],
  previewKeys: ['numeroBonCommande', 'prestataire', 'dateCommande', 'statutApprobation'],
  notes: [
    'Le prestataire doit déjà exister.',
    "Statut d'approbation : En attente (par défaut), Approuvé ou Rejeté.",
    'Un bon déjà présent (même numéro) est ignoré.',
  ],
  exemple: ['BC-2026-001', 'Entreprise exemple', '10/02/2026', '20/02/2026', '6111', '61110000', 'Approuvé', ''],
  summarize: summarizeGeneric('bon(s) de commande'),
};

// ------------------------------------------------------------------ Property Management : prestations d'achat
export const PRESTATIONS_ACHAT_IMPORT: ImportConfig = {
  id: 'prestations-achat',
  title: 'Importer des prestations',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par prestation d’un bon de commande.',
  endpoint: '/api/import/prestations-achat',
  templateFileName: 'Modele-import-prestations.xlsx',
  sheetName: 'Prestations',
  firstHeaderKeyword: 'bon',
  columns: [
    col('numeroBonCommande', 'N° de bon de commande', 'text', true),
    col('actif', 'Actif', 'text', true),
    col('typologie', 'Typologie de charge', 'text', true),
    col('prixUnitaireHt', 'Prix unitaire HT', 'number', true),
    col('quantite', 'Quantité', 'number'),
    col('tauxTva', 'Taux de TVA (%)', 'number'),
    col('dureeAmortissementMois', "Durée d'amortissement (mois)", 'int'),
    col('tauxAmortissement', "Taux d'amortissement (%)", 'number'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['numeroBonCommande', 'actif', 'typologie', 'prixUnitaireHt', 'quantite'],
  notes: [
    "Le bon de commande, l'actif et la typologie de charge doivent déjà exister.",
    'La quantité vaut 1 si elle est vide.',
    'Une prestation déjà présente (même bon, actif, typologie, prix et quantité) est ignorée.',
  ],
  exemple: ['BC-2026-001', 'Immeuble Exemple', 'Entretien', 5000, 12, 20, '', '', ''],
  summarize: summarizeGeneric('prestation(s)'),
};

// ------------------------------------------------------------------ Property Management : réclamations
export const RECLAMATIONS_IMPORT: ImportConfig = {
  id: 'reclamations',
  title: 'Importer des réclamations',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par réclamation.',
  endpoint: '/api/import/reclamations',
  templateFileName: 'Modele-import-reclamations.xlsx',
  sheetName: 'Réclamations',
  firstHeaderKeyword: 'actif',
  columns: [
    col('actif', 'Actif', 'text', true),
    col('local', 'Local'),
    col('locataire', 'Locataire', 'text', true),
    col('etat', 'État'),
    col('dateReclamation', 'Date de la réclamation', 'date'),
    col('objet', 'Objet'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['actif', 'locataire', 'etat', 'dateReclamation', 'objet'],
  notes: [
    "L'actif et le locataire doivent déjà exister ; le local (nom, dans cet actif), s'il est renseigné, aussi.",
    'État : Ouverte (par défaut), En traitement, Résolue ou Fermée.',
    'Une réclamation déjà présente (même actif, local, locataire, date et objet) est ignorée.',
  ],
  exemple: ['Immeuble Exemple', 'Plateau 3A', 'Locataire exemple', 'Ouverte', '05/03/2026', 'Fuite dans la salle de réunion', ''],
  summarize: summarizeGeneric('réclamation(s)'),
};

// ------------------------------------------------------------------ Property Management : sinistres
export const SINISTRES_IMPORT: ImportConfig = {
  id: 'sinistres',
  title: 'Importer des sinistres',
  description: 'Importation depuis un fichier Excel (.xlsx) : une ligne par sinistre.',
  endpoint: '/api/import/sinistres',
  templateFileName: 'Modele-import-sinistres.xlsx',
  sheetName: 'Sinistres',
  firstHeaderKeyword: 'actif',
  columns: [
    col('actif', 'Actif', 'text', true),
    col('local', 'Local'),
    col('numPolice', "N° de police d'assurance"),
    col('typeSinistre', 'Type de sinistre', 'text', true),
    col('etapeSuivi', 'Étape de suivi'),
    col('dateDeclaration', 'Date de déclaration', 'date'),
    col('dateExpertise', "Date d'expertise", 'date'),
    col('dateReclamation', 'Date de réclamation', 'date'),
    col('dateRemboursement', 'Date de remboursement', 'date'),
    col('estimationDegatBailleur', 'Estimation des dégâts (bailleur)', 'number'),
    col('estimationDegatLocataire', 'Estimation des dégâts (locataire)', 'number'),
    col('montantFacture', 'Montant facturé', 'number'),
    col('montantRemuneration', 'Montant de rémunération', 'number'),
    col('nomExpert', "Nom de l'expert"),
    col('refDossierAssurance', 'Réf. dossier assurance'),
    col('noSinistre', 'N° de sinistre'),
    col('notes', 'Notes'),
  ],
  previewKeys: ['actif', 'typeSinistre', 'etapeSuivi', 'dateDeclaration', 'noSinistre'],
  notes: [
    "L'actif doit déjà exister, ainsi que le type de sinistre (Configuration > Données de référence > Typologies de sinistre) ; le local et la police d'assurance, s'ils sont renseignés, aussi.",
    'Étape de suivi : Déclaré (par défaut), Expertise, Réclamation, Remboursement ou Clôturé.',
    "L'identifiant du sinistre (SIN + numéro) est attribué automatiquement.",
    'Un sinistre déjà présent (même n° de sinistre, ou mêmes actif, local, type et date de déclaration) est ignoré.',
  ],
  exemple: ['Immeuble Exemple', 'Plateau 3A', 'POL-2026-001', 'Dégât des eaux', 'Déclaré', '12/03/2026', '', '', '', 15000, '', '', '', 'Expert exemple', 'DOS-001', 'SIN-2026-01', ''],
  summarize: summarizeGeneric('sinistre(s)'),
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
