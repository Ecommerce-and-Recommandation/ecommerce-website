import { Link, Outlet } from '@tanstack/react-router';
import { ShoppingBag, BarChart3, Brain, Package, Users, LogOut, Ticket, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function AdminLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-card">
                <div className="flex items-center gap-2 border-b px-6 py-5">
                    <Brain className="h-6 w-6 text-primary" />
                    <span className="text-lg font-bold tracking-tight">ML Admin</span>
                </div>

                <nav className="flex flex-1 flex-col gap-1 p-3">
                    <NavLink to="/" icon={<ShoppingBag className="h-4 w-4" />}>
                        ← Back to Shop
                    </NavLink>
                    <div className="my-2 border-b" />
                    <NavLink to="/admin" icon={<BarChart3 className="h-4 w-4" />}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/admin/orders" icon={<Package className="h-4 w-4" />}>
                        Manage Orders
                    </NavLink>
                    <NavLink to="/admin/promotions" icon={<Ticket className="h-4 w-4" />}>
                        Promotions
                    </NavLink>
                    <div className="my-2 border-b" />
                    <p className="px-3 text-xs font-semibold uppercase text-muted-foreground mb-1">Testing Lab</p>
                    <NavLink to="/admin/model/prediction" icon={<Brain className="h-4 w-4" />}>
                        Purchase Prediction
                    </NavLink>
                    <NavLink to="/admin/model/recommendation" icon={<Sparkles className="h-4 w-4" />}>
                        Recommendations
                    </NavLink>
                    <NavLink to="/admin/model/segmentation" icon={<Users className="h-4 w-4" />}>
                        Segmentation
                    </NavLink>
                </nav>

                <div className="border-t px-4 py-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{user?.name}</span>
                        <button onClick={() => logout()} className="hover:text-red-400">
                            <LogOut className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-6xl p-6 lg:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function NavLink({ to, icon, children }: { to: string; icon: React.ReactNode; children: React.ReactNode }) {
    return (
        <Link
            to={to}
            activeOptions={{ exact: true }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
        >
            {icon}
            {children}
        </Link>
    );
}
