import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Search, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/client';
import { Item } from '../../types';
import { useToast } from '../../context/ToastContext';

export default function SearchItem() {
    const router = useRouter();
    const { showToast } = useToast();

    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        setLoading(true);
        try {
            const res = await api.get<Item[]>('/items');
            setItems(res.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load items', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Find Item</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-gray-500">Close</Text>
                </TouchableOpacity>
            </View>

            <View className="p-6">
                <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 rounded-xl px-4 py-3 mb-6">
                    <Search size={20} color="#9CA3AF" />
                    <TextInput
                        autoFocus
                        className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
                        placeholder="Search for item to add price..."
                        placeholderTextColor="#9CA3AF"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                {loading ? (
                    <ActivityIndicator color="#047857" />
                ) : (
                    <ScrollView>
                        {filteredItems.map(item => (
                            <TouchableOpacity
                                key={item.id}
                                onPress={() => router.push({
                                    pathname: '/item/add_price',
                                    params: {
                                        itemId: item.id,
                                        itemName: item.name,
                                        categoryName: item.category_name
                                    }
                                })}
                                className="p-4 border-b border-gray-50 dark:border-slate-800 flex-row justify-between items-center"
                            >
                                <Text className="text-lg text-gray-800 dark:text-gray-100">{item.name}</Text>
                                <Text className="text-sm text-gray-500 dark:text-gray-400">{item.category_name}</Text>
                            </TouchableOpacity>
                        ))}

                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => router.push({ pathname: '/item/create_new', params: { name: searchQuery } })}
                                className="mt-4 flex-row items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"
                            >
                                <Plus size={20} color="#047857" />
                                <Text className="ml-2 text-[#047857] dark:text-green-400 font-medium">Create "{searchQuery}"</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}
