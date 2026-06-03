import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// After a new deployment, tabs opened on the old build reference chunk files
// whose hashed names no longer exist → "Failed to fetch dynamically imported
// module". Reload to pull the fresh index + chunk names. The timestamp guard
// prevents an infinite reload loop if the deployment is genuinely broken: we
// only auto-reload if we haven't already done so in the last 10 seconds.
const RELOAD_TS = 'pulsex_chunk_reload_ts';
const handleChunkError = () => {
  const last = Number(sessionStorage.getItem(RELOAD_TS) || 0);
  if (Date.now() - last < 10000) return; // already reloaded recently → give up
  sessionStorage.setItem(RELOAD_TS, String(Date.now()));
  window.location.reload();
};

window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault();
  handleChunkError();
});

window.addEventListener('error', (e) => {
  const msg = e?.message || '';
  if (/dynamically imported module|Importing a module script failed/i.test(msg)) {
    handleChunkError();
  }
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
