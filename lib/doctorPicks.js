import { supabase } from './supabase';

export async function getDoctorPicks(limit = 3) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('doctor_picks')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
      .order('id', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching doctor_picks:', err);
    return [];
  }
}

export async function getAllDoctorPicks() {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('doctor_picks')
      .select('*')
      .order('display_order', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching all doctor_picks:', err);
    return [];
  }
}
