import { AppLogo } from '@/components/brand/AppLogo';
import AppFooter from '@/components/footer/app-footer';
import Navbar from '@/components/navbar/navbar';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import GenericLookupForm from '@/components/configuration/GenericLookupForm';
import GenericLookupList from '@/components/configuration/GenericLookupList';
import Filiales from '@/pages/Configuration/ReferenceData/Filiales/Filiales';
import FormFiliale from '@/pages/Configuration/ReferenceData/Filiales/Form';
import TypologiesCharge from '@/pages/Configuration/ReferenceData/TypologiesCharge/TypologiesCharge';
import FormTypologieCharge from '@/pages/Configuration/ReferenceData/TypologiesCharge/Form';
import TypologiesImmobilisation from '@/pages/Configuration/ReferenceData/TypologiesImmobilisation/TypologiesImmobilisation';
import FormTypologieImmobilisation from '@/pages/Configuration/ReferenceData/TypologiesImmobilisation/Form';
import Buildings from '@/pages/Patrimoine/Buildings/Buildings';
import FormBuilding from '@/pages/Patrimoine/Buildings/Form';
import ApercuBuilding from '@/pages/Patrimoine/Buildings/Apercu';
import AssetManagement from '@/pages/Patrimoine/AssetManagement/AssetManagement';
import Archives from '@/pages/Archives/Archives';
import Reporting from '@/pages/Reporting/Reporting';
import EtatDesLoyers from '@/pages/Reporting/EtatDesLoyers/EtatDesLoyers';
import HistoriqueEtatDesLoyers from '@/pages/Reporting/EtatDesLoyers/HistoriqueEtatDesLoyers';
import ImpayesParAge from '@/pages/Reporting/ImpayesParAge/ImpayesParAge';
import EtatParImmeuble from '@/pages/Reporting/EtatParImmeuble/EtatParImmeuble';
import PatrimoineOpci from '@/pages/Reporting/PatrimoineOpci/PatrimoineOpci';
import EtatsReglementaires from '@/pages/Reporting/EtatsReglementaires/EtatsReglementaires';
import EtatImpaye from '@/pages/Reporting/EtatImpaye/EtatImpaye';
import ApercuEmissionsEncaissement from '@/pages/Reporting/ApercuEmissionsEncaissement/ApercuEmissionsEncaissement';
import SuiviEncaissement from '@/pages/Reporting/SuiviEncaissement/SuiviEncaissement';
import RapportEncaisseur from '@/pages/Reporting/RapportEncaisseur/RapportEncaisseur';
import CpcImmobilier from '@/pages/Reporting/CpcImmobilier/CpcImmobilier';
import FormCpcImmobilier from '@/pages/Reporting/CpcImmobilier/Form';
import DetailCpcImmobilier from '@/pages/Reporting/CpcImmobilier/Detail';
import ReportingJournalComptable from '@/pages/Reporting/JournalComptable/JournalComptable';
import ReportingRevisionLoyer from '@/pages/Reporting/RevisionLoyer/RevisionLoyer';
import ReportingLocauxVacants from '@/pages/Reporting/LocauxVacants/LocauxVacants';
import NouveauxBaux from '@/pages/Reporting/NouveauxBaux/NouveauxBaux';
import SuiviImpaye from '@/pages/Reporting/SuiviImpaye/SuiviImpaye';
import TaxeHabitation from '@/pages/Reporting/TaxeHabitation/TaxeHabitation';
import ArchivesActifs from '@/pages/Archives/Actifs/Actifs';
import ArchivesLocaux from '@/pages/Archives/Locaux/Locaux';
import ArchivesLocataires from '@/pages/Archives/Locataires/Locataires';
import ArchivesLocations from '@/pages/Archives/Locations/Locations';
import ArchivesVentes from '@/pages/Archives/Ventes/Ventes';
import ArchivesAnnulationsQuittances from '@/pages/Archives/AnnulationsQuittances/AnnulationsQuittances';
import ArchivesContentieuxHorsLocation from '@/pages/Archives/ContentieuxHorsLocation/ContentieuxHorsLocation';
import FormContentieuxHorsLocation from '@/pages/Archives/ContentieuxHorsLocation/Form';
import Dashboard from '@/pages/Dashboard/Dashboard';
import Geolocation from '@/pages/Geolocation/Geolocation';
import Commercialisation from '@/pages/Commercialisation/Commercialisation';
import LeasingManagement from '@/pages/LeasingManagement/LeasingManagement';
import Contractualisation from '@/pages/LeasingManagement/Contractualisation/Contractualisation';
import Locataires from '@/pages/LeasingManagement/Locataires/Locataires';
import FormLocataire from '@/pages/LeasingManagement/Locataires/Form';
import Baux from '@/pages/LeasingManagement/Baux/Baux';
import FormBail from '@/pages/LeasingManagement/Baux/Form';
import Resiliations from '@/pages/LeasingManagement/Resiliations/Resiliations';
import FormResiliation from '@/pages/LeasingManagement/Resiliations/Form';
import Suspensions from '@/pages/LeasingManagement/Suspensions/Suspensions';
import FormSuspension from '@/pages/LeasingManagement/Suspensions/Form';
import Attestations from '@/pages/LeasingManagement/Attestations/Attestations';
import FormAttestation from '@/pages/LeasingManagement/Attestations/Form';
import RevisionsLoyers from '@/pages/LeasingManagement/RevisionsLoyers/RevisionsLoyers';
import FormRevisionLoyer from '@/pages/LeasingManagement/RevisionsLoyers/Form';
import Facturation from '@/pages/LeasingManagement/Facturation/Facturation';
import Avoirs from '@/pages/LeasingManagement/Avoirs/Avoirs';
import FormAvoir from '@/pages/LeasingManagement/Avoirs/Form';
import Recouvrement from '@/pages/LeasingManagement/Recouvrement/Recouvrement';
import SuiviRecouvrement from '@/pages/LeasingManagement/Recouvrement/SuiviRecouvrement/SuiviRecouvrement';
import FormRelance from '@/pages/LeasingManagement/Recouvrement/SuiviRecouvrement/Form';
import PaiementClient from '@/pages/LeasingManagement/Recouvrement/PaiementClient/PaiementClient';
import FormPaiement from '@/pages/LeasingManagement/Recouvrement/PaiementClient/Form';
import Encaissement from '@/pages/LeasingManagement/Recouvrement/Encaissement/Encaissement';
import AnnulationEncaissement from '@/pages/LeasingManagement/Recouvrement/AnnulationEncaissement/AnnulationEncaissement';
import EncaissementsAnnules from '@/pages/LeasingManagement/Recouvrement/EncaissementsAnnules/EncaissementsAnnules';
import SuiviContentieux from '@/pages/LeasingManagement/Recouvrement/SuiviContentieux/SuiviContentieux';
import FormSuiviContentieux from '@/pages/LeasingManagement/Recouvrement/SuiviContentieux/Form';
import Avocats from '@/pages/LeasingManagement/Recouvrement/SuiviContentieux/Avocats/Avocats';
import FormAvocat from '@/pages/LeasingManagement/Recouvrement/SuiviContentieux/Avocats/Form';
import SuiviRemises from '@/pages/LeasingManagement/Recouvrement/SuiviRemises/SuiviRemises';
import Factures from '@/pages/LeasingManagement/Facturation/Factures/Factures';
import FormFacture from '@/pages/LeasingManagement/Facturation/Factures/Form';
import JournalComptable from '@/pages/LeasingManagement/Facturation/JournalComptable/JournalComptable';
import FacturationManuelle from '@/pages/LeasingManagement/Facturation/FacturationManuelle/FacturationManuelle';
import AnnulationFacture from '@/pages/LeasingManagement/Facturation/AnnulationFacture/AnnulationFacture';
import LocauxVacants from '@/pages/Commercialisation/LocauxVacants';
import Cession from '@/pages/Commercialisation/Cession';
import Prospections from '@/pages/Commercialisation/Prospection/Prospections';
import FormProspection from '@/pages/Commercialisation/Prospection/Form';
import BienForm from '@/pages/Commercialisation/Prospection/BienForm';
import Locaux from '@/pages/Patrimoine/Locaux/Locaux';
import FormLocal from '@/pages/Patrimoine/Locaux/Form';
import Expertises from '@/pages/Patrimoine/Expertises/Expertises';
import FormExpertise from '@/pages/Patrimoine/Expertises/Form';
import Amortissements from '@/pages/Patrimoine/Amortissements/Amortissements';
import FormAmortissement from '@/pages/Patrimoine/Amortissements/Form';
import Vnc from '@/pages/Patrimoine/Vnc/Vnc';
import FormVnc from '@/pages/Patrimoine/Vnc/Form';
import Provisions from '@/pages/Patrimoine/Provisions/Provisions';
import FormProvision from '@/pages/Patrimoine/Provisions/Form';
import PropertyManagement from '@/pages/PropertyManagement/PropertyManagement';
import Prestataires from '@/pages/PropertyManagement/Prestataires/Prestataires';
import FormPrestataire from '@/pages/PropertyManagement/Prestataires/Form';
import Contrats from '@/pages/PropertyManagement/Prestataires/Contrats/Contrats';
import FormContrat from '@/pages/PropertyManagement/Prestataires/Contrats/Form';
import Assurances from '@/pages/PropertyManagement/Assurances/Assurances';
import FormAssurance from '@/pages/PropertyManagement/Assurances/Form';
import Charges from '@/pages/PropertyManagement/Charges/Charges';
import FormCharge from '@/pages/PropertyManagement/Charges/Form';
import MembresSyndic from '@/pages/PropertyManagement/MembresSyndic/MembresSyndic';
import FormMembreSyndic from '@/pages/PropertyManagement/MembresSyndic/Form';
import Sinistres from '@/pages/PropertyManagement/Sinistres/Sinistres';
import FormSinistre from '@/pages/PropertyManagement/Sinistres/Form';
import Reclamations from '@/pages/PropertyManagement/Reclamations/Reclamations';
import FormReclamation from '@/pages/PropertyManagement/Reclamations/Form';
import BonsDeCommande from '@/pages/PropertyManagement/BonsDeCommande/BonsDeCommande';
import FormBonDeCommande from '@/pages/PropertyManagement/BonsDeCommande/Form';
import PrestationsAchat from '@/pages/PropertyManagement/PrestationsAchat/PrestationsAchat';
import FormPrestationAchat from '@/pages/PropertyManagement/PrestationsAchat/Form';
import Taxes from '@/pages/PropertyManagement/Taxes/Taxes';
import FormTaxe from '@/pages/PropertyManagement/Taxes/Form';
import Syndics from '@/pages/PropertyManagement/Syndics/Syndics';
import FormSyndic from '@/pages/PropertyManagement/Syndics/Form';
import Reunions from '@/pages/PropertyManagement/Syndics/Reunions/Reunions';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import FormMembre from '@/pages/Configuration/Utilisateurs/Membres/Form';
import Membres from '@/pages/Configuration/Utilisateurs/Membres/Membres';
import Login from '@/pages/Login/Login';
import { NewPasswordPage } from '@/pages/Login/NewPasswordPage.tsx';
import { ResetPasswordConfirmation } from '@/pages/Login/ResetPasswordConfirmation.tsx';
import { ResetPasswordPage } from '@/pages/Login/ResetPasswordPage.tsx';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import LdapLogin from '@/pages/Login/LdapLogin';
import { motion } from 'framer-motion';
import { useAutoLogin } from './hooks/useAutoLogin';
import ConfigurationGlobale from './pages/ConfigurationGlobale/ConfigurationGlobale';
import UtilisateursConfig from './pages/ConfigurationGlobale/UtilisateursConfig';
import ReferenceDataConfig from './pages/ConfigurationGlobale/ReferenceDataConfig';
import LdapConfig from './pages/ConfigurationGlobale/LdapConfig';
import { useAppSelector } from './store/hooks';
import MonCompte from '@/pages/Profile/MonCompte';
import NotFound from '@/pages/NotFound/NotFound';
import { RootState } from './store';

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRoles: string[];
};

function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const userRole = useAppSelector((state: RootState) => state.auth.auth?.role);
  const isLdap = useAppSelector((state: RootState) => state.settings.isLdap);

  if (!isAuthenticated) {
    return isLdap ? (
      <>
        <Route path='/adminlogin' element={<Login />} />
        <Route path='/login' element={<LdapLogin />} />
      </>
    ) : (
      <Route path='/login' element={<Login />} />
    );
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole || '')) {
    return <Navigate to='/' />;
  }

  return <>{children}</>;
}

const App = () => {
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const isLdap = useAppSelector((state: RootState) => state.settings.isLdap);
  const isLoading = useAppSelector((state: RootState) => state.auth.loading);
  useAutoLogin();

  if (isLoading) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <motion.div
          initial={{ scale: 0.9, opacity: 0.8 }}
          animate={{
            scale: [0.9, 1.1, 0.9],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <AppLogo className='w-32 h-32' />
        </motion.div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Not logged in → show auth routes only */}
      {!isAuthenticated ? (
        <Routes>
          {isLdap ? (
            <>
              <Route path='/adminlogin' element={<Login />} />
              <Route path='/login' element={<LdapLogin />} />
            </>
          ) : (
            <>
              <Route path='/adminlogin' element={<Login />} />
              <Route path='/login' element={<Login />} />
            </>
          )}
          <Route path='/reset-password' element={<ResetPasswordPage />} />
          <Route path='/reset-password-confirmation' element={<ResetPasswordConfirmation />} />
          <Route path='/new-password' element={<NewPasswordPage />} />
          <Route path='*' element={<Navigate to={isLdap ? '/login' : '/adminlogin'} replace />} />
        </Routes>
      ) : (
        // Contractor → desktop UI
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <Navbar />
            {/* min-w-0 : sans ça, un tableau large (ex: Sinistres) force ce conteneur flex à
                s'élargir au lieu d'être contenu - le scroll horizontal remonte alors sur toute
                la page au lieu de rester dans la liste, comme dans RMANew. */}
            <div className='flex flex-1 flex-col gap-4 p-4 bg-sidebar min-w-0'>
              <Routes>
                {/* Already authenticated: bounce away from public auth pages instead of 404 */}
                <Route path='/login' element={<Navigate to='/' replace />} />
                <Route path='/adminlogin' element={<Navigate to='/' replace />} />
                <Route path='/reset-password' element={<Navigate to='/' replace />} />
                <Route
                  path='/reset-password-confirmation'
                  element={<Navigate to='/' replace />}
                />
                <Route path='/new-password' element={<Navigate to='/' replace />} />
                <Route path='/' element={<Dashboard />} />
                {/* Mon compte */}
                <Route
                  path='/mon-compte'
                  element={
                    <ProtectedRoute requiredRoles={['Contractor']}>
                      <MonCompte />
                    </ProtectedRoute>
                  }
                />
                <Route path='/configuration-globale' element={<ConfigurationGlobale />} />

                {/* Utilisateurs landing → Membres */}
                <Route path='/configuration-globale/utilisateurs' element={<UtilisateursConfig />} />

                <Route path='/configuration-globale/utilisateurs/membres' element={<Membres />} />
                <Route path='/configuration-globale/utilisateurs/membres/ajouter' element={<FormMembre />} />
                <Route path='/configuration-globale/utilisateurs/membres/modifier/:id' element={<FormMembre />} />
                <Route path='/configuration-globale/utilisateurs/membres/details/:id' element={<FormMembre details />} />

                {/* Données de référence — hub + modules génériques */}
                <Route path='/configuration-globale/reference' element={<ReferenceDataConfig />} />
                <Route path='/configuration-globale/reference/:module' element={<GenericLookupList />} />
                <Route path='/configuration-globale/reference/:module/ajouter' element={<GenericLookupForm />} />
                <Route path='/configuration-globale/reference/:module/modifier/:id' element={<GenericLookupForm />} />
                <Route path='/configuration-globale/reference/:module/details/:id' element={<GenericLookupForm details />} />

                {/* Données de référence — modules dédiés (relations / champs spécifiques) */}
                <Route path='/configuration-globale/reference-dediee/filiales' element={<Filiales />} />
                <Route path='/configuration-globale/reference-dediee/filiales/ajouter' element={<FormFiliale />} />
                <Route path='/configuration-globale/reference-dediee/filiales/modifier/:id' element={<FormFiliale />} />
                <Route path='/configuration-globale/reference-dediee/filiales/details/:id' element={<FormFiliale details />} />

                <Route path='/configuration-globale/reference-dediee/typologies-charge' element={<TypologiesCharge />} />
                <Route path='/configuration-globale/reference-dediee/typologies-charge/ajouter' element={<FormTypologieCharge />} />
                <Route path='/configuration-globale/reference-dediee/typologies-charge/modifier/:id' element={<FormTypologieCharge />} />
                <Route path='/configuration-globale/reference-dediee/typologies-charge/details/:id' element={<FormTypologieCharge details />} />

                <Route path='/configuration-globale/reference-dediee/typologies-immobilisation' element={<TypologiesImmobilisation />} />
                <Route path='/configuration-globale/reference-dediee/typologies-immobilisation/ajouter' element={<FormTypologieImmobilisation />} />
                <Route path='/configuration-globale/reference-dediee/typologies-immobilisation/modifier/:id' element={<FormTypologieImmobilisation />} />
                <Route path='/configuration-globale/reference-dediee/typologies-immobilisation/details/:id' element={<FormTypologieImmobilisation details />} />

                <Route path='/configuration-globale/ldap' element={<LdapConfig />} />

                <Route path='/geolocation' element={<Geolocation />} />
                <Route path='/commercialisation' element={<Commercialisation />} />
                <Route path='/leasing-management' element={<LeasingManagement />} />
                <Route path='/leasing-management/contractualisation' element={<Contractualisation />} />

                <Route path='/leasing-management/locataires' element={<Locataires />} />
                <Route path='/leasing-management/locataires/ajouter' element={<FormLocataire />} />
                <Route path='/leasing-management/locataires/modifier/:id' element={<FormLocataire />} />
                <Route path='/leasing-management/locataires/details/:id' element={<FormLocataire details />} />

                <Route path='/leasing-management/baux' element={<Baux />} />
                <Route path='/leasing-management/baux/ajouter' element={<FormBail />} />
                <Route path='/leasing-management/baux/modifier/:id' element={<FormBail />} />
                <Route path='/leasing-management/baux/details/:id' element={<FormBail details />} />

                <Route path='/leasing-management/resiliations' element={<Resiliations />} />
                <Route path='/leasing-management/resiliations/ajouter' element={<FormResiliation />} />
                <Route path='/leasing-management/resiliations/modifier/:id' element={<FormResiliation />} />
                <Route
                  path='/leasing-management/resiliations/details/:id'
                  element={<FormResiliation details />}
                />

                <Route path='/leasing-management/revisions-loyers' element={<RevisionsLoyers />} />
                <Route path='/leasing-management/revisions-loyers/ajouter' element={<FormRevisionLoyer />} />

                <Route path='/leasing-management/facturation' element={<Facturation />} />

                <Route path='/leasing-management/avoirs' element={<Avoirs />} />
                <Route path='/leasing-management/avoirs/ajouter' element={<FormAvoir />} />

                <Route path='/leasing-management/recouvrement' element={<Recouvrement />} />
                <Route
                  path='/leasing-management/recouvrement/suivi-recouvrement'
                  element={<SuiviRecouvrement />}
                />
                <Route
                  path='/leasing-management/recouvrement/suivi-recouvrement/ajouter'
                  element={<FormRelance />}
                />
                <Route
                  path='/leasing-management/recouvrement/paiement-client'
                  element={<PaiementClient />}
                />
                <Route
                  path='/leasing-management/recouvrement/paiement-client/ajouter'
                  element={<FormPaiement />}
                />
                <Route
                  path='/leasing-management/recouvrement/encaissement'
                  element={<Encaissement />}
                />
                <Route
                  path='/leasing-management/recouvrement/annulation-encaissement'
                  element={<AnnulationEncaissement />}
                />
                <Route
                  path='/leasing-management/recouvrement/encaissements-annules'
                  element={<EncaissementsAnnules />}
                />
                <Route
                  path='/leasing-management/recouvrement/suivi-contentieux'
                  element={<SuiviContentieux />}
                />
                <Route
                  path='/leasing-management/recouvrement/suivi-contentieux/ajouter'
                  element={<FormSuiviContentieux />}
                />
                <Route
                  path='/leasing-management/recouvrement/suivi-contentieux/modifier/:id'
                  element={<FormSuiviContentieux />}
                />
                <Route
                  path='/leasing-management/recouvrement/suivi-contentieux/details/:id'
                  element={<FormSuiviContentieux details />}
                />
                <Route
                  path='/leasing-management/recouvrement/suivi-contentieux/:id/avocats'
                  element={<Avocats />}
                />
                <Route
                  path='/leasing-management/recouvrement/suivi-contentieux/:id/avocats/ajouter'
                  element={<FormAvocat />}
                />
                <Route
                  path='/leasing-management/recouvrement/suivi-contentieux/:id/avocats/modifier/:avocatId'
                  element={<FormAvocat />}
                />
                <Route path='/leasing-management/recouvrement/suivi-remises' element={<SuiviRemises />} />
                <Route path='/leasing-management/facturation/factures' element={<Factures />} />
                <Route path='/leasing-management/facturation/factures/ajouter' element={<FormFacture />} />

                <Route path='/leasing-management/facturation/journal' element={<JournalComptable />} />
                <Route
                  path='/leasing-management/facturation/facturation-manuelle'
                  element={<FacturationManuelle />}
                />
                <Route
                  path='/leasing-management/facturation/annulation-facture'
                  element={<AnnulationFacture />}
                />

                <Route path='/leasing-management/suspensions' element={<Suspensions />} />
                <Route path='/leasing-management/suspensions/ajouter' element={<FormSuspension />} />
                <Route path='/leasing-management/suspensions/modifier/:id' element={<FormSuspension />} />
                <Route
                  path='/leasing-management/suspensions/details/:id'
                  element={<FormSuspension details />}
                />

                <Route path='/leasing-management/attestations' element={<Attestations />} />
                <Route path='/leasing-management/attestations/ajouter' element={<FormAttestation />} />
                <Route path='/leasing-management/attestations/modifier/:id' element={<FormAttestation />} />
                <Route
                  path='/leasing-management/attestations/details/:id'
                  element={<FormAttestation details />}
                />
                <Route path='/commercialisation/locaux-vacant' element={<LocauxVacants />} />
                <Route path='/commercialisation/cession' element={<Cession />} />

                <Route path='/commercialisation/prospection' element={<Prospections />} />
                <Route path='/commercialisation/prospection/ajouter' element={<FormProspection />} />
                <Route path='/commercialisation/prospection/modifier/:id' element={<FormProspection />} />
                <Route
                  path='/commercialisation/prospection/details/:id'
                  element={<FormProspection details />}
                />

                <Route path='/commercialisation/prospection/bien/ajouter' element={<BienForm />} />
                <Route path='/commercialisation/prospection/bien/modifier/:id' element={<BienForm />} />
                <Route
                  path='/commercialisation/prospection/bien/details/:id'
                  element={<BienForm details />}
                />

                {/* Archives */}
                <Route path='/archives' element={<Archives />} />
                <Route path='/archives/actifs' element={<ArchivesActifs />} />
                <Route path='/archives/locaux' element={<ArchivesLocaux />} />
                <Route path='/archives/locataires' element={<ArchivesLocataires />} />
                <Route path='/archives/locations' element={<ArchivesLocations />} />
                <Route path='/archives/ventes' element={<ArchivesVentes />} />
                <Route path='/archives/annulations-quittances' element={<ArchivesAnnulationsQuittances />} />
                <Route path='/archives/contentieux-hors-location' element={<ArchivesContentieuxHorsLocation />} />
                <Route path='/archives/contentieux-hors-location/ajouter' element={<FormContentieuxHorsLocation />} />
                <Route
                  path='/archives/contentieux-hors-location/modifier/:id'
                  element={<FormContentieuxHorsLocation />}
                />

                {/* Reporting */}
                <Route path='/reporting' element={<Reporting />} />
                <Route path='/reporting/etat-des-loyers' element={<EtatDesLoyers />} />
                <Route path='/reporting/etat-des-loyers/historique' element={<HistoriqueEtatDesLoyers />} />
                <Route path='/reporting/impayes-par-age' element={<ImpayesParAge />} />
                <Route path='/reporting/etat-par-immeuble' element={<EtatParImmeuble />} />
                <Route path='/reporting/patrimoine-opci' element={<PatrimoineOpci />} />
                <Route path='/reporting/etats-reglementaires' element={<EtatsReglementaires />} />
                <Route path='/reporting/etat-impaye' element={<EtatImpaye />} />
                <Route path='/reporting/suivi-impaye' element={<SuiviImpaye />} />
                <Route path='/reporting/apercu-emissions-encaissement' element={<ApercuEmissionsEncaissement />} />
                <Route path='/reporting/suivi-encaissement' element={<SuiviEncaissement />} />
                <Route path='/reporting/rapport-encaisseur' element={<RapportEncaisseur />} />
                <Route path='/reporting/cpc-immobilier' element={<CpcImmobilier />} />
                <Route path='/reporting/cpc-immobilier/ajouter' element={<FormCpcImmobilier />} />
                <Route path='/reporting/cpc-immobilier/modifier/:id' element={<FormCpcImmobilier />} />
                <Route path='/reporting/cpc-immobilier/voir/:id' element={<DetailCpcImmobilier />} />
                <Route path='/reporting/journal-comptable' element={<ReportingJournalComptable />} />
                <Route path='/reporting/revision-loyer' element={<ReportingRevisionLoyer />} />
                <Route path='/reporting/locaux-vacants' element={<ReportingLocauxVacants />} />
                <Route path='/reporting/nouveaux-baux' element={<NouveauxBaux />} />
                <Route path='/reporting/taxe-habitation' element={<TaxeHabitation />} />

                {/* Patrimoine — Immeubles */}
                <Route path='/patrimoine/asset-management' element={<AssetManagement />} />

                <Route path='/patrimoine/actifs' element={<Buildings />} />
                <Route path='/patrimoine/actifs/ajouter' element={<FormBuilding />} />
                <Route path='/patrimoine/actifs/modifier/:id' element={<FormBuilding />} />
                <Route path='/patrimoine/actifs/details/:id' element={<FormBuilding details />} />
                <Route path='/patrimoine/actifs/apercu/:id' element={<ApercuBuilding />} />

                <Route path='/patrimoine/locaux' element={<Locaux />} />
                <Route path='/patrimoine/locaux/ajouter' element={<FormLocal />} />
                <Route path='/patrimoine/locaux/modifier/:id' element={<FormLocal />} />
                <Route path='/patrimoine/locaux/details/:id' element={<FormLocal details />} />

                <Route path='/patrimoine/expertises' element={<Expertises />} />
                <Route path='/patrimoine/expertises/ajouter' element={<FormExpertise />} />
                <Route path='/patrimoine/expertises/modifier/:id' element={<FormExpertise />} />

                <Route path='/patrimoine/amortissements' element={<Amortissements />} />
                <Route path='/patrimoine/amortissements/ajouter' element={<FormAmortissement />} />
                <Route path='/patrimoine/amortissements/modifier/:id' element={<FormAmortissement />} />

                <Route path='/patrimoine/vnc' element={<Vnc />} />
                <Route path='/patrimoine/vnc/ajouter' element={<FormVnc />} />
                <Route path='/patrimoine/vnc/modifier/:id' element={<FormVnc />} />

                <Route path='/patrimoine/provisions' element={<Provisions />} />
                <Route path='/patrimoine/provisions/ajouter' element={<FormProvision />} />
                <Route path='/patrimoine/provisions/modifier/:id' element={<FormProvision />} />

                {/* Property Management */}
                <Route path='/property-management' element={<PropertyManagement />} />

                <Route path='/property-management/prestataires' element={<Prestataires />} />
                <Route path='/property-management/prestataires/ajouter' element={<FormPrestataire />} />
                <Route path='/property-management/prestataires/modifier/:id' element={<FormPrestataire />} />
                <Route path='/property-management/prestataires/details/:id' element={<FormPrestataire details />} />

                <Route path='/property-management/prestataires/contrats' element={<Contrats />} />
                <Route path='/property-management/prestataires/contrats/ajouter' element={<FormContrat />} />
                <Route path='/property-management/prestataires/contrats/modifier/:id' element={<FormContrat />} />
                <Route
                  path='/property-management/prestataires/contrats/details/:id'
                  element={<FormContrat details />}
                />

                <Route path='/property-management/assurances' element={<Assurances />} />
                <Route path='/property-management/assurances/ajouter' element={<FormAssurance />} />
                <Route path='/property-management/assurances/modifier/:id' element={<FormAssurance />} />
                <Route path='/property-management/assurances/details/:id' element={<FormAssurance details />} />

                <Route path='/property-management/charges' element={<Charges />} />
                <Route path='/property-management/charges/ajouter' element={<FormCharge />} />
                <Route path='/property-management/charges/modifier/:id' element={<FormCharge />} />
                <Route path='/property-management/charges/details/:id' element={<FormCharge details />} />

                <Route path='/property-management/membres-syndic' element={<MembresSyndic />} />
                <Route path='/property-management/membres-syndic/ajouter' element={<FormMembreSyndic />} />
                <Route path='/property-management/membres-syndic/modifier/:id' element={<FormMembreSyndic />} />
                <Route
                  path='/property-management/membres-syndic/details/:id'
                  element={<FormMembreSyndic details />}
                />

                <Route path='/property-management/sinistres' element={<Sinistres />} />
                <Route path='/property-management/sinistres/ajouter' element={<FormSinistre />} />
                <Route path='/property-management/sinistres/modifier/:id' element={<FormSinistre />} />
                <Route path='/property-management/sinistres/details/:id' element={<FormSinistre details />} />

                <Route path='/property-management/reclamations' element={<Reclamations />} />
                <Route path='/property-management/reclamations/ajouter' element={<FormReclamation />} />
                <Route path='/property-management/reclamations/modifier/:id' element={<FormReclamation />} />
                <Route path='/property-management/reclamations/details/:id' element={<FormReclamation details />} />

                <Route path='/property-management/bon-de-commande' element={<BonsDeCommande />} />
                <Route path='/property-management/bon-de-commande/ajouter' element={<FormBonDeCommande />} />
                <Route path='/property-management/bon-de-commande/modifier/:id' element={<FormBonDeCommande />} />
                <Route
                  path='/property-management/bon-de-commande/details/:id'
                  element={<FormBonDeCommande details />}
                />

                <Route path='/property-management/liste-prestations' element={<PrestationsAchat />} />
                <Route path='/property-management/liste-prestations/ajouter' element={<FormPrestationAchat />} />
                <Route
                  path='/property-management/liste-prestations/modifier/:id'
                  element={<FormPrestationAchat />}
                />
                <Route
                  path='/property-management/liste-prestations/details/:id'
                  element={<FormPrestationAchat details />}
                />

                <Route path='/property-management/taxes' element={<Taxes />} />
                <Route path='/property-management/taxes/ajouter' element={<FormTaxe />} />
                <Route path='/property-management/taxes/modifier/:id' element={<FormTaxe />} />
                <Route path='/property-management/taxes/details/:id' element={<FormTaxe details />} />

                <Route path='/property-management/syndics' element={<Syndics />} />
                <Route path='/property-management/syndics/:buildingId/reunions' element={<Reunions />} />
                <Route path='/property-management/syndics/:buildingId/reunions/ajouter' element={<FormSyndic />} />
                <Route
                  path='/property-management/syndics/:buildingId/reunions/modifier/:id'
                  element={<FormSyndic />}
                />
                <Route
                  path='/property-management/syndics/:buildingId/reunions/details/:id'
                  element={<FormSyndic details />}
                />

                <Route path='*' element={<NotFound />} />
              </Routes>
            </div>
            <AppFooter />
          </SidebarInset>
        </SidebarProvider>
      )}
    </BrowserRouter>
  );
};

export default App;
