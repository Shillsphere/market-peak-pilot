import { useQuery } from '@tanstack/react-query';
import { getUserProfile } from '@/lib/api/dashboard';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getUserProfile,
  });
} 