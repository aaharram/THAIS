// RMANew (WebForm2.vb, Carte.aspx) : injecte le script Google Maps JS avec un callback
// global, comme RMANew le fait pour sa propre carte - repris ici en promesse mise en
// cache pour n'injecter le script qu'une seule fois, même si plusieurs composants
// demandent la carte.
let loadPromise: Promise<void> | null = null;

export function loadGoogleMaps(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window indisponible.'));
  }

  if (typeof google !== 'undefined' && google.maps) {
    return Promise.resolve();
  }

  if (loadPromise) {
    return loadPromise;
  }

  // Google refuse (erreur "This page can't load Google Maps correctly") de charger son
  // script deux fois sur la même page - un remontage du composant carte pendant que le
  // module `loadPromise` ci-dessus a été réinitialisé (ex: rechargement à chaud Vite en
  // dev) pourrait sinon réinjecter une deuxième balise <script>. On vérifie donc aussi le
  // DOM directement, pas seulement la promesse en mémoire.
  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[src*="maps.googleapis.com/maps/api/js"]',
  );
  if (existingScript) {
    loadPromise = new Promise<void>((resolve, reject) => {
      const start = Date.now();
      const poll = () => {
        if (typeof google !== 'undefined' && google.maps) {
          resolve();
        } else if (Date.now() - start > 15000) {
          reject(new Error('Impossible de charger Google Maps.'));
        } else {
          setTimeout(poll, 100);
        }
      };
      poll();
    });
    return loadPromise;
  }

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;
  if (!apiKey) {
    return Promise.reject(new Error('VITE_GOOGLE_MAPS_API_KEY manquante.'));
  }

  loadPromise = new Promise<void>((resolve, reject) => {
    const callbackName = '__smartBuildingInitGoogleMaps';
    (window as unknown as Record<string, () => void>)[callbackName] = () => resolve();

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&region=MA&callback=${callbackName}`;
    script.async = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error('Impossible de charger Google Maps.'));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
