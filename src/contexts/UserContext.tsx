import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/lib/auth';

interface UserContextType {
    user: any;
    token: string | null;
    isLoggedIn: boolean;
    login: (email: string, password: string) => Promise<any>;
    logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return (
        <UserContext.Provider value={auth}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
