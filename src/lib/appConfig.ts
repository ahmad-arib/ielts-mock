const DEFAULT_APP_BASE_URL = 'http://localhost:3000';

function normalizeUrl(raw: string | undefined, fallback: string) {
  if (!raw) return fallback;
  try {
    return new URL(raw).toString();
  } catch {
    return fallback;
  }
}

function trimTrailingSlash(url: string) {
  return url.endsWith('/') ? url.replace(/\/+$/, '') : url;
}

export function getAppBaseUrl() {
  const fallback = DEFAULT_APP_BASE_URL;
  const raw = process.env.APP_BASE_URL?.trim() || process.env.NEXT_PUBLIC_APP_BASE_URL?.trim();
  const normalized = normalizeUrl(raw, fallback);
  return trimTrailingSlash(normalized);
}

export function resolveTripayCallbackUrl() {
  const base = getAppBaseUrl();
  const fallback = `${base}/api/webhook/tripay`;
  const normalized = normalizeUrl(process.env.TRIPAY_CALLBACK_URL?.trim(), fallback);
  return trimTrailingSlash(normalized);
}

export function resolveTripayReturnUrl() {
  const base = getAppBaseUrl();
  const fallback = `${base}/login?paid=1`;
  const normalized = normalizeUrl(process.env.TRIPAY_RETURN_URL?.trim(), fallback);
  return trimTrailingSlash(normalized);
}

export function resolveTripayProductUrl() {
  const base = getAppBaseUrl();
  const fallback = `${base}/`;
  const raw = process.env.TRIPAY_PRODUCT_URL?.trim();
  const normalized = normalizeUrl(raw, fallback);
  try {
    const url = new URL(normalized);
    if (!url.pathname.endsWith('/')) {
      url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
    }
    return url.toString();
  } catch {
    return fallback;
  }
}
