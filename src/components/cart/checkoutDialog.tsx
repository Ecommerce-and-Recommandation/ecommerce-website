import { Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/pricing';

interface CheckoutDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    checkoutMessage: string;
    onCloseMessage: () => void;
    selectedCount: number;
    finalPrice: number;
    isCheckingOut: boolean;
    onConfirm: () => void;
}

export function CheckoutDialog({
    isOpen,
    onOpenChange,
    checkoutMessage,
    onCloseMessage,
    selectedCount,
    finalPrice,
    isCheckingOut,
    onConfirm,
}: CheckoutDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                {checkoutMessage ? (
                    <div className="flex flex-col items-center gap-4 py-4 text-center">
                        <div
                            className={`flex h-16 w-16 items-center justify-center rounded-full ${checkoutMessage.toLowerCase().includes('success') ? 'bg-emerald-100 text-emerald-600' : 'bg-destructive/10 text-destructive'}`}
                        >
                            <Check className="h-8 w-8" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-extrabold">Order Status</DialogTitle>
                            <DialogDescription className="mt-2 font-medium">{checkoutMessage}</DialogDescription>
                        </div>
                        <Button className="mt-4 w-full font-bold" onClick={onCloseMessage}>
                            Close
                        </Button>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle className="text-xl font-extrabold">Confirm Checkout</DialogTitle>
                            <DialogDescription className="pt-2 text-sm leading-relaxed">
                                You are about to place an order for{' '}
                                <span className="font-bold text-foreground">{selectedCount.toString()} items</span> totaling{' '}
                                <span className="text-lg font-extrabold text-foreground">{formatCurrency(finalPrice)}</span>.
                                <br />
                                This action will process your cart items.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter className="flex gap-3 pt-4 sm:justify-start">
                            <Button
                                variant="outline"
                                className="flex-1 font-bold"
                                onClick={() => {
                                    onOpenChange(false);
                                }}
                                disabled={isCheckingOut}
                            >
                                Cancel
                            </Button>
                            <Button className="flex-1 font-bold shadow-lg shadow-primary/20" onClick={onConfirm} disabled={isCheckingOut}>
                                {isCheckingOut ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirm Order'}
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
