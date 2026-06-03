import axios from 'axios';

const DEFAULT_HOST = 'localhost';
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1', '0.0.0.0']);

const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const isLocalHostName = (hostName = '') => {
  const normalized = hostName.toLowerCase();
  return LOCAL_HOSTS.has(normalized) || normalized.endsWith('.localhost');
};

const resolveBaseUrl = (envValue, fallbackPort) => {
  const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : DEFAULT_HOST;
  const fallbackUrl = `http://${runtimeHost}:${fallbackPort}`;
  const candidate = envValue || fallbackUrl;

  try {
    if (candidate.startsWith('/')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : `http://${DEFAULT_HOST}`;
      return trimTrailingSlash(`${origin}${candidate}`);
    }

    const url = new URL(candidate);

    // Allow QR pages opened from another device to reach the API host instead of phone localhost.
    if (typeof window !== 'undefined' && !isLocalHostName(runtimeHost) && isLocalHostName(url.hostname)) {
      url.hostname = runtimeHost;
    }

    return trimTrailingSlash(url.toString());
  } catch {
    return trimTrailingSlash(fallbackUrl);
  }
};

const API_BASE_URL = resolveBaseUrl(import.meta.env.VITE_API_BASE_URL, 5245);
const AI_BASE_URL = resolveBaseUrl(import.meta.env.VITE_AI_BASE_URL, 8001);

export const TOKEN_KEY = 'pulsex_token';
export const USER_KEY = 'pulsex_user';

const getSessionStorage = () => {
  try {
    if (typeof window === 'undefined') return null;
    return window.sessionStorage;
  } catch {
    return null;
  }
};

const getLocalStorage = () => {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage;
  } catch {
    return null;
  }
};

const readStorageValue = (storage, key) => {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
};

const writeStorageValue = (storage, key, value) => {
  try {
    storage?.setItem(key, value);
  } catch {
    // Ignore storage write errors and keep app responsive.
  }
};

const removeStorageValue = (storage, key) => {
  try {
    storage?.removeItem(key);
  } catch {
    // Ignore storage remove errors.
  }
};

const migrateLegacyValue = (key) => {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();

  const currentValue = readStorageValue(sessionStorage, key);
  if (currentValue != null) {
    return currentValue;
  }

  const legacyValue = readStorageValue(localStorage, key);
  if (legacyValue == null) {
    return null;
  }

  writeStorageValue(sessionStorage, key, legacyValue);
  removeStorageValue(localStorage, key);
  return legacyValue;
};

export const getToken = () => {
  return migrateLegacyValue(TOKEN_KEY);
};

export const setSession = (token, user) => {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();

  writeStorageValue(sessionStorage, TOKEN_KEY, token);
  writeStorageValue(sessionStorage, USER_KEY, JSON.stringify(user));

  // Keep only tab-scoped session and clear any old global session leftovers.
  removeStorageValue(localStorage, TOKEN_KEY);
  removeStorageValue(localStorage, USER_KEY);
};

export const clearSession = () => {
  const sessionStorage = getSessionStorage();
  const localStorage = getLocalStorage();

  removeStorageValue(sessionStorage, TOKEN_KEY);
  removeStorageValue(sessionStorage, USER_KEY);

  removeStorageValue(localStorage, TOKEN_KEY);
  removeStorageValue(localStorage, USER_KEY);
  // Profile photos are intentionally kept across logout/login cycles
  // so the avatar reappears immediately after the user signs back in.
};

export const getStoredUser = () => {
  try {
    const raw = migrateLegacyValue(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearSession();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

const aiApi = axios.create({
  baseURL: AI_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const resolveFileUrl = (path) => {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  const cleaned = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${cleaned}`;
};

export { api, aiApi, API_BASE_URL, AI_BASE_URL };
export default api;
