import { supabase } from '@/lib/supabase';

export interface PrizePool {
  total: number;
  match5: number;
  match4: number;
  match3: number;
  jackpotRollover: boolean;
}

export interface DrawResult {
  winningNumbers: number[];
  winners: {
    match5: number;
    match5Users: string[];
    match4: number;
    match4Users: string[];
    match3: number;
    match3Users: string[];
  };
  timestamp: string;
}

export const calculatePrizePool = (subscriberCount: number): PrizePool => {
  const subscriptionFee = 29; // Monthly average constraint
  const totalRevenue = subscriberCount * subscriptionFee;
  // Based on standard platform split, say 25% of subscription goes to prize pool.
  const prizePoolTotal = totalRevenue * 0.25; 

  // Distribution: 40% (Match 5), 35% (Match 4), 25% (Match 3)
  return {
    total: prizePoolTotal,
    match5: prizePoolTotal * 0.40,
    match4: prizePoolTotal * 0.35,
    match3: prizePoolTotal * 0.25,
    jackpotRollover: false 
  };
};

export const simulateDraw = async (mode: 'random' | 'algorithmic' = 'random'): Promise<DrawResult> => {
  // 1. Generate Winning Numbers
  let winningNumbers: number[] = [];
  
  if (mode === 'random') {
    while (winningNumbers.length < 5) {
      const num = Math.floor(Math.random() * 45) + 1;
      if (!winningNumbers.includes(num)) {
        winningNumbers.push(num);
      }
    }
  } else {
    // Algorithmic mode: just an example of weighting using typical golf scores
    const commonScores = [36, 38, 35, 34, 40, 32, 33];
    const pool = [...commonScores, ...Array.from({length: 45}, (_, i) => i + 1)];
    while (winningNumbers.length < 5) {
      const num = pool[Math.floor(Math.random() * pool.length)];
      if (!winningNumbers.includes(num)) {
        winningNumbers.push(num);
      }
    }
  }

  // 2. Find Winners from DB
  let match5Users: string[] = [];
  let match4Users: string[] = [];
  let match3Users: string[] = [];

  const { data: users } = await supabase.from('profiles').select('id, latest_scores').eq('status', 'Active');
  
  if (users) {
    users.forEach(user => {
      const userScores = user.latest_scores || [];
      const matchCount = userScores.filter((score: number) => winningNumbers.includes(score)).length;
      
      if (matchCount === 5) match5Users.push(user.id);
      if (matchCount === 4) match4Users.push(user.id);
      if (matchCount === 3) match3Users.push(user.id);
    });
  }

  return {
    winningNumbers,
    winners: {
      match5: match5Users.length,
      match5Users,
      match4: match4Users.length,
      match4Users,
      match3: match3Users.length,
      match3Users,
    },
    timestamp: new Date().toISOString()
  };
};

export const publishOfficialDraw = async (drawResult: DrawResult, subscriberCount: number) => {
  const pool = calculatePrizePool(subscriberCount);
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Create inserts for winners table
  const insertPayloads: Array<{ user_id: string; draw_month: string; prize_amount: string; match_count: number }> = [];

  // Match 5
  if (drawResult.winners.match5 > 0) {
    const splitPrize = pool.match5 / drawResult.winners.match5;
    drawResult.winners.match5Users.forEach(id => {
      insertPayloads.push({ user_id: id, draw_month: currentMonth, prize_amount: splitPrize.toFixed(2), match_count: 5 });
    });
  } else {
    // Handle Rollover Logic (in a real app, update a global settings/vars table)
    console.log("No 5-match winners. Jackpot rolls over.");
  }

  // Match 4
  if (drawResult.winners.match4 > 0) {
    const splitPrize = pool.match4 / drawResult.winners.match4;
    drawResult.winners.match4Users.forEach(id => {
      insertPayloads.push({ user_id: id, draw_month: currentMonth, prize_amount: splitPrize.toFixed(2), match_count: 4 });
    });
  }

  // Match 3
  if (drawResult.winners.match3 > 0) {
    const splitPrize = pool.match3 / drawResult.winners.match3;
    drawResult.winners.match3Users.forEach(id => {
       insertPayloads.push({ user_id: id, draw_month: currentMonth, prize_amount: splitPrize.toFixed(2), match_count: 3 });
    });
  }

  if (insertPayloads.length > 0) {
     const { error } = await supabase.from('winners').insert(insertPayloads);
     if (error) throw new Error("Failed to insert winners: " + error.message);
  }

  // Log activity
  await supabase.from('activity_logs').insert({
    action_type: 'DRAW_PUBLISHED',
    description: `Official draw for ${currentMonth} executed. ${insertPayloads.length} winners found.`
  });

  return { success: true, totalWinners: insertPayloads.length };
};

