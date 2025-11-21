import { createClient } from '@supabase/supabase-js';
import { InvestorPersona, PitchSession, Message } from './types';

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

export async function createInvestorPersona(persona: Omit<InvestorPersona, 'id' | 'created_at'>): Promise<InvestorPersona | null> {
  const { data, error } = await supabase
    .from('investor_personas')
    .insert([persona])
    .select()
    .single();

  if (error) {
    console.error('Error creating investor persona:', error);
    return null;
  }

  return data as InvestorPersona;
}

export async function updateInvestorPersona(id: string, updates: Partial<InvestorPersona>): Promise<InvestorPersona | null> {
  const { data, error } = await supabase
    .from('investor_personas')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating investor persona:', error);
    return null;
  }

  return data as InvestorPersona;
}

export async function deleteInvestorPersona(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('investor_personas')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting investor persona:', error);
    return false;
  }

  return true;
}

export async function getPitchSessions(userId?: string): Promise<PitchSession[]> {
  let query = supabase
    .from('pitch_sessions')
    .select(`
      *,
      persona:investor_personas(*)
    `)
    .order('created_at', { ascending: false });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching pitch sessions:', error);
    return [];
  }

  return data as unknown as PitchSession[];
}

export async function getPitchSessionById(id: string): Promise<PitchSession | null> {
  const { data, error } = await supabase
    .from('pitch_sessions')
    .select(`
      *,
      persona:investor_personas(*)
    `)
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching pitch session:', error);
    return null;
  }

  return data as unknown as PitchSession | null;
}

export async function createPitchSession(
  userId: string,
  personaId: string
): Promise<PitchSession | null> {
  const { data, error } = await supabase
    .from('pitch_sessions')
    .insert([{
      user_id: userId,
      persona_id: personaId,
      chat_transcript: [],
      outcome: null,
      started_at: new Date().toISOString(),
    }])
    .select(`
      *,
      persona:investor_personas(*)
    `)
    .single();

  if (error) {
    console.error('Error creating pitch session:', error);
    return null;
  }

  return data as unknown as PitchSession;
}

export async function updatePitchSession(
  id: string,
  updates: {
    chat_transcript?: Message[];
    outcome?: 'win' | 'lose';
    ended_at?: string;
  }
): Promise<PitchSession | null> {
  const { data, error } = await supabase
    .from('pitch_sessions')
    .update(updates)
    .eq('id', id)
    .select(`
      *,
      persona:investor_personas(*)
    `)
    .single();

  if (error) {
    console.error('Error updating pitch session:', error);
    return null;
  }

  return data as unknown as PitchSession;
}

export async function deletePitchSession(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('pitch_sessions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting pitch session:', error);
    return false;
  }

  return true;
}

export async function getUserPitchStats(userId: string): Promise<{
  totalSessions: number;
  wins: number;
  losses: number;
  winRate: number;
}> {
  const { data, error } = await supabase
    .from('pitch_sessions')
    .select('outcome')
    .eq('user_id', userId)
    .not('outcome', 'is', null);

  if (error) {
    console.error('Error fetching pitch stats:', error);
    return { totalSessions: 0, wins: 0, losses: 0, winRate: 0 };
  }

  const wins = data.filter(s => s.outcome === 'win').length;
  const losses = data.filter(s => s.outcome === 'lose').length;
  const totalSessions = wins + losses;
  const winRate = totalSessions > 0 ? (wins / totalSessions) * 100 : 0;

  return { totalSessions, wins, losses, winRate };
}
