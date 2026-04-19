import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';

interface PromoFormProps {
    onCreate: (data: { code: string; discount_type: string; discount_value: number; min_order_amount: number }) => void;
    isPending: boolean;
}

export function PromoForm({ onCreate, isPending }: PromoFormProps) {
    const [code, setCode] = useState('');
    const [discountType, setDiscountType] = useState('PERCENTAGE');
    const [discountValue, setDiscountValue] = useState<number>(10);
    const [minOrder, setMinOrder] = useState<number>(0);

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        onCreate({
            code: code.toUpperCase(),
            discount_type: discountType,
            discount_value: discountValue,
            min_order_amount: minOrder,
        });
        setCode('');
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base font-bold">Create Custom Promo</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="promo-code" className="font-bold text-xs uppercase text-muted-foreground">
                            Code
                        </Label>
                        <Input
                            id="promo-code"
                            required
                            value={code}
                            onChange={(e) => {
                                setCode(e.target.value);
                            }}
                            placeholder="SUMMER20"
                            className="uppercase font-mono font-bold"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">Type</Label>
                            <Select value={discountType} onValueChange={setDiscountType}>
                                <SelectTrigger className="font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE" className="font-bold">
                                        % Off
                                    </SelectItem>
                                    <SelectItem value="FIXED_AMOUNT" className="font-bold">
                                        £ Off
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="promo-val" className="font-bold text-xs uppercase text-muted-foreground">
                                Value
                            </Label>
                            <Input
                                id="promo-val"
                                required
                                type="number"
                                min="1"
                                value={discountValue}
                                onChange={(e) => {
                                    setDiscountValue(Number(e.target.value));
                                }}
                                className="font-bold"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="promo-min" className="font-bold text-xs uppercase text-muted-foreground">
                            Min Order Amount (£)
                        </Label>
                        <Input
                            id="promo-min"
                            type="number"
                            min="0"
                            value={minOrder}
                            onChange={(e) => {
                                setMinOrder(Number(e.target.value));
                            }}
                            className="font-bold"
                        />
                    </div>
                    <Button type="submit" className="w-full font-extrabold shadow-lg shadow-primary/20" disabled={isPending || !code}>
                        <Plus className="mr-2 h-4 w-4" /> Create Promotion
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
