import { createFileRoute, useNavigate, Link } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { useState, useMemo } from 'react';
import { useCart } from '@/hooks/useCart';
import { shopService } from '@/services/shopService';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle2, Loader2, MapPin, Phone } from 'lucide-react';
import { useAvailablePromotions } from '@/hooks/usePromotions';

type CheckoutSearch = {
    items?: string;
    promo?: string;
};

export const Route = createFileRoute('/checkout')({
    validateSearch: (search: Record<string, unknown>): CheckoutSearch => {
        return {
            items: search.items as string | undefined,
            promo: search.promo as string | undefined,
        };
    },
    component: CheckoutPage,
});

function CheckoutPage() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const search = Route.useSearch();
    const { data: cart } = useCart();
    const queryClient = useQueryClient();

    const [address, setAddress] = useState(user?.address || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    const itemIds = useMemo(() => {
        return search.items ? search.items.split(',').map(Number) : [];
    }, [search.items]);

    const promoId = search.promo ? Number(search.promo) : undefined;

    const checkoutItems = useMemo(() => {
        if (!cart) return [];
        return cart.items.filter(i => itemIds.includes(i.id));
    }, [cart, itemIds]);

    const subtotal = useMemo(() => {
        return checkoutItems.reduce((acc, item) => acc + item.product_price * item.quantity, 0);
    }, [checkoutItems]);

    const { data: availablePromos } = useAvailablePromotions(subtotal);

    const discountAmount = useMemo(() => {
        if (!promoId || !availablePromos) return 0;
        const promo = availablePromos.find(p => p.id === promoId);
        if (!promo) return 0;
        return promo.discount_type === 'PERCENTAGE' ? (subtotal * promo.discount_value) / 100 : promo.discount_value;
    }, [promoId, availablePromos, subtotal]);

    const total = Math.max(0, subtotal - discountAmount);

    if (!user) return null;
    if (checkoutItems.length === 0) {
        return (
            <div className="py-20 text-center space-y-4 animate-in fade-in">
                <h2 className="text-2xl font-bold">No items selected for checkout</h2>
                <Button asChild>
                    <Link to="/cart">Return to Cart</Link>
                </Button>
            </div>
        );
    }

    async function handleCheckout(e: React.SyntheticEvent) {
        e.preventDefault();
        setError('');
        
        if (!address.trim() || !phone.trim()) {
            setError('Please provide a valid shipping address and phone number.');
            return;
        }

        setIsSubmitting(true);
        try {
            await shopService.checkout(itemIds, promoId, address, phone);
            void queryClient.invalidateQueries({ queryKey: ['cart'] });
            void navigate({ to: '/orders' });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to place order.');
            setIsSubmitting(false);
        }
    }

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center gap-3">
                <Link to="/cart" className="text-muted-foreground hover:text-primary transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-3xl font-extrabold tracking-tight">Checkout</h1>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left: Shipping Form */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                                {error && (
                                    <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
                                        {error}
                                    </div>
                                )}
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" value={user.name} disabled className="bg-muted" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" value={user.email} disabled className="bg-muted" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="flex items-center gap-2"><Phone className="h-4 w-4"/> Phone Number</Label>
                                    <Input 
                                        id="phone" 
                                        value={phone} 
                                        onChange={e => setPhone(e.target.value)} 
                                        placeholder="Enter your phone number" 
                                        required 
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="flex items-center gap-2"><MapPin className="h-4 w-4"/> Shipping Address</Label>
                                    <Input 
                                        id="address" 
                                        value={address} 
                                        onChange={e => setAddress(e.target.value)} 
                                        placeholder="Enter your full delivery address" 
                                        required 
                                    />
                                </div>
                            </form>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Order Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {checkoutItems.map(item => (
                                <div key={item.id} className="flex gap-4 items-center border-b pb-4 last:border-0 last:pb-0">
                                    <img src={item.product_image || '/placeholder.jpg'} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg border" />
                                    <div className="flex-1">
                                        <h4 className="font-semibold line-clamp-1">{item.product_name}</h4>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="font-bold text-lg">
                                        ${(item.product_price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Summary */}
                <div className="space-y-6">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal ({checkoutItems.length} items)</span>
                                <span>${subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-emerald-500 font-medium">Free</span>
                            </div>
                            {discountAmount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Discount Applied</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="border-t pt-4 flex justify-between font-bold text-xl">
                                <span>Total</span>
                                <span>${total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                type="submit" 
                                form="checkout-form"
                                className="w-full h-12 text-lg font-bold rounded-xl shadow-lg shadow-primary/20 transition-transform active:scale-95"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <CheckCircle2 className="h-5 w-5 mr-2" />}
                                Place Order
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
