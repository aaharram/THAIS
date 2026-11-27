import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { getLookupModuleConfig } from '@/store/features/configuration/lookupModules';
import { ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useMediaQuery } from 'react-responsive';
import { useLocation, useNavigate } from 'react-router';
import { formatFrenchDateTime } from '../../utils/formatters';
import { NavUser } from './nav-user';

const LABEL_MAP: Record<string, string> = {
  'configuration-globale': 'Configuration',
  configurations: 'Configuration',
  utilisateurs: 'Utilisateurs',
  roles: 'Rôles',
  membres: 'Membres',
  equipes: 'Équipes',
  equipe: 'Affectation des équipes',
  projets: 'Suivi de projet',
  projet: 'Suivi de projet',
  fiche: 'Fiche projet',
  planning: 'Planification',
  'qr-codes': 'QR Codes',
  // Blocs du Reporting : mêmes noms que sur le hub (accents compris).
  'revision-loyer': 'Révision Loyer',
  'etat-des-loyers': 'Etat des loyers Comptables',
  'etat-par-immeuble': 'Etat des loyers / Actif',
  'impayes-par-age': 'Etat des loyers impayés par période',
  'etat-impaye': 'Etat Impayé',
  'suivi-impaye': 'Suivi Impayé',
  'apercu-emissions-encaissement': 'Etat globale Emissions / Encaissements',
  'suivi-encaissement': 'Suivi Encaissement',
  'nouveaux-baux': 'Etat des Nouveaux Baux',
  'cpc-immobilier': 'CPC Immobilier',
  'patrimoine-opci': 'Patrimoine OPCI',
  'etats-reglementaires': 'États réglementaires',
  'taxe-habitation': 'Taxe d’habitation',
  'rapport-encaisseur': 'Rapport encaisseur',
  materiaux: 'Matériaux',
  'familles-materiaux': 'Familles de matériaux',
  contrats: 'Contrats',
  factures: 'Factures',
  charges: 'Charges et dépenses',
  stocks: 'Gestion des stocks',
  'equipes-employes': 'Gestion des équipes – Employés',
  fournisseurs: 'Fournisseurs',
  magasins: 'Magasins',
  fournitures: 'Fournitures',
  'detail-stock': 'Détail du stock',
  'stock-materiaux': 'Matériaux',
  commandes: 'Commandes',
  mouvements: 'Mouvements de stock',
  alertes: 'Alertes de stock',
  'mon-compte': 'Mon compte',
  'gestion-equipes': 'Gestion des équipes',
  presences: 'Gestion des présences',
  'historique-scans': 'Historique des scans',
  'historique-qr-codes': 'Historique des QR Codes',
  ged: 'Gestion électronique des documents',
  demandes: 'Demandes',
  ajouter: 'Ajouter',
  modifier: 'Modifier',
  details: 'Détails',
  apercu: 'Aperçu',
  brancardiers: 'Brancardiers',
  'flux-de-travail': 'Flux de travail',
  referentiel: 'Référentiels',
  parametres: 'Paramètres',
  etablissements: 'Établissements',
  batiments: 'Bâtiments',
  'espaces-types': "Types d'espaces",
  categories: 'Catégories',
  'utilisateurs-groupes': 'Utilisateurs & Groupes',
  groupes: 'Groupes',
  creer: 'Créer',
  precautions: 'Précautions',
  'equipements-protections-individuel': 'Équipements de protection individuelle',
  processus: 'Processus',
  'regles-de-service': 'Règles de service',
  'horaires-service': 'Horaires de service',
  'routes-travail': 'Routes de travail',
  'frequences-types': 'Types de fréquences',
  ldap: 'LDAP',
  reference: 'Référence',
  'reference-dediee': 'Référence',
  'property-management': 'Property Management',
  prestataires: 'Prestataires',
  assurances: 'Assurances',
  taxes: 'Taxes',
  syndics: 'Gestion des syndics',
  reunions: 'Réunions',
  sinistres: 'Sinistres',
  'bon-de-commande': 'Bon de Commande',
  'liste-prestations': 'Liste des prestations',
  reclamations: 'Réclamations',
  'membres-syndic': 'Membres du syndic',
  recouvrement: 'Recouvrement',
  'suivi-recouvrement': 'Suivi Recouvrement',
  'paiement-client': 'Paiement Client',
  encaissement: 'Encaissement',
  'annulation-encaissement': 'Annulation Encaissement En cours',
  'encaissements-annules': 'Encaissements annulés',
  'suivi-contentieux': 'Suivi Contentieux',
  avocats: 'Avocat',
  'suivi-remises': 'Suivi Remises',
  patrimoine: 'Asset Management',
  'asset-management': 'Asset Management',
  vnc: 'VNC / Provision',
  actifs: 'Actifs',
};

// Sections racines : quand l'URL courante appartient à l'une d'elles, le fil
// d'ariane doit commencer par CETTE section (le module dans lequel on se trouve),
// et non systématiquement par "Tableau de bord".
const ROOT_SECTIONS: Record<string, { label: string; path: string }> = {
  'gestion-equipes': { label: 'Gestion des équipes', path: '/gestion-equipes' },
  'historique-qr-codes': { label: 'Historique des QR Codes', path: '/historique-qr-codes' },
  ged: { label: 'Gestion électronique des documents', path: '/ged' },
  projets: { label: 'Suivi de projet', path: '/projets' },
  projet: { label: 'Suivi de projet', path: '/projets' },
  contrats: { label: 'Gestion des contrats', path: '/contrats' },
  factures: { label: 'Gestion des factures', path: '/factures' },
  charges: { label: 'Gestion des charges et dépenses', path: '/charges' },
  stocks: { label: 'Gestion des stocks', path: '/stocks' },
  'configuration-globale': { label: 'Configuration', path: '/configuration-globale' },
  configurations: { label: 'Configuration', path: '/configurations' },
};

// Les modules de données de référence génériques (GenericLookupList/Form) utilisent leur
// clé de store ("cfgEncaisseurs", "cfgVilles"...) comme segment d'URL - on réutilise leur
// label déjà défini dans lookupModuleConfigs plutôt que d'afficher la clé technique brute
// ("CfgEncaisseurs") dans le fil d'ariane, pour retomber sur l'intitulé RMANew ("Encaisseur").
const formatBreadcrumbLabel = (segment: string): string => {
  const lookupLabel = getLookupModuleConfig(segment)?.label;
  return lookupLabel ?? LABEL_MAP[segment] ?? segment.replace(/-/g, ' ').replace(/^\w/, (c) => c.toUpperCase());
};

// "reference-dediee" n'est qu'un préfixe de chemin pour les modules de référence à champs
// spécifiques (Filiales, Typologies...) - il n'existe aucune route pour ce segment seul
// (seulement pour ses enfants, ex. reference-dediee/filiales), donc son lien de fil
// d'ariane doit pointer vers le vrai hub qui les regroupe tous ("/reference"), sous peine
// de 404 au clic.
const BREADCRUMB_LINK_OVERRIDE: Record<string, string> = {
  'reference-dediee': '/configuration-globale/reference',
  patrimoine: '/patrimoine/asset-management',
};

// Baux/Résiliations/Suspensions/Attestations s'ouvrent depuis le hub "Contractualisation"
// mais leurs routes ne sont pas nichées sous /leasing-management/contractualisation/... -
// on insère cette miette virtuelle (absente de l'URL) pour pouvoir y revenir en un clic,
// plutôt que de renicher les routes existantes (risque de casser d'autres liens).
const VIRTUAL_PARENT_CRUMB: Record<string, { label: string; path: string }> = {
  baux: { label: 'Contractualisation', path: '/leasing-management/contractualisation' },
  resiliations: { label: 'Contractualisation', path: '/leasing-management/contractualisation' },
  suspensions: { label: 'Contractualisation', path: '/leasing-management/contractualisation' },
  attestations: { label: 'Contractualisation', path: '/leasing-management/contractualisation' },
};

// Typologie Immobilisation est une des 6 tuiles du hub Asset Management, mais c'est aussi
// un module de référence générique vivant sous /configuration-globale/reference-dediee/...
// - trop loin de VIRTUAL_PARENT_CRUMB (qui n'insère qu'au niveau du 2e segment) pour rester
// cohérent avec "Configuration" comme racine. On remplace ici tout le fil d'ariane par
// celui du hub d'où la tuile a été ouverte, plutôt que de garder la racine Configuration.
const FULL_BREADCRUMB_OVERRIDE: Record<
  string,
  { rootLabel: string; rootPath: string; crumbs: { label: string; path: string }[] }
> = {
  '/configuration-globale/reference-dediee/typologies-immobilisation': {
    rootLabel: 'Tableau de bord',
    rootPath: '/',
    crumbs: [
      { label: 'Asset Management', path: '/patrimoine/asset-management' },
      { label: 'Typologie Immobilisation', path: '/configuration-globale/reference-dediee/typologies-immobilisation' },
    ],
  },
  '/patrimoine/amortissements': {
    rootLabel: 'Tableau de bord',
    rootPath: '/',
    crumbs: [
      { label: 'Asset Management', path: '/patrimoine/asset-management' },
      { label: 'Amortissements', path: '/patrimoine/amortissements' },
    ],
  },
};

// Construit chaque miette à partir des segments d'origine (IDs inclus) afin que
// les liens générés restent des routes valides, même quand un id numérique se
// trouve au milieu du chemin (ex: /projet/5/fiche -> le lien "Fiche" doit
// pointer vers /projet/5/fiche, pas /projet/fiche).
const generateBreadcrumbs = (pathname: string) => {
  const segments = pathname.split('/').filter((segment) => segment);

  const crumbs = segments
    .map((segment, index) => ({ segment, index }))
    .filter(({ segment }) => !/^\d+$/.test(segment))
    .map(({ segment, index }) => ({
      label: formatBreadcrumbLabel(segment),
      path: BREADCRUMB_LINK_OVERRIDE[segment] ?? `/${segments.slice(0, index + 1).join('/')}`,
    }));

  const virtualParent = VIRTUAL_PARENT_CRUMB[segments[1]];
  if (virtualParent) {
    crumbs.splice(1, 0, virtualParent);
  }

  // Un segment redirigé (ex: BREADCRUMB_LINK_OVERRIDE['patrimoine'] -> le hub Asset
  // Management) peut résoudre vers le même chemin que le segment suivant quand on est
  // déjà sur ce hub (ex: /patrimoine/asset-management) - deux miettes avec le même
  // `path`, donc la même clé React, ce qui casse leur rendu. On ne garde que la
  // dernière occurrence (la plus précise) de chaque chemin dupliqué.
  return crumbs.filter((crumb, idx) => crumb.path !== crumbs[idx + 1]?.path);
};

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  // Correspond à la base elle-même ou à l'une de ses sous-routes (ajouter/modifier/:id/...).
  const fullOverrideEntry = Object.entries(FULL_BREADCRUMB_OVERRIDE).find(
    ([base]) => location.pathname === base || location.pathname.startsWith(`${base}/`),
  );

  const firstSegment = location.pathname.split('/').filter(Boolean)[0];
  const rootSection = firstSegment ? ROOT_SECTIONS[firstSegment] : undefined;
  const rootLabel = fullOverrideEntry ? fullOverrideEntry[1].rootLabel : (rootSection?.label ?? 'Tableau de bord');
  const rootPath = fullOverrideEntry ? fullOverrideEntry[1].rootPath : (rootSection?.path ?? '/');

  const allBreadcrumbs = generateBreadcrumbs(location.pathname);
  // La liste des actifs filtrée par prospection (?prospection=) affiche des "Biens"
  // (rattachés à un dossier de prospection), pas les "Immeubles"/Actifs en général.
  const isBiensDeProspection =
    location.pathname === '/patrimoine/actifs' && new URLSearchParams(location.search).has('prospection');
  if (isBiensDeProspection) {
    const last = allBreadcrumbs[allBreadcrumbs.length - 1];
    if (last) {
      last.label = 'Biens';
    }
  }
  // Une page d'Archives ouverte depuis un bloc du Reporting (?from=reporting) garde le fil d'ariane du Reporting.
  const fromReporting =
    location.pathname === '/archives/annulations-quittances' &&
    new URLSearchParams(location.search).get('from') === 'reporting';
  // La première miette correspond déjà à la section racine affichée ci-dessus : on l'enlève pour éviter le doublon.
  const breadcrumbs = fromReporting
    ? [
        { label: 'Reporting', path: '/reporting' },
        { label: 'Etat Annulation des Quittances', path: location.pathname },
      ]
    : fullOverrideEntry
    ? [
        ...fullOverrideEntry[1].crumbs,
        // Segments après la base (ex: "ajouter", "modifier/:id") : repris tels quels depuis
        // allBreadcrumbs (déjà calculées sur le chemin complet, donc avec les bons liens),
        // en sautant ceux déjà couverts par les miettes de la base ci-dessus.
        ...allBreadcrumbs.slice(fullOverrideEntry[0].split('/').filter(Boolean).length),
      ]
    : rootSection
      ? allBreadcrumbs.slice(1)
      : allBreadcrumbs;
  // La racine n'est la page courante (donc non cliquable) que lorsqu'aucune autre miette ne suit.
  const isRootCurrentPage = breadcrumbs.length === 0;
  const currentPageLabel = isRootCurrentPage ? rootLabel : breadcrumbs[breadcrumbs.length - 1].label;
  const isOnlyDashboard = location.pathname === '/';
  const showRoot = true;

  const [dateTimeNow, setDateTimeNow] = useState(formatFrenchDateTime(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTimeNow(formatFrenchDateTime(new Date()));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <header className='sticky top-0 z-30 flex bg-white h-16 shrink-0 items-center border-b px-4'>
      {/* LEFT */}
      <div className='flex items-center gap-2'>
        <SidebarTrigger className='-ml-1' />

        {isMobile ? (
          <div className='flex flex-col'>
            <button
              className='text-primary font-medium flex items-center gap-1'
              onClick={() => navigate(-1)}
            >
              <ChevronRight className='rotate-180 w-4 h-4' />
              Retour
            </button>
            <span className='text-xs text-muted-foreground truncate max-w-[200px]'>
              {currentPageLabel}
            </span>
          </div>
        ) : (
          <div className='flex flex-col'>
            <Breadcrumb>
              <BreadcrumbList>
                {showRoot && (
                  <BreadcrumbItem className='hidden md:block'>
                    {isRootCurrentPage ? (
                      <BreadcrumbPage className='font-semibold'>{rootLabel}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink className='cursor-pointer' onClick={() => navigate(rootPath)}>
                        {rootLabel}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                )}

                {breadcrumbs.map((breadcrumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;

                  return (
                    <React.Fragment key={breadcrumb.path}>
                      {(showRoot || index > 0) && <BreadcrumbSeparator className='hidden md:block' />}
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage className='font-semibold'>{breadcrumb.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            className='cursor-pointer'
                            onClick={() => navigate(breadcrumb.path)}
                          >
                            {breadcrumb.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>

            {isOnlyDashboard && (
              <span className='text-xs text-muted-foreground'>
                {dateTimeNow.charAt(0).toUpperCase() + dateTimeNow.slice(1)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className='ml-auto flex items-center gap-2'>
        <NavUser />
      </div>
    </header>
  );
};

export default Navbar;
