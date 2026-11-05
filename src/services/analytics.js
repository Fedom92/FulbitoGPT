// Thin wrapper over Firebase Analytics. The SDK is loaded lazily and only in
// production builds, so development sessions never pollute the real metrics.
const enabled = import.meta.env.PROD && Boolean(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID);

let analyticsPromise = null;

function loadAnalytics() {
  if (!enabled) return Promise.resolve(null);
  analyticsPromise ??= Promise.all([import('firebase/analytics'), import('../firebase.js')])
    .then(async ([sdk, { app }]) => {
      if (!(await sdk.isSupported())) return null;
      return { sdk, analytics: sdk.getAnalytics(app) };
    })
    .catch(() => null);
  return analyticsPromise;
}

// Starts Analytics (which records the initial page_view).
export function initAnalytics() {
  loadAnalytics();
}

export function track(eventName, params) {
  loadAnalytics().then((ctx) => {
    if (ctx) ctx.sdk.logEvent(ctx.analytics, eventName, params);
  });
}
