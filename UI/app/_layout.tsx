import { Stack, useRouter, useSegments } from 'expo-router';
import "../global.css";
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { View, Animated } from 'react-native';
import Logo from '../components/Logo';
import { useRef } from 'react';

function RootLayoutNav() {
    const { user, isLoading } = useAuth();
    const segments = useSegments() as string[];
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        const inAuthGroup = segments[0] === 'auth';
        const inTabsGroup = segments[0] === '(tabs)';

        if (!user && inTabsGroup) {
            router.replace('/auth/login');
        } else if (user && inAuthGroup) {
            router.replace('/(tabs)');
        }
    }, [user, segments, isLoading]);

    const fadeAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (isLoading) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 0.3,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [isLoading]);

    if (isLoading) {
        return (
            <View className="flex-1 justify-center items-center bg-white">
                <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: 1.5 }] }}>
                    <Logo color="#047857" />
                </Animated.View>
            </View>
        );
    }

    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="auth/login" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="item/[id]" options={{ headerShown: false }} />
            <Stack.Screen name="categories/manage" options={{ headerShown: false }} />
        </Stack>
    );
}

import { ToastProvider } from '../context/ToastContext';

export default function Layout() {
    return (
        <AuthProvider>
            <ToastProvider>
                <RootLayoutNav />
            </ToastProvider>
        </AuthProvider>
    );
}
