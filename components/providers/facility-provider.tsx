'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { Id } from '@/convex/_generated/dataModel';

interface FacilityContextType {
  currentFacilityId: Id<'facilities'> | null;
  currentCompanyId: Id<'companies'> | null;
  setCurrentFacilityId: (facilityId: Id<'facilities'>) => void;
  isLoading: boolean;
}

const FacilityContext = createContext<FacilityContextType | null>(null);

interface FacilityProviderProps {
  children: ReactNode;
  initialFacilityId?: string;
  initialCompanyId?: string;
}

export function FacilityProvider({
  children,
  initialFacilityId,
  initialCompanyId,
}: FacilityProviderProps) {
  const [currentFacilityId, setCurrentFacilityIdState] =
    useState<Id<'facilities'> | null>(
      initialFacilityId ? (initialFacilityId as Id<'facilities'>) : null
    );
  const [currentCompanyId, setCurrentCompanyIdState] =
    useState<Id<'companies'> | null>(
      initialCompanyId ? (initialCompanyId as Id<'companies'>) : null
    );
  const [isLoading, setIsLoading] = useState(!initialFacilityId);

  // Load facility and company from cookies on mount if not provided
  useEffect(() => {
    if (initialFacilityId && initialCompanyId) {
      setIsLoading(false);
      return;
    }

    const userDataCookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith('user_data='));

    if (userDataCookie) {
      try {
        const userData = JSON.parse(
          decodeURIComponent(userDataCookie.split('=')[1])
        );
        if (userData.primaryFacilityId && !initialFacilityId) {
          setCurrentFacilityIdState(
            userData.primaryFacilityId as Id<'facilities'>
          );
        }
        if (userData.companyId && !initialCompanyId) {
          setCurrentCompanyIdState(userData.companyId as Id<'companies'>);
        }
      } catch (err) {
        console.error('Error parsing user data cookie:', err);
      }
    }
    setIsLoading(false);
  }, [initialFacilityId, initialCompanyId]);

  const setCurrentFacilityId = useCallback((facilityId: Id<'facilities'>) => {
    setCurrentFacilityIdState(facilityId);
    // Optionally persist to localStorage for page refreshes
    localStorage.setItem('currentFacilityId', facilityId);
  }, []);

  // Also check localStorage on mount for persisted selection
  useEffect(() => {
    if (!currentFacilityId) {
      const storedFacilityId = localStorage.getItem('currentFacilityId');
      if (storedFacilityId) {
        setCurrentFacilityIdState(storedFacilityId as Id<'facilities'>);
      }
    }
  }, [currentFacilityId]);

  return (
    <FacilityContext.Provider
      value={{
        currentFacilityId,
        currentCompanyId,
        setCurrentFacilityId,
        isLoading,
      }}
    >
      {children}
    </FacilityContext.Provider>
  );
}

export function useFacility() {
  const context = useContext(FacilityContext);
  if (!context) {
    throw new Error('useFacility must be used within a FacilityProvider');
  }
  return context;
}
