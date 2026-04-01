'use server';

import { supabase } from '@/lib/supabase';
import { logActivityAction } from './audit-actions';

export interface Score {
  id: string;
  score: number;
  date: string;
}

// In-memory cache for placeholder mode simulation
let placeholderScoresCache: Record<string, Score[]> = {
  'demo-user-id': [
     { id: 's1', score: 40, date: new Date().toLocaleDateString() },
     { id: 's2', score: 38, date: new Date(Date.now() - 86400000).toLocaleDateString() }
  ]
};

export const getUserScores = async (userId: string, token?: string): Promise<Score[]> => {
  if (!userId) return [];
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
     return placeholderScoresCache[userId] || [];
  }

  try {
    const client = token ? await import('@supabase/supabase-js').then(mod => mod.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )) : supabase;

    const { data, error } = await client
      .from('profiles')
      .select('latest_scores')
      .eq('id', userId)
      .single();
      
    if (error || !data || !data.latest_scores) return [];
    
    // Now returns real persisted objects { score, date, id }
    // If legacy integers are present, gracefully map them
    return data.latest_scores.map((item: any, i: number) => {
        if (typeof item === 'number') {
           return { id: `score-${i}-${Date.now()}`, score: item, date: new Date().toLocaleDateString() };
        }
        return item as Score;
    });
  } catch (e) {
    console.error("Failed to fetch user scores:", e);
    return [];
  }
};

export const addScoreAction = async (userId: string, currentScores: Score[], newScoreVal: number, token?: string): Promise<{ success: boolean; scores?: Score[]; error?: string }> => {
  try {
    if (isNaN(newScoreVal) || newScoreVal < 1 || newScoreVal > 45) {
      return { success: false, error: "Score must be between 1 and 45 (Stableford)." };
    }

    const safeCurrentScores = Array.isArray(currentScores) ? currentScores : [];

    // PRD Rule: A new score replaces the oldest stored score automatically. Only the latest 5 scores are retained at any time.
    const newScore: Score = {
      id: Math.random().toString(36).substring(7),
      score: newScoreVal,
      date: new Date().toLocaleDateString()
    };

    const updatedScores = [newScore, ...safeCurrentScores];
    const final = updatedScores.slice(0, 5); // Rolling 5 logic
    
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
       placeholderScoresCache[userId] = final;
       return { success: true, scores: final };
    }

    // Update Supabase Database
    const client = token ? await import('@supabase/supabase-js').then(mod => mod.createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )) : supabase;

    const { error } = await client
      .from('profiles')
      .update({ latest_scores: final })
      .eq('id', userId);
      
    if (error) {
      console.error("Database Error:", error.message);
      return { success: false, error: "Database error. Could not save score." };
    }
    
    // Record Audit Log gracefully
    await logActivityAction(userId, 'SCORE_ENTRY', `User entered a new Stableford score: ${newScoreVal}`).catch(() => {});
    
    return { success: true, scores: final };
  } catch (e: any) {
    console.error("Fatal error in addScoreAction:", e);
    return { success: false, error: e.message || "An unexpected error occurred." };
  }
};
