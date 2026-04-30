import axios from 'axios';
import api, { API_BASE_URL, getToken } from '../utils/api';

const API_PATH_PREFIX = '/api/MedicalRecords';

const normalizeBase = (base) => (base || '').replace(/\/+$/, '');

const buildFallbackBaseUrls = () => {
  const urls = [normalizeBase(API_BASE_URL)];
  if (typeof window !== 'undefined') {
    const protocol = window.location.protocol || 'http:';
    const runtimeHostUrl = normalizeBase(`${protocol}//${window.location.hostname}:5245`);
    urls.push(runtimeHostUrl);

    // Desktop browsers sometimes fail to loop back to LAN IP; localhost fallback fixes that case.
    urls.push(normalizeBase(`${protocol}//localhost:5245`));
    urls.push(normalizeBase(`${protocol}//127.0.0.1:5245`));
  } else {
    urls.push('http://localhost:5245');
  }
  return Array.from(new Set(urls.filter(Boolean)));
};

const withNetworkFallbackGet = async (path, config = {}) => {
  try {
    const response = await api.get(path, config);
    return response.data;
  } catch (primaryError) {
    // Retry only for network failures (no HTTP response received).
    if (primaryError?.response) throw primaryError;

    const token = getToken();
    const headers = {
      ...(config.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let lastError = primaryError;
    for (const baseUrl of buildFallbackBaseUrls()) {
      try {
        const response = await axios.get(`${baseUrl}${path}`, {
          ...config,
          headers,
        });
        return response.data;
      } catch (retryError) {
        lastError = retryError;
        if (retryError?.response) throw retryError;
      }
    }

    throw lastError;
  }
};

export const uploadMedicalRecord = (recordType, file, notes = '') => {
  const form = new FormData();
  form.append('RecordType', recordType);
  form.append('File', file);
  if (notes) form.append('Notes', notes);
  return api
    .post(`${API_PATH_PREFIX}/upload`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const getMyRecords = () =>
  withNetworkFallbackGet(`${API_PATH_PREFIX}/my-records`);

export const getMyRecordsByType = (recordType) =>
  withNetworkFallbackGet(`${API_PATH_PREFIX}/my-records/${recordType}`);

export const deleteRecord = (recordId) =>
  api.delete(`${API_PATH_PREFIX}/${recordId}`).then((r) => r.data);

export const generateQRCode = () =>
  withNetworkFallbackGet(`${API_PATH_PREFIX}/generate-qr`);

export const downloadAllRecordsPdf = () =>
  withNetworkFallbackGet(`${API_PATH_PREFIX}/download-pdf`, { responseType: 'blob' });

export const getPublicPatientRecords = (patientId) =>
  withNetworkFallbackGet(`${API_PATH_PREFIX}/public/${patientId}`);

export const viewPatientRecords = (patientId) =>
  withNetworkFallbackGet(`${API_PATH_PREFIX}/view/${patientId}`);

export const downloadPatientRecordsPdf = (patientId) =>
  withNetworkFallbackGet(`${API_PATH_PREFIX}/view/${patientId}/download-pdf`, { responseType: 'blob' });
