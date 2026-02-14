import { View, Text, Image, ScrollView, TouchableOpacity, Modal, KeyboardAvoidingView, TextInput, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, Calendar, Tag, Clock, Edit2, X, Check } from 'lucide-react-native';

export default function ItemDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    // Edit State
    const [isEditModalVisible, setEditModalVisible] = useState(false);
    const [itemName, setItemName] = useState("Rice (Foreign)");
    const [itemCategory, setItemCategory] = useState("Grains");

    // Dummy Stats
    // Unit State
    const [selectedUnit, setSelectedUnit] = useState('Kg');
    const UNITS = ['Kg', 'Bag', 'Basket', 'Crate'];

    // Dummy Stats by Unit
    const STATS_BY_UNIT: Record<string, { min: number, max: number, avg: number }> = {
        'Kg': { min: 6500, max: 9000, avg: 7850 },
        'Bag': { min: 45000, max: 55000, avg: 48500 },
        'Basket': { min: 12000, max: 18000, avg: 14500 },
        'Crate': { min: 8000, max: 11000, avg: 9200 },
    };

    const currentStats = STATS_BY_UNIT[selectedUnit] || { min: 0, max: 0, avg: 0 };
    const dateFirstPurchased = "12 Oct 2023";

    const handleSaveEdit = () => {
        // TODO: Backend update
        setEditModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <ScrollView>
                {/* Header Image Area */}
                <View className="relative h-72 bg-gray-200 dark:bg-slate-800 w-full">
                    {/* Back Button Overlay */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 left-6 z-10 p-2 bg-white/80 dark:bg-slate-800/80 rounded-full"
                    >
                        <ArrowLeft size={24} color="#047857" />
                    </TouchableOpacity>

                    {/* Edit Button */}
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: '/item/add_price',
                            params: {
                                mode: 'edit',
                                existingName: itemName,
                                existingCategory: itemCategory
                            }
                        })}
                        className="absolute top-4 right-6 z-10 p-2 bg-white/80 dark:bg-slate-800/80 rounded-full"
                    >
                        <Edit2 size={24} color="#047857" />
                    </TouchableOpacity>

                    {/* Placeholder for Full Res Image */}
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-6xl">🍚</Text>
                        <Text className="text-gray-500 dark:text-gray-400 mt-2">No Image Available</Text>
                    </View>
                </View>

                {/* Content Container */}
                <View className="flex-1 bg-white dark:bg-slate-900 -mt-6 rounded-t-3xl px-6 pt-8 pb-10">
                    <View className="mb-6">
                        <View className="flex-row justify-between items-start">
                            <View>
                                <Text className="text-3xl font-bold text-gray-900 dark:text-white">{itemName}</Text>
                                <View className="flex-row items-center mt-2">
                                    <Tag size={14} color="#6b7280" />
                                    <Text className="text-gray-500 dark:text-gray-400 ml-1">{itemCategory} Category</Text>
                                </View>
                            </View>
                            <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                <Text className="text-[#047857] dark:text-green-400 font-bold">Active</Text>
                            </View>
                        </View>
                    </View>

                    {/* Unit Selector */}
                    <View className="mb-6">
                        <Text className="text-gray-900 dark:text-white font-bold mb-3">Select Unit</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {UNITS.map((u) => (
                                <TouchableOpacity
                                    key={u}
                                    onPress={() => setSelectedUnit(u)}
                                    className={`mr-3 px-5 py-2 rounded-full border ${selectedUnit === u
                                        ? 'bg-[#047857] border-[#047857]'
                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                                        }`}
                                >
                                    <Text className={selectedUnit === u ? 'text-white font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                        {u}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Stats Grid */}
                    <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">Performance ({selectedUnit})</Text>
                    <View className="flex-row flex-wrap justify-between mb-6">
                        <View className="w-[48%] bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl mb-4 border border-gray-100 dark:border-slate-700">
                            <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Lowest Ever</Text>
                            <Text className="text-2xl font-bold text-[#047857] dark:text-green-400">₦{currentStats.min.toLocaleString()}</Text>
                        </View>
                        <View className="w-[48%] bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl mb-4 border border-gray-100 dark:border-slate-700">
                            <Text className="text-gray-500 dark:text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Highest Ever</Text>
                            <Text className="text-2xl font-bold text-red-600 dark:text-red-400">₦{currentStats.max.toLocaleString()}</Text>
                        </View>
                        <View className="w-[100%] bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl mb-4 border border-blue-100 dark:border-blue-900/30 flex-row justify-between items-center">
                            <View>
                                <Text className="text-blue-500 dark:text-blue-400 text-xs uppercase font-bold tracking-wider mb-1">Average Cost</Text>
                                <Text className="text-2xl font-bold text-blue-900 dark:text-blue-100">₦{currentStats.avg.toLocaleString()}</Text>
                            </View>
                            <View className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full">
                                <TrendingUp size={24} color="#1e3a8a" />
                            </View>
                        </View>
                    </View>

                    {/* Static Info */}
                    <View className="bg-gray-50 dark:bg-slate-800 p-4 rounded-2xl mb-8 flex-row items-center">
                        <Clock size={20} color="#6b7280" />
                        <View className="ml-3">
                            <Text className="text-gray-900 dark:text-white font-medium">First Purchased</Text>
                            <Text className="text-gray-500 dark:text-gray-400 text-sm">{dateFirstPurchased}</Text>
                        </View>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: `/item/${id}/history`, params: { unit: selectedUnit } })}
                        className="bg-[#047857] w-full py-4 rounded-full items-center shadow-lg shadow-green-200 dark:shadow-none gap-2 flex-row justify-center"
                    >
                        <Calendar size={20} color="white" />
                        <Text className="text-white font-bold text-lg">History Trends</Text>
                    </TouchableOpacity>
                </View>

                {/* Edit Modal Removed */}
            </ScrollView>
        </SafeAreaView>
    );
}
