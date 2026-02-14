import { View, Text, TextInput, ScrollView, TouchableOpacity, FlatList, Image } from 'react-native';
import { useState } from 'react';
import { Search, TrendingUp, TrendingDown, Filter } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// Dummy Data
const CATEGORIES = [
    { id: '1', name: 'All' },
    { id: '2', name: 'Grains' },
    { id: '3', name: 'Vegetables' },
    { id: '4', name: 'Proteins' },
    { id: '5', name: 'Tubers' },
];

const ITEMS = [
    { id: '1', name: 'Rice (Foreign)', price: 8500000, oldPrice: 8200000, category: 'Grains', image: null }, // stored in Kobo
    { id: '2', name: 'Tomatoes (Basket)', price: 4500000, oldPrice: 6000000, category: 'Vegetables', image: null },
    { id: '3', name: 'Chicken (Kilo)', price: 450000, oldPrice: 450000, category: 'Proteins', image: null },
    { id: '4', name: 'Yam (Tuber)', price: 250000, oldPrice: 200000, category: 'Tubers', image: null },
];

export default function Dashboard() {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const formatCurrency = (kobo: number) => {
        return `₦${(kobo / 100).toLocaleString()}`;
    };

    const filteredItems = ITEMS.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="px-6 py-4 bg-white border-b border-gray-100">
                <Text className="text-sm text-gray-500 font-medium">Location: Lagos, NG</Text>
                <Text className="text-2xl font-bold text-gray-900">Market Board</Text>

                {/* Search Bar */}
                <View className="mt-4 flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 ml-2 text-base"
                        placeholder="Search items..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            {/* Categories */}
            <View className="py-4">
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={CATEGORIES}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ paddingHorizontal: 24 }}
                    ListHeaderComponent={() => (
                        <TouchableOpacity
                            onPress={() => router.push('/categories/manage')}
                            className="mr-3 px-3 py-2 rounded-full bg-gray-100 border border-gray-200 flex-row items-center"
                        >
                            <Text className="text-gray-600 font-medium text-xs">Manage</Text>
                        </TouchableOpacity>
                    )}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            onPress={() => setSelectedCategory(item.name)}
                            className={`mr-3 px-5 py-2 rounded-full border ${selectedCategory === item.name
                                ? 'bg-[#047857] border-[#047857]'
                                : 'bg-white border-gray-200'
                                }`}
                        >
                            <Text className={`font-medium ${selectedCategory === item.name ? 'text-white' : 'text-gray-700'
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
                renderItem={({ item }) => {
                    const isUp = item.price > item.oldPrice;
                    const isDown = item.price < item.oldPrice;
                    const isSame = item.price === item.oldPrice;

                    return (
                        <TouchableOpacity
                            onPress={() => router.push(`/item/${item.id}`)}
                            className="bg-white rounded-2xl mb-4 p-4 shadow-sm shadow-gray-100 flex-row items-center"
                        >
                            <View className="w-12 h-12 bg-gray-100 rounded-full items-center justify-center mr-4">
                                <Text className="text-xl">📦</Text>
                                {/* Placeholder for image */}
                            </View>

                            <View className="flex-1">
                                <Text className="font-bold text-gray-900 text-lg">{item.name}</Text>
                                <Text className="text-gray-500 text-sm">{item.category}</Text>
                            </View>

                            <View className="items-end">
                                <Text className="font-bold text-gray-900 text-lg">{formatCurrency(item.price)}</Text>
                                <View className="flex-row items-center">
                                    {isUp && <TrendingUp size={14} color="#ef4444" />}
                                    {isDown && <TrendingDown size={14} color="#047857" />}
                                    <Text className={`ml-1 text-xs font-medium ${isUp ? 'text-red-500' : isDown ? 'text-[#047857]' : 'text-gray-400'
                                        }`}>
                                        {isUp ? 'Inflation' : isDown ? 'Deflation' : 'Stable'}
                                    </Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                }}
            />
        </SafeAreaView>
    );
}
