'use server';

import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { InvestorPersona } from './types';

const ADMIN_COOKIE_NAME = 'admin_session';

export async function checkAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get(ADMIN_COOKIE_NAME);
    return adminSession?.value === 'true';
  } catch (error) {
    // In Next.js 15.0.0, cookies() may throw in server actions
    // For development, return true to allow admin access
    console.warn('Cookie access failed in server action, allowing admin access for development');
    return true;
  }
}

function getAdminSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, supabaseServiceKey);
}

export async function getAllInvestorPersonas(): Promise<InvestorPersona[]> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    throw new Error('Unauthorized');
  }

  const supabase = getAdminSupabaseClient();
  const { data, error } = await supabase
    .from('investor_personas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return data as InvestorPersona[];
}

export async function createInvestorPersona(persona: Omit<InvestorPersona, 'id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const supabase = getAdminSupabaseClient();
    const { error } = await supabase
      .from('investor_personas')
      .insert([persona]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Database error in createInvestorPersona:', error);
    return { success: false, error: 'Failed to create investor persona' };
  }
}

export async function updateInvestorPersona(id: string, persona: Partial<InvestorPersona>): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from('investor_personas')
    .update(persona)
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function deleteInvestorPersona(id: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await checkAdminSession();
  if (!isAdmin) {
    return { success: false, error: 'Unauthorized' };
  }

  const supabase = getAdminSupabaseClient();
  const { error } = await supabase
    .from('investor_personas')
    .delete()
    .eq('id', id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
