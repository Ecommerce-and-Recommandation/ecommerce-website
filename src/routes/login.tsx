import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { auth } from '@/lib/auth';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function AuthPage() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Login state
    const [email, setEmail] = useState('demo@shop.com');
    const [password, setPassword] = useState('demo1234');

    // Register state
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [regName, setRegName] = useState('');
    const [regPhone, setRegPhone] = useState('');
    const [regAddress, setRegAddress] = useState('');

    async function handleLogin(e: React.SyntheticEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await auth.login(email, password);
            void navigate({ to: '/' });
        } catch {
            setError('Email hoặc mật khẩu không đúng');
        } finally {
            setLoading(false);
        }
    }

    async function handleRegister(e: React.SyntheticEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await auth.register(regEmail, regPassword, regName, regPhone, regAddress);
            void navigate({ to: '/' });
        } catch {
            setError('Đăng ký thất bại. Email có thể đã tồn tại.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-2">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <ShoppingBag className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        {isLogin ? 'Sign in to continue shopping' : 'Join us to start shopping'}
                    </p>
                </div>

                <Card className="border-none shadow-2xl bg-card">
                    {isLogin ? (
                        <>
                            <CardHeader className="space-y-1">
                                <CardDescription className="text-center">Demo: demo@shop.com / demo1234</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleLogin} className="space-y-4">
                                    {error && (
                                        <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium border border-destructive/20">
                                            {error}
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required className="h-12"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required className="h-12"
                                        />
                                    </div>
                                    <Button type="submit" className="w-full h-12 font-bold text-base mt-2" disabled={loading}>
                                        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                        Sign In
                                    </Button>
                                </form>
                            </CardContent>
                        </>
                    ) : (
                        <CardContent className="pt-6">
                            <form onSubmit={handleRegister} className="space-y-4">
                                {error && (
                                    <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive font-medium border border-destructive/20">
                                        {error}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="regName">Full Name</Label>
                                    <Input id="regName" value={regName} onChange={(e) => setRegName(e.target.value)} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="regEmail">Email</Label>
                                    <Input id="regEmail" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="regPassword">Password</Label>
                                    <Input id="regPassword" type="password" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="regPhone">Phone Number</Label>
                                    <Input id="regPhone" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} required className="h-12" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="regAddress">Shipping Address</Label>
                                    <Input id="regAddress" value={regAddress} onChange={(e) => setRegAddress(e.target.value)} required className="h-12" />
                                </div>
                                <Button type="submit" className="w-full h-12 font-bold text-base mt-2" disabled={loading}>
                                    {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                    Create Account
                                </Button>
                            </form>
                        </CardContent>
                    )}

                    <CardFooter className="flex flex-col items-center gap-4 pb-6">
                        <Button variant="link" onClick={() => setIsLogin(!isLogin)} className="text-sm">
                            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
                        </Button>
                        <p className="text-xs text-muted-foreground">© 2026 Ecommerce Platform</p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

export const Route = createFileRoute('/login')({
    component: AuthPage,
});
