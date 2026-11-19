// Un DateTime? côté serveur (System.Text.Json) ne désérialise pas une chaîne vide ('') -
// seulement null ou une vraie date, sinon la requête échoue en 400 avant même d'atteindre
// le contrôleur. Les formulaires initialisent leurs champs date à '' (input non rempli).
export const nullifyEmptyDates = <T extends Record<string, unknown>>(payload: T, fields: (keyof T)[]): T => {
  const sanitized = { ...payload };
  for (const field of fields) {
    if (sanitized[field] === '') {
      (sanitized as Record<string, unknown>)[field as string] = null;
    }
  }
  return sanitized;
};
