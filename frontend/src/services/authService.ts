import api from './api';
import {
    ApiResponse,
    AuthResponse,
    LoginRequest,
    RegisterRequest,
    User,
} from '../types';

export const authService = {
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            '/auth/register', data);
        return response.data.data;
    },

    async login(data: LoginRequest): Promise<AuthResponse> {
        const response = await api.post<ApiResponse<AuthResponse>>(
            '/auth/login', data);
        return response.data.data;
    },

    async getCurrentUser(): Promise<User> {
        const response = await api.get<ApiResponse<User>>('/auth/me');
        return response.data.data;
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    getToken(): string | null {
        return localStorage.getItem('token');
    },

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    },
};