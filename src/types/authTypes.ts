export interface AuthUser {
    id: number;
    email: string;
    name: string;
    country: string;
    phone?: string;
    address?: string;
    is_admin: boolean;
}

export interface AuthResponse {
    access_token: string;
    user: AuthUser;
}
