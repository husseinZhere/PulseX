const PROFILE_PHOTO_STORAGE_KEYS = {
    admin: 'pulsex-profile-photo-admin',
    doctor: 'pulsex-profile-photo-doctor',
    patient: 'pulsex-profile-photo-patient',
};

const PROFILE_PHOTO_UPDATED_EVENT = 'pulsex-profile-photo-updated';
const USER_SESSION_KEY = 'pulsex_user';

const getStorageKey = (role) => PROFILE_PHOTO_STORAGE_KEYS[role];
// Companion key that stamps which user the cached photo belongs to.
const getOwnerKey = (role) => {
    const key = getStorageKey(role);
    return key ? `${key}-owner` : null;
};

// The cached photo is keyed by role, but the SAME browser is shared across
// accounts (a new patient/doctor may log in). Stamp each cached photo with the
// owning user id and only return it when it matches the currently logged-in
// user — otherwise a new account would inherit the previous user's avatar.
const getCurrentUserId = () => {
    try {
        const raw =
            window.sessionStorage.getItem(USER_SESSION_KEY) ||
            window.localStorage.getItem(USER_SESSION_KEY);
        if (!raw) return null;
        const user = JSON.parse(raw);
        const id = user?.userId ?? user?.user_id ?? user?.id ?? null;
        return id != null ? String(id) : null;
    } catch {
        return null;
    }
};

export const readProfilePhoto = (role) => {
    if (typeof window === 'undefined') return '';

    const key = getStorageKey(role);
    const ownerKey = getOwnerKey(role);
    if (!key) return '';

    try {
        const photo = window.localStorage.getItem(key) || '';
        if (!photo) return '';

        const owner = window.localStorage.getItem(ownerKey);
        const currentUserId = getCurrentUserId();
        // Only trust the cache when it is explicitly stamped for the current
        // user. A different owner — or a legacy photo with no owner stamp —
        // is dropped so the API reloads the correct avatar for this account.
        if (currentUserId && owner !== currentUserId) {
            window.localStorage.removeItem(key);
            window.localStorage.removeItem(ownerKey);
            return '';
        }
        return photo;
    } catch {
        return '';
    }
};

export const writeProfilePhoto = (role, photoDataUrl) => {
    if (typeof window === 'undefined') return;

    const key = getStorageKey(role);
    const ownerKey = getOwnerKey(role);
    if (!key) return;

    try {
        if (photoDataUrl) {
            window.localStorage.setItem(key, photoDataUrl);
            const currentUserId = getCurrentUserId();
            if (currentUserId) window.localStorage.setItem(ownerKey, currentUserId);
            else window.localStorage.removeItem(ownerKey);
        } else {
            window.localStorage.removeItem(key);
            window.localStorage.removeItem(ownerKey);
        }
    } catch {
        // Ignore storage quota and private mode errors.
    }

    window.dispatchEvent(
        new CustomEvent(PROFILE_PHOTO_UPDATED_EVENT, {
            detail: { role, photo: photoDataUrl || '' },
        })
    );
};

export const subscribeProfilePhoto = (role, onChange) => {
    if (typeof window === 'undefined') return () => { };

    const key = getStorageKey(role);
    if (!key) return () => { };

    const onStorage = (event) => {
        if (event.key === key) {
            onChange(event.newValue || '');
        }
    };

    const onCustomEvent = (event) => {
        if (event?.detail?.role === role) {
            onChange(event.detail.photo || '');
        }
    };

    window.addEventListener('storage', onStorage);
    window.addEventListener(PROFILE_PHOTO_UPDATED_EVENT, onCustomEvent);

    return () => {
        window.removeEventListener('storage', onStorage);
        window.removeEventListener(PROFILE_PHOTO_UPDATED_EVENT, onCustomEvent);
    };
};
