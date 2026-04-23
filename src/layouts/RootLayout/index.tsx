import { Link, Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { ShopLayout } from '../ShopLayout';
import { AdminLayout } from '../AdminLayout';

export function RootLayout() {
    const { isLoggedIn, user } = useAuth();
    const routerState = useRouterState();
    const navigate = useNavigate();
    const pathname = routerState.location.pathname;
    const isLoginPage = pathname === '/login';
    const isAdminPath = pathname.startsWith('/admin');

    if (isLoginPage) return <Outlet />;

    if (!isLoggedIn) {
        void navigate({ to: '/login' });
        return null;
    }

    // RBAC: Prevent Admin from accessing shopper routes (Optional, based on user request)
    // If admin tries to access root/cart/orders, redirect to /admin
    if (user?.is_admin && !isAdminPath) {
        void navigate({ to: '/admin' });
        return null;
    }

    // Protect Admin Routes
    if (isAdminPath) {
        if (user && !user.is_admin) {
            return (
                <div className="p-10 flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                    <p>You do not have administrator permissions.</p>
                    <Button variant="link" asChild className="mt-4">
                        <Link to="/">Go home</Link>
                    </Button>
                </div>
            );
        }
        return <AdminLayout />;
    }

    return <ShopLayout />;
}
