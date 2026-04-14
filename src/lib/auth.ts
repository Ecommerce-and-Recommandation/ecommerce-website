/**
 * Auth store – manages JWT token & user state.
 * Uses `useSyncExternalStore` for React 18+ compatibility without external deps.
 */

import { api } from './api';

interface AuthUser {
    id: number;
    email: string;
    name: string;
    country: string;
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
        if (raw) return JSON.parse(raw);
    } catch {}
    return { token: null, user: null };
}

let state: AuthState = loadState();
const listeners = new Set<Listener>();

function emit() {
    listeners.forEach((l) => l());
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

    logout: () => {
        persist({ token: null, user: null });
    },

    isLoggedIn: () => !!state.token,
};

// ── Axios interceptor: attach JWT automatically ────────
api.interceptors.request.use((cfg) => {
    const { token } = auth.getState();
    if (token) cfg.headers.Authorization = `Bearer ${token}`;
    return cfg;
});

api.interceptors.response.use(
    (r) => r,
    (err) => {
        if (err?.response?.status === 401) {
            auth.logout();
        }
        return Promise.reject(err);
    },
);

// ── React hook ─────────────────────────────────────────
import { useSyncExternalStore } from 'react';

export function useAuth() {
    const s = useSyncExternalStore(auth.subscribe, auth.getState);
    return { ...s, login: auth.login, logout: auth.logout, isLoggedIn: !!s.token };
}
