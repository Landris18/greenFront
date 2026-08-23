import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { CONFIG } from 'src/config/env';

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const axiosInstance = axios.create({
    baseURL: CONFIG.serverUrl,
    headers: { 'Content-Type': 'application/json' },
});

export function getStoredToken(): string | null {
    return localStorage.getItem(CONFIG.tokenKey);
}

export function setSession(accessToken: string | null, refreshToken: string | null): void {
    if (accessToken) {
        localStorage.setItem(CONFIG.tokenKey, accessToken);
        axiosInstance.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    } else {
        localStorage.removeItem(CONFIG.tokenKey);
        delete axiosInstance.defaults.headers.common.Authorization;
    }

    if (refreshToken) {
        localStorage.setItem(CONFIG.refreshTokenKey, refreshToken);
    } else {
        localStorage.removeItem(CONFIG.refreshTokenKey);
    }
}

axiosInstance.interceptors.request.use((config) => {
    const token = getStoredToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const original = error.config as RetriableRequest | undefined;
        const refreshToken = localStorage.getItem(CONFIG.refreshTokenKey);

        if (error.response?.status === 401 && original && !original._retry && refreshToken) {
            original._retry = true;
            try {
                const { data } = await axios.post(`${CONFIG.serverUrl}/api/auth/refresh`, {
                    refresh_token: refreshToken,
                });
                setSession(data.access_token, data.refresh_token);
                original.headers.Authorization = `Bearer ${data.access_token}`;
                return axiosInstance(original);
            } catch {
                setSession(null, null);
                window.location.href = '/connexion';
            }
        }

        return Promise.reject(error.response?.data ?? error);
    }
);

export default axiosInstance;

export const endpoints = {
    auth: {
        login: '/api/auth/login',
        refresh: '/api/auth/refresh',
        logout: '/api/auth/logout',
        me: '/api/auth/me',
    },
    users: '/api/users',
    projects: '/api/projects',
    hosts: '/api/hosts',
    containers: '/api/containers',
    live: '/api/live',
    metrics: '/api/metrics',
    energy: '/api/energy',
    carbon: '/api/carbon',
    recommendations: '/api/recommendations',
    comparisons: '/api/comparisons',
    settings: '/api/settings/green',
} as const;
