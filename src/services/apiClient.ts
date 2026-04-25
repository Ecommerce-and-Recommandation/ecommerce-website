import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from 'axios';
import { auth } from '@/lib/auth';

interface RefreshResponse {
    access_token: string;
}

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

export const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30_000,
    withCredentials: true,
});

apiClient.interceptors.response.use(
    (response) => response,
    async (error: unknown) => {
        const axiosError = error instanceof AxiosError ? error : new AxiosError('Unexpected API error');
        const originalRequest = axiosError.config as RetryableRequestConfig | undefined;

        if (!originalRequest) {
            throw axiosError;
        }

        const isUnauthorized = axiosError.response?.status === 401;
        const isRetryable = !originalRequest._retry && originalRequest.url !== '/auth/login';

        if (isUnauthorized && isRetryable) {
            originalRequest._retry = true;

            try {
                const refreshResponse = await axios.post<RefreshResponse>('http://localhost:8000/api/auth/refresh', {}, { withCredentials: true });
                const { access_token } = refreshResponse.data;

                auth.updateToken(access_token);

                const headers = AxiosHeaders.from(originalRequest.headers);
                headers.set('Authorization', `Bearer ${access_token}`);
                originalRequest.headers = headers;

                return await apiClient(originalRequest);
            } catch (refreshError: unknown) {
                void auth.logout();
                throw (refreshError instanceof Error ? refreshError : new Error('Failed to refresh access token'));
            }
        }

        throw axiosError;
    },
);
