import { createFileRoute } from '@tanstack/react-router';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { UserCircle, Mail, Phone, MapPin, Shield } from 'lucide-react';

function ProfilePage() {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="max-w-3xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal information</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserCircle className="h-5 w-5" /> Personal Details
                    </CardTitle>
                    <CardDescription>Your registered information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <UserCircle className="h-4 w-4" /> Full Name
                            </label>
                            <p className="font-medium text-lg">{user.name}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Mail className="h-4 w-4" /> Email
                            </label>
                            <p className="font-medium text-lg">{user.email}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <Phone className="h-4 w-4" /> Phone Number
                            </label>
                            <p className="font-medium text-lg">{user.phone ?? 'Not provided'}</p>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Default Shipping Address
                            </label>
                            <p className="font-medium text-lg">{user.address ?? 'Not provided'}</p>
                        </div>
                    </div>
                    {user.is_admin && (
                        <div className="pt-4 border-t flex items-center gap-2 text-primary font-medium">
                            <Shield className="h-5 w-5" /> Administrator Account
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export const Route = createFileRoute('/profile')({
    component: ProfilePage,
});
