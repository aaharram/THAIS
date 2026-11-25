const REMEMBER_ME_KEY = 'rememberMe';

export function saveToken(key: string, value: string, persistent: boolean = true) {
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(key, value);

  // Handle "remember me" logic
  if (key === 'auth') {
    const storageType = persistent ? 'local' : 'session';
    localStorage.setItem(REMEMBER_ME_KEY, storageType);
  }
}

export function getToken(key: string): string | null {
  const rememberMe = localStorage.getItem(REMEMBER_ME_KEY);
  const storage = rememberMe === 'local' ? localStorage : sessionStorage;
  return storage.getItem(key);
}

export function deleteToken(key: string) {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);

  if (key === 'auth') {
    localStorage.removeItem(REMEMBER_ME_KEY);
  }
}

export function getRememberMePreference(): boolean {
  return localStorage.getItem(REMEMBER_ME_KEY) === 'local';
}
