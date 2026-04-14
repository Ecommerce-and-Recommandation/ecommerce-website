import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { BarChart3, Brain, Package, Users } from 'lucide-react';
import { useHealth } from '@/lib/hooks';

function RootLayout() {
    const { data: health } = useHealth();

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r bg-card">
                <div className="flex items-center gap-2 border-b px-6 py-5">
                    <Brain className="h-6 w-6 text-chart-1" />
                    <span className="text-lg font-bold tracking-tight">E-commerce ML</span>
                </div>

                <nav className="flex flex-1 flex-col gap-1 p-3">
                    <NavLink to="/" icon={<BarChart3 className="h-4 w-4" />}>
                        Dashboard
                    </NavLink>
                    <NavLink to="/prediction" icon={<Brain className="h-4 w-4" />}>
                        Purchase Prediction
                    </NavLink>
                    <NavLink to="/recommendation" icon={<Package className="h-4 w-4" />}>
                        Recommendations
                    </NavLink>
                    <NavLink to="/segmentation" icon={<Users className="h-4 w-4" />}>
                        Segmentation
                    </NavLink>
                </nav>

                <div className="border-t px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className={`h-2 w-2 rounded-full ${health?.models_loaded ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {health?.models_loaded ? `API Online · ${health.models.length} models` : 'API Offline'}
                    </div>
                </div>
            </aside>

            {/* Main area */}
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
