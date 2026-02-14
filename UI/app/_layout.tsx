import { Stack } from 'expo-router';
import "../global.css";
import { useColorScheme } from "nativewind";
import { useEffect } from 'react';

export default function Layout() {
    const { setColorScheme } = useColorScheme();

    useEffect(() => {
        setColorScheme('light');
    }, []);

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
