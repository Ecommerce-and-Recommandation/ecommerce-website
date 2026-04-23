/**
 * Auth store – manages JWT token & user state.
 * Uses `useSyncExternalStore` for React 18+ compatibility without external deps.
 */

import { apiClient as api } from '@/services/apiClient';
import { useSyncExternalStore } from 'react';

interface AuthUser {
    id: number;
    email: string;
    name: string;
    country: string;
    phone?: string;
    address?: string;
    is_admin: boolean;
}

interface AuthState {
    token: string | null;
    user: AuthUser | null;
}

type Listener = () => void;

const AUTH_KEY = 'ecommerce_auth';

function loadState(): AuthState {
    try {
        const raw = localStorage.getItem(AUTH_KEY);
        if (raw) return JSON.parse(raw) as AuthState;
    } catch (e) {
        console.debug('Failed to parse auth state', e);
    }
    return { token: null, user: null };
}

let state: AuthState = loadState();
const listeners = new Set<Listener>();

function emit() {
    listeners.forEach((l) => {
        l();
    });
}

function persist(s: AuthState) {
    state = s;
    if (s.token) localStorage.setItem(AUTH_KEY, JSON.stringify(s));
    else localStorage.removeItem(AUTH_KEY);
    emit();
}

export const auth = {
    getState: () => state,
    subscribe: (listener: Listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    login: async (email: string, password: string) => {
        const res = await api.post<{ access_token: string; user: AuthUser }>('/auth/login', {
            email,
            password,
        });
        persist({ token: res.data.access_token, user: res.data.user });
        return res.data;
    },

    register: async (email: string, password: string, name: string, phone: string, address: string) => {
        const res = await api.post<{ access_token: string; user: AuthUser }>('/auth/register', {
            email,
            password,
            name,
            phone,
            address,
        });
        persist({ token: res.data.access_token, user: res.data.user });
        return res.data;
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (e) {
            console.error('Logout API failed', e);
        }
        persist({ token: null, user: null });
    },

    updateToken: (newToken: string) => {
        persist({ ...state, token: newToken });
    },

    isLoggedIn: () => !!state.token,
};

// ── Axios interceptor: attach JWT automatically ────────
api.interceptors.request.use((cfg) => {
    const { token } = auth.getState();
    if (token) {
        cfg.headers.Authorization = `Bearer ${token}`;
    }
    return cfg;
});

api.interceptors.response.use(
    (r) => r,
    (err: unknown) => {
        const error = err as { response?: { status?: number } };
        if (error.response?.status === 401) {
            auth.logout();
        }
        return Promise.reject(err instanceof Error ? err : new Error(String(err)));
    },
);

// ── React hook ─────────────────────────────────────────

export function useAuth() {
    const s = useSyncExternalStore(auth.subscribe, auth.getState);
    return { ...s, login: auth.login, logout: auth.logout, isLoggedIn: !!s.token };
}
