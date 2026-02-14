import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LogOut, Download, ChevronRight, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function Profile() {
    const router = useRouter();

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: 'destructive',
                    onPress: () => {
                        // TODO: Clear session
                        router.replace('/auth/login');
                    }
                }
            ]
        );
    };

    const handleExport = () => {
        // TODO: Trigger CSV download
        Alert.alert("Exporting Data", "Your market data is being exported to CSV...");
    };

    return (
        <ScrollView className="flex-1 bg-gray-50">
            <View className="bg-white p-6 mb-6 items-center border-b border-gray-100">
                <View className="w-20 h-20 bg-green-100 rounded-full items-center justify-center mb-4">
                    <User size={40} color="#047857" />
                </View>
                <Text className="text-xl font-bold text-gray-900">John Doe</Text>
                <Text className="text-gray-500">john.doe@example.com</Text>
            </View>

            <View className="bg-white border-y border-gray-100">
                <TouchableOpacity
                    onPress={handleExport}
                    className="flex-row items-center justify-between p-4 border-b border-gray-100 active:bg-gray-50"
                >
                    <View className="flex-row items-center">
                        <View className="bg-blue-100 p-2 rounded-lg mr-3">
                            <Download size={20} color="#3b82f6" />
                        </View>
                        <Text className="text-base font-medium text-gray-900">Export Market Data (CSV)</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={handleLogout}
                    className="flex-row items-center justify-between p-4 active:bg-gray-50"
                >
                    <View className="flex-row items-center">
                        <View className="bg-red-100 p-2 rounded-lg mr-3">
                            <LogOut size={20} color="#ef4444" />
                        </View>
                        <Text className="text-base font-medium text-red-600">Log Out</Text>
                    </View>
                    <ChevronRight size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            <View className="p-6">
                <Text className="text-center text-gray-400 text-sm">MarketPulse v1.0.0</Text>
            </View>
        </ScrollView>
    );
}
