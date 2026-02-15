import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState, useEffect, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, TrendingUp, Calendar, Tag, Clock, Edit2 } from 'lucide-react-native';
import api from '../../../api/client';
import { Item } from '../../../types';
import { useToast } from '../../../context/ToastContext';

// Define a local type for price history if not available globally yet
interface PriceHistoryItem {
    date: string;
    unit: string;
    price: number; // price is already a number from API
}

export default function ItemDetails() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { showToast } = useToast();

    const [item, setItem] = useState<Item | null>(null);
    const [history, setHistory] = useState<PriceHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    // Unit State
    const [selectedUnit, setSelectedUnit] = useState<string>('');

    useEffect(() => {
        if (id) {
            loadData();
        }
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Item Details
            const itemRes = await api.get<Item>(`/items/${id}`);
            setItem(itemRes.data);

            // 2. Fetch Price History to calculate stats
            const historyRes = await api.get<PriceHistoryItem[]>(`/prices/history/${id}`);
            setHistory(historyRes.data);

            // Set initial unit if history exists
            if (historyRes.data.length > 0) {
                // Default to the most recent unit or the first one found
                const recentUnit = historyRes.data[historyRes.data.length - 1].unit;
                setSelectedUnit(recentUnit);
            } else if (itemRes.data.unit) {
                setSelectedUnit(itemRes.data.unit);
            }

        } catch (error) {
            console.error(error);
            showToast('Failed to load item data', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Calculate Stats based on selectedUnit
    const stats = useMemo(() => {
        const filtered = history.filter(h => h.unit === selectedUnit);
        if (filtered.length === 0) return { min: 0, max: 0, avg: 0 };

        const prices = filtered.map(h => h.price);
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

        return { min, max, avg };
    }, [history, selectedUnit]);

    // Get unique units for selector
    const units = useMemo(() => {
        const unique = new Set(history.map(h => h.unit));
        if (item?.unit) unique.add(item.unit); // Ensure current default unit is included
        return Array.from(unique);
    }, [history, item]);

    const formatCurrency = (amount: number) => `₦${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

    const handleDelete = () => {
        import('react-native').then(({ Alert }) => {
            Alert.alert(
                "Delete Item",
                "Are you sure you want to delete this item? This cannot be undone.",
                [
                    { text: "Cancel", style: "cancel" },
                    {
                        text: "Delete",
                        style: "destructive",
                        onPress: async () => {
                            try {
                                await api.delete(`/items/${id}`);
                                showToast("Item deleted successfully", "success");
                                router.replace('/(tabs)');
                            } catch (error) {
                                console.error("Delete failed", error);
                                showToast("Failed to delete item", "error");
                            }
                        }
                    }
                ]
            );
        });
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <ActivityIndicator size="large" color="#047857" />
            </SafeAreaView>
        );
    }

    if (!item) {
        return (
            <SafeAreaView className="flex-1 bg-white justify-center items-center">
                <Text>Item not found</Text>
            </SafeAreaView>
        );
    }

    const imageSource = item.image ? { uri: item.image } : null;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header Image Area */}
                <View className="relative h-72 bg-gray-200 w-full">
                    {/* Back Button Overlay */}
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="absolute top-4 left-6 z-10 p-2 bg-white/80 rounded-full shadow-sm"
                    >
                        <ArrowLeft size={24} color="black" />
                    </TouchableOpacity>

                    {/* Edit Button - Navigates to Edit Item Details */}
                    <TouchableOpacity
                        onPress={() => router.push({
                            pathname: `/item/edit`,
                            params: { id: item.id }
                        })}
                        className="absolute top-4 right-6 z-10 p-2 bg-white/80 rounded-full shadow-sm"
                    >
                        <Edit2 size={24} color="#047857" />
                    </TouchableOpacity>

                    {/* Image or Placeholder */}
                    {imageSource ? (
                        <Image source={imageSource} className="w-full h-full" resizeMode="cover" />
                    ) : (
                        <View className="flex-1 items-center justify-center">
                            <Text className="text-6xl">📦</Text>
                            <Text className="text-gray-500 mt-2">No Image Available</Text>
                        </View>
                    )}
                </View>

                {/* Content Container */}
                <View className="flex-1 bg-white -mt-6 rounded-t-3xl px-6 pt-8 pb-10 shadow-lg">
                    <View className="mb-6">
                        <View className="flex-row justify-between items-start">
                            <View className="flex-1 mr-2">
                                <Text className="text-3xl font-bold text-gray-900">{item.name}</Text>
                                <View className="flex-row items-center mt-2">
                                    <Tag size={14} color="#6b7280" />
                                    <Text className="text-gray-500 ml-1">{item.category_name} Category</Text>
                                </View>
                            </View>
                            <View className="bg-green-100 px-3 py-1 rounded-full">
                                <Text className="text-[#047857] font-bold">Active</Text>
                            </View>
                        </View>
                    </View>

                    {/* Unit Selector */}
                    {units.length > 0 && (
                        <View className="mb-6">
                            <Text className="text-gray-900 font-bold mb-3">Select Unit</Text>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {units.map((u) => (
                                    <TouchableOpacity
                                        key={u}
                                        onPress={() => setSelectedUnit(u)}
                                        className={`mr-3 px-5 py-2 rounded-full border ${selectedUnit === u
                                            ? 'bg-[#047857] border-[#047857]'
                                            : 'bg-white border-gray-200'
                                            }`}
                                    >
                                        <Text className={selectedUnit === u ? 'text-white font-medium' : 'text-gray-600'}>
                                            {u}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Stats Grid */}
                    <Text className="text-lg font-bold text-gray-900 mb-4">Performance {selectedUnit ? `(${selectedUnit})` : ''}</Text>

                    {selectedUnit ? (
                        <View className="flex-row flex-wrap justify-between mb-6">
                            <View className="w-[48%] bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                                <Text className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Lowest Ever</Text>
                                <Text className="text-2xl font-bold text-[#047857]">{formatCurrency(stats.min)}</Text>
                            </View>
                            <View className="w-[48%] bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                                <Text className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">Highest Ever</Text>
                                <Text className="text-2xl font-bold text-red-600">{formatCurrency(stats.max)}</Text>
                            </View>
                            <View className="w-[100%] bg-blue-50 p-4 rounded-2xl mb-4 border border-blue-100 flex-row justify-between items-center">
                                <View>
                                    <Text className="text-blue-500 text-xs uppercase font-bold tracking-wider mb-1">Average Cost</Text>
                                    <Text className="text-2xl font-bold text-blue-900">{formatCurrency(stats.avg)}</Text>
                                </View>
                                <View className="bg-blue-100 p-2 rounded-full">
                                    <TrendingUp size={24} color="#1e3a8a" />
                                </View>
                            </View>
                        </View>
                    ) : (
                        <View className="bg-gray-50 p-4 rounded-2xl mb-6 items-center">
                            <Text className="text-gray-400">No price history available yet.</Text>
                        </View>
                    )}

                    {/* Static Info / Placeholder */}
                    <View className="bg-gray-50 p-4 rounded-2xl mb-8 flex-row items-center">
                        <Clock size={20} color="#6b7280" />
                        <View className="ml-3">
                            <Text className="text-gray-900 font-medium">Tracking Status</Text>
                            <Text className="text-gray-500 text-sm">Real-time price monitoring active</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View className="gap-4">
                        <TouchableOpacity
                            onPress={() => router.push({
                                pathname: '/item/add_price',
                                params: {
                                    itemId: item.id,
                                    itemName: item.name,
                                    categoryName: item.category_name
                                }
                            })}
                            className="bg-[#047857] w-full py-4 rounded-full items-center shadow-lg shadow-green-200 gap-2 flex-row justify-center"
                        >
                            <TrendingUp size={20} color="white" />
                            <Text className="text-white font-bold text-lg">Update Price</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push({ pathname: `/item/${id}/history`, params: { unit: selectedUnit } })}
                            className="bg-white border-2 border-[#047857] w-full py-4 rounded-full items-center gap-2 flex-row justify-center"
                        >
                            <Calendar size={20} color="#047857" />
                            <Text className="text-[#047857] font-bold text-lg">History Trends</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={handleDelete}
                            className="w-full bg-red-50 py-4 rounded-full items-center border border-red-100"
                        >
                            <Text className="text-red-500 font-bold text-lg">Delete Item</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
