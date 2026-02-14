import { View, Image, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Logo from '../components/Logo';

export default function Splash() {
    const router = useRouter();

    return (
        <View className="flex-1 bg-white">
            <StatusBar style="light" />
            <View className="h-[60%] w-full relative z-50">
                {/* Background Image - The Green Shape/Curve */}
                <Image
                    source={require('../assets/Curved_Rectangle.png')}
                    className="absolute -top-20 -left-10 w-[120%] h-[120%] z-1"
                    resizeMode="stretch"
                    style={{
                        transform: [{ rotate: '5deg' }]
                    }}
                />

                {/* Content Container - z-10 ensures it sits ON TOP of the image */}
                <View className="flex-1 px-8 pt-20 z-10">
                    {/* Header Logo */}
                    <View className="flex-row justify-end items-center mb-8 z-10">
                        <View className="items-center">
                            <Logo width={60} height={30} />
                            <Text className="text-white text-[10px] font-medium mt-1">MarketPulse</Text>
                        </View>
                    </View>

                    {/* Main Typography */}
                    <View>
                        <Text className="text-white text-5xl font-extrabold leading-tight">
                            Track
                        </Text>
                        <Text className="text-white text-5xl font-extrabold leading-tight">
                            Market
                        </Text>
                        <Text className="text-white text-5xl font-extrabold leading-tight">
                            Prices in
                        </Text>
                        <Text className="text-white text-5xl font-extrabold leading-tight">
                            Real Time.
                        </Text>
                        <Text className="text-green-50 text-base mt-6 leading-6 font-medium">
                            Monitor Price Changes and make{'\n'}smarter buying decisions.
                        </Text>
                    </View>
                </View>
            </View>

            {/* Bottom Section */}
            <View className="flex-1 items-center justify-between pb-12 bg-white">
                {/* Illustration - Pushed up slightly to overlap/connect if needed, or centered */}
                <View className="flex-1 justify-center items-center w-full">
                    <Image
                        source={require('../assets/splash_middle_img.png')}
                        className="w-72 h-72"
                        resizeMode="contain"
                    />
                </View>

                <TouchableOpacity
                    onPress={() => router.replace('/auth/login')}
                    className="bg-[#047857] w-[85%] py-4 rounded-full items-center shadow-md shadow-green-200"
                >
                    <Text className="text-white font-bold text-lg">GET STARTED</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
