const STORAGE_KEYS = {
  TOKEN: 'manga-hilaw-token',
  USER: 'manga-hilaw-user',
} as const;

const encode = (data: string): string => {
  try {
    return btoa(encodeURIComponent(data));
  } catch {
    return data;
  }
};

const decode = (data: string): string => {
  try {
    return decodeURIComponent(atob(data));
  } catch {
    return data;
  }
};

export const secureStorage = {
  setToken: (token: string): void => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.TOKEN, encode(token));
      } catch (error) {
        console.warn('Failed to store token:', error);
      }
    }
  },

  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      try {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        return token ? decode(token) : null;
      } catch (error) {
        console.warn('Failed to retrieve token:', error);
        return null;
      }
    }
    return null;
  },

  setUser: (user: any): void => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEYS.USER, encode(JSON.stringify(user)));
      } catch (error) {
        console.warn('Failed to store user data:', error);
      }
    }
  },

  getUser: (): any | null => {
    if (typeof window !== 'undefined') {
      try {
        const userData = localStorage.getItem(STORAGE_KEYS.USER);
        if (userData) {
          return JSON.parse(decode(userData));
        }
      } catch (error) {
        console.warn('Failed to retrieve user data:', error);
      }
    }
    return null;
  },

  clear: (): void => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      } catch (error) {
        console.warn('Failed to clear storage:', error);
      }
    }
  },

  isTokenExpired: (): boolean => {
    const token = secureStorage.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  },
};
