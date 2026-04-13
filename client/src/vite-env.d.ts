/// <reference types="vite/client" />

interface Window {
  /** Optional override for API origin when set before the app module loads (e.g. inline script in index.html). */
  __TIFIN_API_BASE__?: string;
}
