import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';
import path from 'node:path';

type SupabaseEnvKey = 'NEXT_PUBLIC_SUPABASE_URL' | 'SUPABASE_SERVICE_ROLE_KEY';

const REQUIRED_KEYS: SupabaseEnvKey[] = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

let cachedClient: SupabaseClient | null | undefined;

function isServerRuntime(): boolean {
  return typeof window === 'undefined';
}

function unquote(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const startsWithQuote = trimmed.startsWith('"') || trimmed.startsWith("'");
  const endsWithQuote = trimmed.endsWith('"') || trimmed.endsWith("'");
  if (startsWithQuote && endsWithQuote && trimmed.length >= 2) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function hydrateEnvFromLocalFile(): void {
  if (!isServerRuntime()) return;

  const missingKeys = REQUIRED_KEYS.filter((key) => !process.env[key]);
  if (missingKeys.length === 0) return;

  const envPath = path.join(process.cwd(), '.env.local');
  let raw: string;

  try {
    raw = readFileSync(envPath, 'utf-8');
  } catch {
    return;
  }

  const discovered = new Map<string, string>();
  for (const line of raw.split(/\r?\n/)) {
    if (!line || /^\s*#/.test(line)) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;
    const key = line.slice(0, separatorIndex).trim();
    if (!key || !REQUIRED_KEYS.includes(key as SupabaseEnvKey)) continue;
    const rawValue = line.slice(separatorIndex + 1);
    const value = unquote(rawValue);
    if (!discovered.has(key)) {
      discovered.set(key, value);
    }
  }

  for (const key of missingKeys) {
    if (process.env[key]) continue;
    const value = discovered.get(key);
    if (typeof value === 'string' && value.length > 0) {
      process.env[key] = value;
    }
  }
}

function sanitizeEnvValue(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function createSupabaseAdmin(): SupabaseClient | null {
  hydrateEnvFromLocalFile();

  const url = sanitizeEnvValue(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const serviceRoleKey = sanitizeEnvValue(process.env.SUPABASE_SERVICE_ROLE_KEY);

  if (!url || !serviceRoleKey) {
    return null;
  }

  return createClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  });
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isServerRuntime()) return null;

  if (typeof cachedClient === 'undefined' || cachedClient === null) {
    const client = createSupabaseAdmin();
    if (client) {
      cachedClient = client;
    } else if (typeof cachedClient === 'undefined') {
      cachedClient = null;
    }
  }

  return cachedClient ?? null;
}

export function hasSupabaseCredentials(): boolean {
  hydrateEnvFromLocalFile();
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}
