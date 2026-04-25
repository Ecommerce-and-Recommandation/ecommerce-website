import { use } from 'react';
import { UserContext } from '@/contexts/userContextValue';
import type { UserContextType } from '@/contexts/userContextValue';

export function useUser(): UserContextType {
    const context = use(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
