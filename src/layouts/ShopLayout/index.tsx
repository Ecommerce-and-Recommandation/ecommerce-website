import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { ShoppingBag, ShoppingCart, Search, Package, LogOut, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';
import { tracker } from '@/lib/tracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RoleGuard } from '@/components/guards/RoleGuard';

export function ShopLayout() {
    const { user, logout } = useAuth();
    const { data: cart } = useCart();
    const [search, setSearch] = useState('');
    const navigate = useNavigate();

    function handleSearch(e: React.SyntheticEvent) {
        e.preventDefault();
        if (search.trim()) {
            tracker.trackSearch(search.trim());
            void navigate({ to: '/', search: { search: search.trim() } });
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
                    <Link to="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                            <ShoppingBag className="h-5 w-5" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">ML Shop</span>
                    </Link>

                    {!user?.is_admin && (
                        <form onSubmit={handleSearch} className="flex flex-1 justify-center">
                            <div className="relative w-full max-w-lg">
                                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                    }}
                                    placeholder="Search products..."
                                    className="pl-10 h-10 border-none bg-muted/50 rounded-xl focus-visible:ring-1 focus-visible:ring-primary/20"
                                />
                            </div>
                        </form>
                    )}

                    <div className="flex items-center gap-2">
                        {!user?.is_admin && (
                            <>
                                <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10">
                                    <Link to="/orders" title="My Orders">
                                        <Package className="h-5 w-5" />
                                    </Link>
                                </Button>

                                <div className="relative">
                                    <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10">
                                        <Link to="/cart">
                                            <ShoppingCart className="h-5 w-5" />
                                        </Link>
                                    </Button>
                                    {cart && cart.item_count > 0 && (
                                        <Badge className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold">
                                            {cart.item_count}
                                        </Badge>
                                    )}
                                </div>
                            </>
                        )}

                        <RoleGuard requireAdmin={true}>
                            <Button variant="outline" size="icon" asChild className="rounded-xl h-10 w-10">
                                <Link to="/admin" title="Admin Panel">
                                    <Settings className="h-5 w-5" />
                                </Link>
                            </Button>
                        </RoleGuard>

                        <div className="flex items-center h-10 gap-2 rounded-xl border px-3">
                            <Link to="/profile" className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors">
                                {user?.name}
                            </Link>
                            <Separator orientation="vertical" className="h-4 mx-1" />
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => {
                                    void logout();
                                }}
                                title="Logout"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                            </Button>
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
