
import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase';

export const useApprovedStatus = () => {
  const { user } = useAuth();
  const [isApproved, setIsApproved] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!user) {
        setIsApproved(false);
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_approved')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setIsApproved(profile?.is_approved || false);
      } catch (error) {
        console.error('Error checking approval status:', error);
        setIsApproved(false);
      } finally {
        setLoading(false);
      }
    };

    checkApprovalStatus();
  }, [user]);

  return { isApproved, loading };
};
