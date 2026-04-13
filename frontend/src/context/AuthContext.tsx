import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: LoginRequest) => Promise<void>;
    register: (data: RegisterRequest) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
                                                                    children,
                                                                }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const initAuth = async () => {
            const token = authService.getToken();
            if (token) {
                try {
                    const currentUser = await authService.getCurrentUser();
                    setUser(currentUser);
                } catch {
                    authService.logout();
                }
            }
            setIsLoading(false);
        };
        initAuth();
    }, []);

    const login = async (data: LoginRequest) => {
        const response = await authService.login(data);
        localStorage.setItem('token', response.token);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
    };

    const register = async (data: RegisterRequest) => {
        const response = await authService.register(data);
        localStorage.setItem('token', response.token);
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};