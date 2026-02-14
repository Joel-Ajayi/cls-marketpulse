import { View, Text, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { LogOut, Download, ChevronRight, User, Moon, Sun } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from "nativewind";
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
    const router = useRouter();
    const { signOut } = useAuth();
    const { colorScheme, toggleColorScheme } = useColorScheme();

    const handleLogout = () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Log Out",
                    style: 'destructive',
                    onPress: async () => {
                        await signOut();
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
        <ScrollView className="flex-1 bg-gray-50 dark:bg-slate-900">
            {/* Header with Primary Color Background */}
            <View className="bg-[#047857] p-6 pt-12 mb-6 items-center shadow-lg">
                <View className="w-24 h-24 bg-white/20 rounded-full items-center justify-center mb-4 border-2 border-white/30">
                    <User size={48} color="white" />
                </View>
                <Text className="text-2xl font-bold text-white">John Doe</Text>
                <Text className="text-green-100">john.doe@example.com</Text>
            </View>

            <View className="bg-white dark:bg-slate-800 border-y border-gray-100 dark:border-slate-700">
                {/* Theme Toggle Removed - Forced Light Mode */}

                <View className="bg-white dark:bg-slate-800 border-y border-gray-100 dark:border-slate-700">
                    <TouchableOpacity
                        onPress={handleExport}
                        className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-slate-700 active:bg-gray-50 dark:active:bg-slate-700"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                                <Download size={20} color="#3b82f6" />
                            </View>
                            <Text className="text-base font-medium text-gray-900 dark:text-white">Export Market Data (CSV)</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={handleLogout}
                        className="flex-row items-center justify-between p-4 active:bg-gray-50 dark:active:bg-slate-700"
                    >
                        <View className="flex-row items-center">
                            <View className="bg-red-100 dark:bg-red-900/20 p-2 rounded-lg mr-3">
                                <LogOut size={20} color="#ef4444" />
                            </View>
                            <Text className="text-base font-medium text-red-600 dark:text-red-400">Log Out</Text>
                        </View>
                        <ChevronRight size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                </View>

                <View className="p-6">
                    <Text className="text-center text-gray-400 text-sm">MarketPulse v1.0.0</Text>
                </View>
            </View>
        </ScrollView>
    );
}
