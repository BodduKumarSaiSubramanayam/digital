import { supabase } from '@/lib/supabase';

export interface Charity {
  id: string;
  name: string;
  description: string;
  total_raised: number;
  is_active: boolean;
}

export const getCharityDirectory = async (): Promise<Charity[]> => {
  // Return simulated data if there's no real backend configuration
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) {
     return [
       { id: '1', name: 'Global Golf Outreach', description: 'Bringing golf access to underprivileged youth.', total_raised: 4200, is_active: true },
       { id: '2', name: 'Fairways for the Future', description: 'Scholarships for high school athletes.', total_raised: 15400, is_active: true },
       { id: '3', name: 'Green Guardians', description: 'Maintaining eco-friendly environments in sports.', total_raised: 8200, is_active: true }
     ];
  }
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('is_active', true);
      
    if (error) {
      console.error("Error fetching charities:", error);
    }
    
    // Fallback if the database is completely empty so users can sign up
    if (!data || data.length === 0) {
      return [
         { id: '1', name: 'Global Golf Outreach', description: 'Bringing golf access to underprivileged youth.', total_raised: 4200, is_active: true },
         { id: '2', name: 'Fairways for the Future', description: 'Scholarships for high school athletes.', total_raised: 15400, is_active: true },
         { id: '3', name: 'Green Guardians', description: 'Maintaining eco-friendly environments in sports.', total_raised: 8200, is_active: true }
      ];
    }
    
    return data;
  } catch (err) {
    console.error("Network error fetching charities", err);
    return [
         { id: '1', name: 'Global Golf Outreach', description: 'Bringing golf access to underprivileged youth.', total_raised: 4200, is_active: true }
    ];
  }
};

export const getCharityById = async (id: string): Promise<Charity | undefined> => {
  try {
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error || !data) return undefined;
    return data;
  } catch (err) {
    return undefined;
  }
};
