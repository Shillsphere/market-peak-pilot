import { useQuery } from '@tanstack/react-query';
import { getUserBusinesses } from '@/lib/api/dashboard';

export function useBusinesses() {
  return useQuery({
    queryKey: ['businesses'],
    queryFn: getUserBusinesses,
  });
} 