import { configureStore } from '@reduxjs/toolkit';
import authSliceReducer from './features/authentification/authSlice';
import { lookupModules } from './features/configuration/lookupModules';
import filialesSliceReducer from './features/configuration/filialesSlice';
import typologiesChargeSliceReducer from './features/configuration/typologiesChargeSlice';
import dashboardSliceReducer from './features/dashboard/dashboardSlice';
import buildingsSliceReducer from './features/patrimoine/buildingsSlice';
import buildingMapMarkersSliceReducer from './features/patrimoine/buildingMapMarkersSlice';
import locauxSliceReducer from './features/patrimoine/locauxSlice';
import expertisesSliceReducer from './features/patrimoine/expertisesSlice';
import amortissementsSliceReducer from './features/patrimoine/amortissementsSlice';
import locauxVacantsSliceReducer from './features/patrimoine/locauxVacantsSlice';
import taxeHabitationSliceReducer from './features/patrimoine/taxeHabitationSlice';
import vncSliceReducer from './features/patrimoine/vncSlice';
import provisionsSliceReducer from './features/patrimoine/provisionsSlice';
import locatairesSliceReducer from './features/leasing/locatairesSlice';
import bauxSliceReducer from './features/leasing/bauxSlice';
import nouveauxBauxSliceReducer from './features/leasing/nouveauxBauxSlice';
import resiliationsSliceReducer from './features/leasing/resiliationsSlice';
import suspensionsSliceReducer from './features/leasing/suspensionsSlice';
import attestationsSliceReducer from './features/leasing/attestationsSlice';
import revisionsLoyerSliceReducer from './features/leasing/revisionsLoyerSlice';
import facturesSliceReducer from './features/leasing/facturesSlice';
import avoirsSliceReducer from './features/leasing/avoirsSlice';
import relancesSliceReducer from './features/leasing/relancesSlice';
import paiementsSliceReducer from './features/leasing/paiementsSlice';
import suiviContentieuxSliceReducer from './features/leasing/suiviContentieuxSlice';
import contentieuxHorsLocationSliceReducer from './features/leasing/contentieuxHorsLocationSlice';
import etatLoyerSliceReducer from './features/leasing/etatLoyerSlice';
import suiviImpayeSliceReducer from './features/leasing/suiviImpayeSlice';
import etatReglementaireSliceReducer from './features/patrimoine/etatReglementaireSlice';
import rapportsRecouvrementSliceReducer from './features/leasing/rapportsRecouvrementSlice';
import cpcImmobilierSliceReducer from './features/patrimoine/cpcImmobilierSlice';
import journalComptableSliceReducer from './features/leasing/journalComptableSlice';
import avocatSliceReducer from './features/leasing/avocatSlice';
import remiseSliceReducer from './features/leasing/remiseSlice';
import prospectionsSliceReducer from './features/commercialisation/prospectionsSlice';
import agencesImmobilieresSliceReducer from './features/commercialisation/agencesImmobilieresSlice';
import prestatairesSliceReducer from './features/property-management/prestatairesSlice';
import prestataireContratsSliceReducer from './features/property-management/prestataireContratsSlice';
import assurancesPmSliceReducer from './features/property-management/assurancesSlice';
import chargesPmSliceReducer from './features/property-management/chargesSlice';
import syndicsPmSliceReducer from './features/property-management/syndicsSlice';
import sinistresPmSliceReducer from './features/property-management/sinistresSlice';
import reclamationsPmSliceReducer from './features/property-management/reclamationsSlice';
import bonsDeCommandePmSliceReducer from './features/property-management/bonsDeCommandeSlice';
import prestationsAchatPmSliceReducer from './features/property-management/prestationsAchatSlice';
import taxesPmSliceReducer from './features/property-management/taxesSlice';
import syndicReunionsSliceReducer from './features/property-management/syndicReunionsSlice';
import typologiesImmobilisationSliceReducer from './features/configuration/typologiesImmobilisationSlice';
import membersSliceReducer from './features/members/membersSlice';
import paysSliceReducer from './features/pays/paysSlice';
import profileSliceReducer from './features/profile/profileSlice';
import provincesSliceReducer from './features/provinces/provincesSlice';
import settingSliceReducer from './features/settings/SettingSlice';
import toastSliceReducer from './features/toast/toastSlice';
import villeSliceReducer from './features/villes/villesSlice';
import toastMiddleware from './middleware/toastMiddleware.tsx';

export const store = configureStore({
  reducer: {
    auth: authSliceReducer,
    toast: toastSliceReducer,
    villes: villeSliceReducer,
    members: membersSliceReducer,
    pays: paysSliceReducer,
    province: provincesSliceReducer,
    settings: settingSliceReducer,
    profile: profileSliceReducer,
    cfgVilles: lookupModules.cfgVilles.reducer,
    cfgTypologiesCharge: typologiesChargeSliceReducer,
    cfgTypologiesLot: lookupModules.cfgTypologiesLot.reducer,
    cfgTypologiesSinistre: lookupModules.cfgTypologiesSinistre.reducer,
    cfgBanques: lookupModules.cfgBanques.reducer,
    cfgFiliales: filialesSliceReducer,
    cfgServiceProfils: lookupModules.cfgServiceProfils.reducer,
    cfgCourtiers: lookupModules.cfgCourtiers.reducer,
    cfgAssureurs: lookupModules.cfgAssureurs.reducer,
    cfgEncaisseurs: lookupModules.cfgEncaisseurs.reducer,
    cfgSocietesImmobilieres: lookupModules.cfgSocietesImmobilieres.reducer,
    cfgBuildingTypes: lookupModules.cfgBuildingTypes.reducer,
    cfgProprietaires: lookupModules.cfgProprietaires.reducer,
    cfgPays: lookupModules.cfgPays.reducer,
    cfgPeriodicites: lookupModules.cfgPeriodicites.reducer,
    cfgTypesTaxe: lookupModules.cfgTypesTaxe.reducer,
    cfgTypologiesImmobilisation: typologiesImmobilisationSliceReducer,
    dashboard: dashboardSliceReducer,
    buildings: buildingsSliceReducer,
    buildingMapMarkers: buildingMapMarkersSliceReducer,
    locaux: locauxSliceReducer,
    expertises: expertisesSliceReducer,
    amortissements: amortissementsSliceReducer,
    locauxVacants: locauxVacantsSliceReducer,
    taxeHabitation: taxeHabitationSliceReducer,
    vnc: vncSliceReducer,
    provisions: provisionsSliceReducer,
    locataires: locatairesSliceReducer,
    baux: bauxSliceReducer,
    nouveauxBaux: nouveauxBauxSliceReducer,
    resiliations: resiliationsSliceReducer,
    suspensions: suspensionsSliceReducer,
    attestations: attestationsSliceReducer,
    revisionsLoyer: revisionsLoyerSliceReducer,
    factures: facturesSliceReducer,
    avoirs: avoirsSliceReducer,
    relances: relancesSliceReducer,
    paiements: paiementsSliceReducer,
    suiviContentieux: suiviContentieuxSliceReducer,
    contentieuxHorsLocation: contentieuxHorsLocationSliceReducer,
    etatLoyer: etatLoyerSliceReducer,
    suiviImpaye: suiviImpayeSliceReducer,
    etatReglementaire: etatReglementaireSliceReducer,
    rapportsRecouvrement: rapportsRecouvrementSliceReducer,
    cpcImmobilier: cpcImmobilierSliceReducer,
    journalComptable: journalComptableSliceReducer,
    avocat: avocatSliceReducer,
    remise: remiseSliceReducer,
    prospections: prospectionsSliceReducer,
    agencesImmobilieres: agencesImmobilieresSliceReducer,
    prestataires: prestatairesSliceReducer,
    prestataireContrats: prestataireContratsSliceReducer,
    assurancesPm: assurancesPmSliceReducer,
    chargesPm: chargesPmSliceReducer,
    syndicsPm: syndicsPmSliceReducer,
    sinistresPm: sinistresPmSliceReducer,
    reclamationsPm: reclamationsPmSliceReducer,
    bonsDeCommandePm: bonsDeCommandePmSliceReducer,
    prestationsAchatPm: prestationsAchatPmSliceReducer,
    taxesPm: taxesPmSliceReducer,
    syndicReunions: syndicReunionsSliceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(toastMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
