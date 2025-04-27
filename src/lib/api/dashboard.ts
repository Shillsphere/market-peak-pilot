import { supabase } from "@/lib/supabase";

interface Business {
  id: string;
  name: string;
  created_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  business_id: string | null;
  role: 'admin' | 'user';
  is_approved: boolean;
}

/**
 * Get businesses associated with the current authenticated user
 */
export async function getUserBusinesses() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) throw new Error("User not authenticated");
  
  const { data, error } = await supabase
    .from('profiles')
    .select('business_id')
    .eq('id', user.id)
    .single();
    
  if (error) throw error;
  
  // If user has an associated business
  if (data.business_id) {
    const { data: business, error: businessError } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', data.business_id)
      .single();
      
    if (businessError) throw businessError;
    
    return [business];
  }
  
  return [];
}

/**
 * Get user profile information
 */
export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) throw error;
  
  return {
    id: data.id,
    email: data.email,
    business_id: data.business_id,
    role: data.role,
    is_approved: data.is_approved
  };
}

/**
 * Get business by ID
 */
export async function getBusinessById(id: string): Promise<Business | null> {
  const { data, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) throw error;
  
  return data;
} 