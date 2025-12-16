'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { Id } from '@/convex/_generated/dataModel';

interface UserContextType {
  userId: Id<'users'> | null;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
  initialUserId?: string;
}

export function UserProvider({
  children,
  initialUserId,
}: UserProviderProps) {
  const [userId, setUserId] = useState<Id<'users'> | null>(
    initialUserId ? (initialUserId as Id<'users'>) : null
  );
  const [isLoading, setIsLoading] = useState(!initialUserId);

  // Load userId from cookies on mount if not provided
  useEffect(() => {
    if (initialUserId) {
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
        if (userData.userId) {
          setUserId(userData.userId as Id<'users'>);
        }
      } catch (err) {
        console.error('Error parsing user data cookie:', err);
      }
    }
    setIsLoading(false);
  }, [initialUserId]);

  return (
    <UserContext.Provider
      value={{
        userId,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
