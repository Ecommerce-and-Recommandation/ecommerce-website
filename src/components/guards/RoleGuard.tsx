import { ReactNode } from 'react';
import { useUser } from '@/contexts/UserContext';

interface RoleGuardProps {
    children: ReactNode;
    fallback?: ReactNode;
    requireAdmin?: boolean;
}

export function RoleGuard({ children, fallback = null, requireAdmin = false }: RoleGuardProps) {
    const { user } = useUser();

    if (!user) return fallback;

    if (requireAdmin && !user.is_admin) {
        return fallback;
    }

    return <>{children}</>;
}
