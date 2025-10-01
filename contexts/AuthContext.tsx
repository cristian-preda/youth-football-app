import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types';
import { getUserById } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  isOnboarded: boolean;
  login: (userId: string) => void;
  logout: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isOnboarded, setIsOnboarded] = useState(false);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUserId = localStorage.getItem('currentUserId');
    const storedOnboarding = localStorage.getItem('isOnboarded');

    if (storedUserId) {
      const user = getUserById(storedUserId);
      if (user) {
        setCurrentUser(user);
      }
    }

    if (storedOnboarding === 'true') {
      setIsOnboarded(true);
    }
  }, []);

  const login = (userId: string) => {
    const user = getUserById(userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', userId);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsOnboarded(false);
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('isOnboarded');
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    localStorage.setItem('isOnboarded', 'true');
  };

  return (
    <AuthContext.Provider value={{ currentUser, isOnboarded, login, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
