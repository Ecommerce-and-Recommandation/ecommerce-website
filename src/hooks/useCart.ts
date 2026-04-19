import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { shopService } from '@/services/shopService';

export function useCart() {
    return useQuery({
        queryKey: ['cart'],
        queryFn: shopService.cart,
    });
}

export function useAddToCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ productId, quantity }: { productId: number; quantity?: number }) => shopService.addToCart(productId, quantity),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    });
}

export function useUpdateCartItem() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ itemId, quantity }: { itemId: number; quantity: number }) => shopService.updateCartItem(itemId, quantity),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    });
}

export function useRemoveFromCart() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (itemId: number) => shopService.removeFromCart(itemId),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['cart'] }),
    });
}
