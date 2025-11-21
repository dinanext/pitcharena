'use server';

import { createClient } from '@supabase/supabase-js';
import { InvestorPersona } from './types';

const ADMIN_COOKIE_NAME = 'admin_session';

/**
 * Parse a cookie header string into a map.
 */
function parseCookieHeader(cookieHeader: string | null): Record<string, string> {
  const map: Record<string, string> = {};
  if (!cookieHeader) return map;
  cookieHeader.split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const name = pair.slice(0, idx).trim();
    const value = pair.slice(idx + 1).trim();
    map[name] = decodeURIComponent(value);
  });
  return map;
}

/**
 * Attempt to read the admin cookie from a provided Request/NextRequest.
 * Supports:
 *  - NextRequest-like objects that provide cookies().get(name)
 *  - Standard Request objects where we parse headers.get('cookie')
 */
function getAdminCookieFromRequest(request?: Request): string | undefined {
  if (!request) return undefined;

  // Next.js NextRequest has a `cookies()` method that returns a CookieStore-like object.
  // Use duck-typing to avoid static import of next/headers at module top.
  const anyReq = request as any;

  try {
    if (typeof anyReq.cookies === 'function') {
      // NextRequest.cookies() may return an object with get(name)
      const cookieStore = anyReq.cookies();
      if (cookieStore && typeof cookieStore.get === 'function') {
        const c = cookieStore.get(ADMIN_COOKIE_NAME);
        return c?.value;
      }
    }
  } catch (e) {
    // Ignore and fallback to header parsing
  }

  // Fallback: try parsing Cookie header
  try {
    const headerCookie = request.headers.get?.('cookie') ?? null;
    const parsed = parseCookieHeader(headerCookie);
    return parsed[ADMIN_COOKIE_NAME];
  } catch (e) {
    return undefined;
  }
}

/**
 * Check whether current execution context has an admin session.
 *
 * - If you can pass the incoming Request/NextRequest, pass it as the `request` param.
 * - If `request` is not provided, the function will attempt a *dynamic* import of `next/headers`
 *   and call cookies() there (wrapped in try/catch). That dynamic import reduces the chance of
 *   causing the async-storage invariant at module-init time.
 * - If all reading methods fail, this returns `true` only in development to preserve local flow.
 */
export async function checkAdminSession(request?: Request): Promise<boolean> {
  // 1) Try reading from provided request (recommended for route handlers / edge handlers)
  const fromReq = getAdminCookieFromRequest(request);
  if (typeof fromReq !== 'undefined') {
    return fromReq === 'true';
  }

  // 2) Try a dynamic import of next/headers (only if available at runtime)
  try {
    // dynamic import reduces top-level evaluation issues
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const nh = await import('next/headers'); // may throw in some runtimes
    // nh.cookies is a function that returns a cookie store
    if (typeof nh.cookies === 'function') {
      const cookieStore = nh.cookies();
      const admin = cookieStore.get?.(ADMIN_COOKIE_NAME);
      if (admin) return admin.value === 'true';
    }
  } catch (err) {
    // If this fails (e.g. server actions in certain Next.js versions), fall through to fallback
    console.warn('Dynamic next/headers access failed in checkAdminSession:', err);
  }

  // 3) Final fallback: allow in development, deny in production
  const isDev = process.env.NODE_ENV !== 'production';
  if (isDev) {
    console.warn('checkAdminSession: falling back to development-allow (NODE_ENV != production).');
  }
  return isDev;
}

/* Supabase admin client helper */
function getAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase config (NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY)');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

/* CRUD operations (require admin session) */

export async function getAllInvestorPersonas(request?: Request): Promise<InvestorPersona[]> {
  const isAdmin = await checkAdminSession(request);
  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('investor_personas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Supabase getAll error:', error);
    throw new Error(error.message);
  }

  return (data ?? []) as InvestorPersona[];
}

export async function createInvestorPersona(
  persona: Omit<InvestorPersona, 'id' | 'created_at'>,
  request?: Request
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession(request);
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase.from('investor_personas').insert([persona]);

    if (error) {
      console.error('Supabase insert error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Database error in createInvestorPersona:', error);
    return { success: false, error: 'Failed to create investor persona' };
  }
}

export async function updateInvestorPersona(
  id: string,
  persona: Partial<InvestorPersona>,
  request?: Request
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession(request);
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from('investor_personas').update(persona).eq('id', id);

  if (error) {
    console.error('Supabase update error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteInvestorPersona(
  id: string,
  request?: Request
): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession(request);
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = getAdminSupabaseClient();
  const { error } = await supabase.from('investor_personas').delete().eq('id', id);

  if (error) {
    console.error('Supabase delete error:', error);
    return { success: false, error: error.message };
  }

  return { s
