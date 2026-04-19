import { Link, Outlet, createRootRoute, useNavigate, useRouterState } from '@tanstack/react-router';
import { ShoppingBag, ShoppingCart, Search, BarChart3, Brain, Package, Users, LogOut, Settings, Ticket, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/lib/hooks';
import { useState } from 'react';
import { tracker } from '@/lib/tracker';

function RootLayout() {
    const { isLoggedIn, user, logout } = useAuth();
    const routerState = useRouterState();
    const pathname = routerState.location.pathname;
    const isLoginPage = pathname === '/login';
    const isAdmin = pathname.startsWith('/admin');

    if (isLoginPage) return <Outlet />;
    if (!isLoggedIn) return <LoginRedirect />;

    // Protect Admin Routes
    if (isAdmin) {
        if (user && !user.is_admin) {
            return (
                <div className="p-10 flex flex-col items-center">
                    <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
                    <p>You do not have administrator permissions.</p>
                    <Link to="/" className="text-emerald-500 mt-4 underline">
                        Go home
                    </Link>
                </div>
            );
        }
        return <AdminLayout />;
    }

    return <ShopLayout />;
}

function LoginRedirect() {
    const navigate = useNavigate();
    navigate({ to: '/login' });
    return null;
}

// ── Shop Layout (Light Theme) ─────────────────────────

function ShopLayout() {
    const { user, logout } = useAuth();
    const { data: cart } = useCart();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    function handleSearch(e: React.FormEvent) {
        e.preventDefault();
        if (search.trim()) {
            tracker.trackSearch(search.trim());
            navigate({ to: '/', search: { search: search.trim() } });
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
                    <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600">
                            <ShoppingBag className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">ML Shop</span>
                    </Link>

                    <form onSubmit={handleSearch} className="flex flex-1 justify-center">
                        <div className="relative w-full max-w-lg">
                            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search products..."
                                className="w-full rounded-xl border bg-muted/50 py-2.5 pl-10 pr-4 text-sm placeholder-muted-foreground transition-colors focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                            />
                        </div>
                    </form>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/orders"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:border-emerald-500 hover:bg-emerald-500/10"
                            title="My Orders"
                        >
                            <Package className="h-5 w-5" />
                        </Link>

                        <Link
                            to="/cart"
                            className="relative flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:border-emerald-500 hover:bg-emerald-500/10"
                        >
                            <ShoppingCart className="h-5 w-5" />
                            {cart && cart.item_count > 0 && (
                                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                                    {cart.item_count}
                                </span>
                            )}
                        </Link>

                        <Link
                            to="/admin"
                            className="flex h-10 w-10 items-center justify-center rounded-xl border transition-colors hover:border-blue-500 hover:bg-blue-500/10"
                            title="Admin Panel"
                        >
                            <Settings className="h-5 w-5" />
                        </Link>

                        <div className="flex items-center gap-2 rounded-xl border px-3 py-2">
                            <span className="text-sm text-muted-foreground">{user?.name}</span>
                            <button onClick={logout} className="text-muted-foreground transition-colors hover:text-red-500" title="Logout">
                                <LogOut className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    );
}

// ── Admin Layout ──────────────────────────────────────

function AdminLayout() {
    const { user, logout } = useAuth();

    return (
        <div className="flex min-h-screen bg-background">
            <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-card">
                <div className="flex items-center gap-2 border-b px-6 py-5">
                    <Brain className="h-6 w-6 text-chart-1" />
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
                        <button onClick={logout} className="hover:text-red-400">
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
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground [&.active]:bg-accent [&.active]:text-foreground"
        >
            {icon}
            {children}
        </Link>
    );
}

export const Route = createRootRoute({
    component: RootLayout,
});
