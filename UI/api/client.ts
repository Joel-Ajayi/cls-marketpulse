import axios, { InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use special IP for Android Emulator, localhost for iOS/Web
const IP_ADDR = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';
const DEV_API_URL = `http://${IP_ADDR}:8000`;
const PROD_API_URL = 'https://cls_marketplace.yotstack.tech/api';

// Toggle this for production build
const IS_PROD = false;

export const API_URL = IS_PROD ? PROD_API_URL : DEV_API_URL;

const api = axios.create({
    baseURL: API_URL,
    timeout: 15000, // 15 seconds timeout
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        try {
            const token = await SecureStore.getItemAsync('auth_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error fetching token', error);
        }
        return config;
    },
    (error: any) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle 401s
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            try {
                await SecureStore.deleteItemAsync('auth_token');
                await SecureStore.deleteItemAsync('user_info');
                // The UI will react to the missing token in AuthContext if we could access it here
                // properly, but since this is outside React context, we rely on the next app reload 
                // or we can try to reload the app using expo-updates or similar if critical.
                // However, simply failing the request is often enough for the UI to show an error,
                // and the user will likely manually logout or restart.

                // A better approach in React Native without complex state management outside components
                // is to just let the error propagate, but maybe emit an event.
                console.log('Session expired');
            } catch (e) {
                console.error('Error clearing session', e);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
