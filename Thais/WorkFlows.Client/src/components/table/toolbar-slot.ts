import { useSyncExternalStore } from 'react';

/**
 * Emplacement « actions » de la barre d'outils de la liste (à droite : filtre, Import, Export, +).
 * Le DataTable y dépose son élément ; le Title de la page y affiche ses actions et ses boutons, pour que
 * tout tienne dans une seule ligne sous le titre : recherche · lignes par page · … · + · Export.
 */
let slot: HTMLElement | null = null;
const listeners = new Set<() => void>();

export const registerToolbarSlot = (el: HTMLElement | null) => {
  // Une liste ouverte dans une fenêtre modale garde sa propre barre : elle ne prend pas la place de la page.
  if (el && el.closest('[role=dialog]')) return;
  if (slot === el) return;
  slot = el;
  listeners.forEach((l) => l());
};

export const unregisterToolbarSlot = (el: HTMLElement) => {
  if (slot === el) {
    slot = null;
    listeners.forEach((l) => l());
  }
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

export const useToolbarSlot = () =>
  useSyncExternalStore(
    subscribe,
    () => slot,
    () => null,
  );
