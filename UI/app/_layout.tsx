import { Stack } from 'expo-router';
import "../global.css";

export default function Layout() {
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
