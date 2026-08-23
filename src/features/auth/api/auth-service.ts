import axios, { endpoints } from 'src/shared/utils/axios';
import type { User } from 'src/shared/types/api';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user: User;
}

export const authService = {
    login: async (payload: LoginPayload): Promise<LoginResponse> => {
        const { data } = await axios.post(endpoints.auth.login, payload);
        return data;
    },
    me: async (): Promise<User> => {
        const { data } = await axios.get(endpoints.auth.me);
        return data;
    },
    logout: async (): Promise<void> => {
        await axios.post(endpoints.auth.logout);
    },
};
