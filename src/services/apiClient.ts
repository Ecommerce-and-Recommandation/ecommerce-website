import axios from 'axios';
import { auth } from '@/lib/auth';

export const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    headers: { 'Content-Type': 'application/json' },
    timeout: 30_000,
    withCredentials: true,
});

// Refresh token interceptor
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // If 401 error and not a retry and not a login request
        if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== '/auth/login') {
            originalRequest._retry = true;
            try {
                const res = await axios.post('http://localhost:8000/api/auth/refresh', {}, { withCredentials: true });
                const { access_token } = res.data;

                auth.updateToken(access_token);

                // Retry original request
                originalRequest.headers.Authorization = `Bearer ${access_token}`;
                return apiClient(originalRequest);
            } catch (refreshError) {
                auth.logout();
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);
