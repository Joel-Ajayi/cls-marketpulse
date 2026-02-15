import React, { useEffect } from 'react';
import { Text, View, TouchableOpacity } from 'react-native';
import Animated, { FadeInUp, FadeOutUp } from 'react-native-reanimated';
import { CheckCircle, XCircle, Info } from 'lucide-react-native';

export type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
    message: string;
    type: ToastType;
    onHide: () => void;
};

export default function Toast({ message, type, onHide }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onHide();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onHide]);

    let bg = 'bg-gray-800';
    let icon = <Info color="white" size={24} />;

    if (type === 'success') {
        bg = 'bg-[#047857]'; // Green-700
        icon = <CheckCircle color="white" size={24} />;
    } else if (type === 'error') {
        bg = 'bg-red-500';
        icon = <XCircle color="white" size={24} />;
    }

    return (
        <Animated.View
            entering={FadeInUp.springify().damping(15)}
            exiting={FadeOutUp}
            className={`absolute top-12 left-4 right-4 z-50 rounded-2xl shadow-lg p-4 flex-row items-center ${bg}`}
        >
            <View className="mr-3">{icon}</View>
            <Text className="flex-1 text-white font-medium text-base">{message}</Text>
            <TouchableOpacity onPress={onHide}>
                <XCircle color="white" size={20} opacity={0.5} />
            </TouchableOpacity>
        </Animated.View>
    );
}
