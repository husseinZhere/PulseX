const PROFILE_PHOTO_STORAGE_KEYS = {
    admin: 'pulsex-profile-photo-admin',
    doctor: 'pulsex-profile-photo-doctor',
    patient: 'pulsex-profile-photo-patient',
};

const PROFILE_PHOTO_UPDATED_EVENT = 'pulsex-profile-photo-updated';

const getStorageKey = (role) => PROFILE_PHOTO_STORAGE_KEYS[role];

export const readProfilePhoto = (role) => {
    if (typeof window === 'undefined') return '';

    const key = getStorageKey(role);
    if (!key) return '';

    try {
        return window.localStorage.getItem(key) || '';
    } catch {
        return '';
    }
};

export const writeProfilePhoto = (role, photoDataUrl) => {
    if (typeof window === 'undefined') return;

    const key = getStorageKey(role);
    if (!key) return;

    try {
        if (photoDataUrl) {
            window.localStorage.setItem(key, photoDataUrl);
        } else {
            window.localStorage.removeItem(key);
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
