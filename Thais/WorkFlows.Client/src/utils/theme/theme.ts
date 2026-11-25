import { useState } from 'react';

// Thèmes proposés à l'utilisateur (menu de son compte -> « Apparence »). Les couleurs de chaque thème sont dans
// src/index.css (blocs html[data-theme='...']) ; « thais » est le thème par défaut défini dans :root.
export type ThemeId = 'thais' | 'bleu' | 'sombre';

export const THEMES: { id: ThemeId; label: string; swatch: string }[] = [
  { id: 'thais', label: 'THAIS', swatch: '#a81254' },
  { id: 'bleu', label: 'Bleu classique', swatch: '#3657c3' },
  { id: 'sombre', label: 'Sombre', swatch: '#1b1b3a' },
];

const STORAGE_KEY = 'thais-theme';
export const DEFAULT_THEME: ThemeId = 'thais';

const isThemeId = (value: unknown): value is ThemeId => THEMES.some((t) => t.id === value);

export function readTheme(): ThemeId {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (isThemeId(stored)) return stored;
  } catch {
    // stockage indisponible (navigation privée...) : thème par défaut
  }
  return DEFAULT_THEME;
}

export function applyTheme(id: ThemeId) {
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(STORAGE_KEY, id);
  } catch {
    // le thème s'applique quand même pour cette session
  }
}

/** Thème courant + fonction pour en changer (appliqué tout de suite, mémorisé dans le navigateur). */
export function useTheme() {
  const [theme, setTheme] = useState<ThemeId>(readTheme);
  const choose = (id: ThemeId) => {
    applyTheme(id);
    setTheme(id);
  };
  return { theme, choose };
}
