// Copie THAIS : en développement, API locale (voir WorkFlows.Server/src/Design.Api, port HTTPS 7208) ;
// dans le site publié (npm run build), API du site de test thais.patrimoine.ma.
export const API_BASE_URL = import.meta.env.DEV
  ? `https://${window.location.hostname}:7208`
  : `https://thais.patrimoine.ma/api`;