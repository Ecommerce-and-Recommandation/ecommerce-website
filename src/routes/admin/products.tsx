import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useCategories } from '@/hooks/useProducts';
import { Loader2, PackageSearch, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import type { ShopProduct } from '@/types/productTypes';

function AdminProductsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [editingProduct, setEditingProduct] = useState<ShopProduct | null>(null);
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const { data, isLoading } = useAdminProducts({ search: debouncedSearch || undefined, page, page_size: 15 });
    const { data: categories } = useCategories();
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const deleteProduct = useDeleteProduct();

    const handleSearch = (val: string) => {
        setSearch(val);
        setPage(1);
        // simple debounce
        setTimeout(() => setDebouncedSearch(val), 300);
    };

    const totalPages = data ? Math.ceil(data.total / data.page_size) : 1;

    if (isLoading && !data) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Product Management</h1>
                    <p className="mt-1 text-muted-foreground">
                        {data?.total ?? 0} products in catalog
                    </p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" /> Add Product
                </Button>
            </div>

            {/* Search */}
            <Input
                placeholder="Search products by name or description..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="max-w-md"
            />

            {/* Product Table */}
            <Card className="shadow-sm">
                {!data?.products.length ? (
                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
                        <PackageSearch className="h-12 w-12 mb-4 opacity-50" />
                        <p>No products found.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">ID</th>
                                    <th className="px-4 py-3 font-medium">Image</th>
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">SKU</th>
                                    <th className="px-4 py-3 font-medium">Price</th>
                                    <th className="px-4 py-3 font-medium">Category</th>
                                    <th className="px-4 py-3 font-medium">Stock</th>
                                    <th className="px-4 py-3 font-medium">Sales</th>
                                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.products.map((product) => (
                                    <tr key={product.id} className="hover:bg-muted/10 transition-colors">
                                        <td className="px-4 py-3 font-mono text-xs">{product.id}</td>
                                        <td className="px-4 py-3">
                                            {product.image_url ? (
                                                <img src={product.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                                            ) : (
                                                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">N/A</div>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 font-medium max-w-[200px] truncate">{product.name}</td>
                                        <td className="px-4 py-3 font-mono text-xs">{product.stock_code}</td>
                                        <td className="px-4 py-3 font-bold">£{product.price.toFixed(2)}</td>
                                        <td className="px-4 py-3">
                                            <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                                        </td>
                                        <td className="px-4 py-3">
                                            <Badge variant={product.in_stock ? 'default' : 'destructive'} className="text-xs">
                                                {product.in_stock ? 'In Stock' : 'Out'}
                                            </Badge>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{product.purchase_count}</td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex gap-1 justify-end">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setEditingProduct(product)}
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-destructive hover:text-destructive"
                                                    onClick={() => {
                                                        if (confirm(`Delete "${product.name}"?`)) {
                                                            deleteProduct.mutate(product.id);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
                        <span className="text-muted-foreground">
                            Page {page} of {totalPages} ({data?.total} items)
                        </span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Create Dialog */}
            <ProductFormDialog
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                title="Add New Product"
                categories={categories?.map((c) => c.name) ?? []}
                onSubmit={(data) => {
                    createProduct.mutate(data, { onSuccess: () => setIsCreateOpen(false) });
                }}
                isLoading={createProduct.isPending}
            />

            {/* Edit Dialog */}
            <ProductFormDialog
                open={!!editingProduct}
                onOpenChange={(open) => !open && setEditingProduct(null)}
                title={`Edit: ${editingProduct?.name ?? ''}`}
                initialData={editingProduct ?? undefined}
                categories={categories?.map((c) => c.name) ?? []}
                onSubmit={(data) => {
                    if (editingProduct) {
                        updateProduct.mutate(
                            { id: editingProduct.id, data },
                            { onSuccess: () => setEditingProduct(null) },
                        );
                    }
                }}
                isLoading={updateProduct.isPending}
            />
        </div>
    );
}

function ProductFormDialog({
    open,
    onOpenChange,
    title,
    initialData,
    categories,
    onSubmit,
    isLoading,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    initialData?: Partial<ShopProduct>;
    categories: string[];
    onSubmit: (data: Partial<ShopProduct>) => void;
    isLoading: boolean;
}) {
    const [formData, setFormData] = useState<Partial<ShopProduct>>(initialData ?? {});

    // Reset form when dialog opens with new data
    const handleOpenChange = (isOpen: boolean) => {
        if (isOpen) {
            setFormData(initialData ?? {});
        }
        onOpenChange(isOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>Fill in the product details below.</DialogDescription>
                </DialogHeader>

                <form
                    className="space-y-4 mt-4"
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit(formData);
                    }}
                >
                    {!initialData && (
                        <div>
                            <label className="text-sm font-medium mb-1 block">Stock Code *</label>
                            <Input
                                required
                                value={formData.stock_code ?? ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, stock_code: e.target.value }))}
                                placeholder="e.g. SKU001"
                            />
                        </div>
                    )}
                    <div>
                        <label className="text-sm font-medium mb-1 block">Name *</label>
                        <Input
                            required
                            value={formData.name ?? ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Product name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium mb-1 block">Price (£) *</label>
                            <Input
                                required
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.price ?? ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, price: parseFloat(e.target.value) }))}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Category</label>
                            <Input
                                value={formData.category ?? ''}
                                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                                placeholder="e.g. Home & Kitchen"
                                list="categories-list"
                            />
                            <datalist id="categories-list">
                                {categories.map((c) => (
                                    <option key={c} value={c} />
                                ))}
                            </datalist>
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Image URL</label>
                        <Input
                            value={formData.image_url ?? ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, image_url: e.target.value }))}
                            placeholder="https://..."
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Description</label>
                        <Input
                            value={formData.description ?? ''}
                            onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                            placeholder="Short description"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {initialData ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export const Route = createFileRoute('/admin/products')({
    component: AdminProductsPage,
});
