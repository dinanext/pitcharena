import { createClient } from '@supabase/supabase-js';
import { InvestorPersona } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getInvestorPersonas(): Promise<InvestorPersona[]> {
  const { data, error } = await supabase
    .from('investor_personas')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching investor personas:', error);
    return [];
  }

  return data as InvestorPersona[];
}

export async function getInvestorPersonaById(id: string): Promise<InvestorPersona | null> {
  const { data, error } = await supabase
    .from('investor_personas')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching investor persona:', error);
    return null;
  }

  return data as InvestorPersona | null;
}
