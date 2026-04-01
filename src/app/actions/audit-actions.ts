'use server';

import { supabase } from '@/lib/supabase';

export async function logActivityAction(userId: string | null, actionType: string, description: string) {
  // If no userId, it might be a public event (like a failed signup or general system event)
  
  const isPlaceholder = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder');
  
  if (isPlaceholder) {
    console.log(`[AUDIT SIMULATION] ${actionType}: ${description} (User: ${userId || 'SYSTEM'})`);
    return { success: true };
  }

  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action_type: actionType,
        description: description
      });

    if (error) throw error;
    return { success: true };
  } catch (e) {
    console.error("Audit log failed:", e);
    return { success: false };
  }
}
