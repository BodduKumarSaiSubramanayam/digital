'use server'

import { supabase } from '@/lib/supabase'

import { sendWinnerAlertEmail } from '@/lib/services/email-service';

export async function approveWinnerAction(winnerId: string, userId: string, prizeAmount: string) {
  // 1. Update the winner's status to 'Paid'
  const { error: winnerError } = await supabase
    .from('winners')
    .update({ status: 'Paid', verified_at: new Date().toISOString() })
    .eq('id', winnerId)

  if (winnerError) return { success: false, error: winnerError.message }

  // 2. Log the transaction in the history if applicable
  
  // 3. Email Notification Stub
  // Note: we fetch the user's email if possible, or pass it in. For the stub, we will just use a placeholder
  await sendWinnerAlertEmail(userId + '@placeholder.email', prizeAmount);
  
  return { success: true }
}

export async function rejectWinnerAction(winnerId: string) {
  // 1. Update the winner's status to 'Rejected'
  const { error: winnerError } = await supabase
    .from('winners')
    .update({ status: 'Rejected' })
    .eq('id', winnerId)

  if (winnerError) return { success: false, error: winnerError.message }
  return { success: true }
}

export async function updateCharityAction(id: string, data: any) {
  const { error } = await supabase
    .from('charities')
    .update(data)
    .eq('id', id)

  if (error) return { success: false, error: error.message }
  return { success: true }
}

export async function manualScoreOverride(userId: string, scores: number[]) {
  const { error } = await supabase
    .from('profiles')
    .update({ latest_scores: scores })
    .eq('id', userId)

  if (error) return { success: false, error: error.message }
  return { success: true }
}
