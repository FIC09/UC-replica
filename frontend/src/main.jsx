import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ErrorBoundary } from './ErrorBoundary.jsx'

// Automatically route API requests directly to Render backend in production (Vercel)
if (typeof window !== 'undefined') {
  const isProdVercel = window.location.hostname.includes('vercel.app') || (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');
  const RENDER_BACKEND_URL = (import.meta.env.VITE_API_BASE_URL || 'https://uc-replica.onrender.com').replace(/\/api\/?$/, '').replace(/\/$/, '');

  if (isProdVercel) {
    const nativeFetch = window.fetch;
    window.fetch = function (resource, init) {
      if (typeof resource === 'string' && resource.startsWith('/api')) {
        resource = `${RENDER_BACKEND_URL}${resource}`;
      } else if (resource && typeof resource === 'object' && resource.url && typeof resource.url === 'string' && resource.url.startsWith('/api')) {
        resource = new Request(`${RENDER_BACKEND_URL}${resource.url}`, resource);
      }
      return nativeFetch.call(this, resource, init);
    };
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

