import { type ReactNode } from 'react';
import { useAuth } from '@/lib/auth';
import { UserContext } from '@/contexts/userContextValue';

export function UserProvider({ children }: { children: ReactNode }) {
    const authValue = useAuth();

    return <UserContext value={authValue}>{children}</UserContext>;
}
