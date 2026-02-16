
import { View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Search, TrendingUp, TrendingDown, Filter } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import api from '../../api/client';
import { Item, Category } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function Dashboard() {
    const router = useRouter();
    const { showToast } = useToast();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            // Fetch Items
            const itemsRes = await api.get<Item[]>('/items');
            setItems(itemsRes.data);

            // Extract unique categories from items (or fetch from /categories if needed)
            // Ideally fetch from /categories to get all available ones, but items list gives us what's currently used.
            // Let's fetch strict categories list for the filter to be accurate to "Manage" list.
            try {
                const catRes = await api.get<Category[]>('/categories');
                const allCat = [{ id: 'all', name: 'All' }, ...catRes.data];
                setCategories(allCat);
            } catch (e) {
                // Fallback if categories fail - extract from items?
                // For now, let's just use what we have or empty
                console.warn('Failed to fetch categories');
            }

        } catch (error) {
            console.error('Fetch error:', error);
            showToast('Failed to load market data', 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount?: number) => {
        if (amount === undefined || amount === null) return 'N/A';
        return `₦${amount.toLocaleString()}`;
    };

    const filteredItems = items.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category_name === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50 dark:bg-slate-900">
            {/* Header */}
            <View className="p-6 pt-16 pb min-h-[220px] bg-[#047857] pb-8 rounded-b-3xl mt-[-10px] shadow-lg z-10">
                <Text className="text-sm text-green-100 font-medium opacity-90">Location: Lagos, NG</Text>
                <Text className="text-3xl font-bold text-white mt-1">Market Board</Text>

                {/* Search Bar */}
                <View className="mt-6 flex-row items-center bg-white/20 border border-white/30 rounded-2xl px-4 py-3">
                    <Search size={20} color="white" />
                    <TextInput
                        className="flex-1 ml-2 text-base text-white placeholder:text-green-100"
                        placeholder="Search items..."
                        placeholderTextColor="rgba(255,255,255,0.7)"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Content */}
            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#047857" />
                </View>
            ) : (
                <>
                    {/* Categories */}
                    <View className="py-6">
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={categories}
                            keyExtractor={item => item.id}
                            contentContainerStyle={{ paddingHorizontal: 24 }}
                            ListHeaderComponent={() => (
                                <TouchableOpacity
                                    onPress={() => router.push('/categories/manage')}
                                    className="mr-3 px-3 py-2 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex-row items-center"
                                >
                                    <Text className="text-gray-600 dark:text-gray-300 font-medium text-xs">Manage</Text>
                                </TouchableOpacity>
                            )}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => setSelectedCategory(item.name)}
                                    className={`mr-3 px-5 py-2 rounded-full border ${selectedCategory === item.name
                                        ? 'bg-[#047857] border-[#047857]'
                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                                        }`}
                                >
                                    <Text className={`font-medium ${selectedCategory === item.name ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                                        }`}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>

                    {/* Items List */}
                    <FlatList
                        data={filteredItems}
                        keyExtractor={item => item.id}
                        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#047857" />
                        }
                        ListEmptyComponent={() => (
                            <View className="items-center justify-center py-10">
                                <Text className="text-gray-500">No items found</Text>
                            </View>
                        )}
                        renderItem={({ item }) => {
                            const currentPrice = item.current_price || 0;
                            const oldPrice = item.previous_price || 0;
                            const hasPrice = item.current_price !== undefined;

                            const isUp = currentPrice > oldPrice && oldPrice > 0;
                            const isDown = currentPrice < oldPrice && oldPrice > 0;

                            // Image handling (if base64)
                            const imageSource = item.image ? { uri: item.image } : null;

                            return (
                                <TouchableOpacity
                                    onPress={() => router.push(`/item/${item.id}`)}
                                    className="bg-white dark:bg-slate-800 rounded-2xl mb-4 p-4 shadow-md shadow-gray-100 dark:shadow-none border border-gray-100 dark:border-slate-700 flex-row items-center"
                                >
                                    <View className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-full items-center justify-center mr-4 overflow-hidden">
                                        {imageSource ? (
                                            <Image source={imageSource} className="w-full h-full" resizeMode="cover" />
                                        ) : (
                                            <Text className="text-xl">📦</Text>
                                        )}
                                    </View>

                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900 dark:text-white text-lg">{item.name}</Text>
                                        <Text className="text-gray-500 dark:text-gray-400 text-sm">
                                            {item.category_name} {item.unit ? `(${item.unit})` : ''}
                                        </Text>
                                    </View>

                                    <View className="items-end">
                                        <Text className="font-bold text-gray-900 dark:text-green-400 text-lg">
                                            {hasPrice ? formatCurrency(currentPrice) : 'No Price'}
                                        </Text>
                                        {hasPrice && oldPrice > 0 && (
                                            <View className="flex-row items-center">
                                                {isUp && <TrendingUp size={14} color="#ef4444" />}
                                                {isDown && <TrendingDown size={14} color="#047857" />}
                                                <Text className={`ml-1 text-xs font-medium ${isUp ? 'text-red-500' : isDown ? 'text-[#047857] dark:text-green-400' : 'text-gray-400'
                                                    }`}>
                                                    {isUp ? 'Inflation' : isDown ? 'Deflation' : 'Stable'}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </>
            )}
        </SafeAreaView>
    );
}
