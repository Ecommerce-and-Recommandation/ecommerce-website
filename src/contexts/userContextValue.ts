import { createContext } from 'react';
import type { AuthUser } from '@/types/authTypes';

export interface UserContextType {
    user: AuthUser | null;
    token: string | null;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<{ access_token: string; user: AuthUser }>;
    logout: () => Promise<void>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
