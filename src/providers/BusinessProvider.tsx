import { createContext, useContext, useState, ReactNode } from 'react';
import { useBusinesses } from '@/hooks/useBusinesses';
import { useAuth } from './AuthProvider';

interface Business {
  id: string;
  name: string;
  created_at: string;
}

interface BusinessContextType {
  businesses: Business[];
  currentBusiness: Business | null;
  setCurrentBusiness: (business: Business) => void;
  loading: boolean;
  error: Error | null;
}

const BusinessContext = createContext<BusinessContextType | undefined>(undefined);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  
  const { 
    data: businesses = [], 
    isLoading: loading, 
    error 
  } = useBusinesses();

  // Set the first business as current if available and no current business is selected
  if (businesses.length > 0 && !currentBusiness) {
    setCurrentBusiness(businesses[0]);
  }

  return (
    <BusinessContext.Provider 
      value={{ 
        businesses, 
        currentBusiness, 
        setCurrentBusiness,
        loading,
        error: error instanceof Error ? error : null
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export const useBusiness = () => {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error('useBusiness must be used within a BusinessProvider');
  }
  return context;
}; 