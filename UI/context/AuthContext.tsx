import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
    id: string;
    email: string;
};

type AuthType = {
    user: User | null;
    isLoading: boolean;
    signIn: (token: string, user: User) => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthType>({
    user: null,
    isLoading: true,
    signIn: async () => { },
    signOut: async () => { },
});

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const restoreSession = async () => {
            try {
                const token = await SecureStore.getItemAsync('auth_token');
                if (token) {
                    const userJson = await SecureStore.getItemAsync('user_info');
                    if (userJson) {
                        setUser(JSON.parse(userJson));
                    }
                }
            } catch (e) {
                console.error('Restoring session failed', e);
            } finally {
                setIsLoading(false);
            }
        };

        restoreSession();
    }, []);

    const signIn = async (token: string, newUser: User) => {
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('user_info', JSON.stringify(newUser));
        setUser(newUser);
    };

    const signOut = async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('user_info');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}
