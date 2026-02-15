import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit2, X, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Category, Item } from '../../types';

export default function ManageCategories() {
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [categories, setCategories] = useState<Category[]>([]);
    const [items, setItems] = useState<Item[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // Modal State
    const [isModalVisible, setModalVisible] = useState(false);
    const [categoryName, setCategoryName] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [catRes, itemsRes] = await Promise.all([
                api.get<Category[]>('/categories'),
                api.get<Item[]>('/items')
            ]);
            setCategories(catRes.data);
            setItems(itemsRes.data);
        } catch (error) {
            console.error(error);
            showToast('Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getItemsCount = (catName: string) => {
        return items.filter(i => i.category_name === catName).length;
    };

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        setCategoryName('');
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (categoryName.trim().length === 0 || !user) return;
        setSubmitting(true);
        try {
            const res = await api.post<Category>('/categories', { name: categoryName.trim(), user_id: user.id });
            setCategories([...categories, res.data]);
            setModalVisible(false);
            showToast('Category created', 'success');
        } catch (error) {
            showToast('Failed to create category', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center justify-between border-b border-gray-100 dark:border-slate-800 bg-[#047857] pt-12 pb-6 mt-[-40px]">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-white/20 rounded-full">
                        <ArrowLeft size={20} color="white" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-white">Manage Categories</Text>
                </View>
                <TouchableOpacity onPress={handleAdd} className="bg-white p-2 rounded-full shadow-sm">
                    <Plus size={20} color="#047857" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-6 py-4 bg-gray-50 dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800">
                <TextInput
                    className="bg-white dark:bg-slate-800 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-3 text-base"
                    placeholder="Search categories..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            {/* List */}
            {loading ? (
                <View className="p-10"><ActivityIndicator color="#047857" /></View>
            ) : (
                <FlatList
                    data={filteredCategories}
                    keyExtractor={item => item.id}
                    contentContainerStyle={{ padding: 24 }}
                    renderItem={({ item }) => (
                        <View className="flex-row items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl mb-3 border border-gray-100 dark:border-slate-700 shadow-sm dark:shadow-none">
                            <View>
                                <Text className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</Text>
                                <Text className="text-sm text-gray-500 dark:text-gray-400">{getItemsCount(item.name)} items</Text>
                            </View>
                            {/* Edit not implemented in backend yet */}
                            {/* <View className="flex-row gap-3">
                                <TouchableOpacity onPress={() => handleEdit(item)} className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                    <Edit2 size={18} color="#047857" />
                                </TouchableOpacity>
                            </View> */}
                        </View>
                    )}
                />
            )}

            {/* Add Modal */}
            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                    className="flex-1 justify-end bg-black/50"
                >
                    <View className="bg-white dark:bg-slate-800 rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">New Category</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 dark:text-gray-400 mb-2 font-medium">Category Name</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-4 text-lg mb-6"
                            placeholder="e.g. Fruits"
                            placeholderTextColor="#9CA3AF"
                            value={categoryName}
                            onChangeText={setCategoryName}
                            autoFocus
                        />

                        <TouchableOpacity
                            onPress={handleSave}
                            disabled={submitting}
                            className="bg-[#047857] w-full py-4 rounded-xl items-center flex-row justify-center shadow-lg dark:shadow-none"
                        >
                            {submitting ? <ActivityIndicator color="white" /> : (
                                <>
                                    <Check size={20} color="white" className="mr-2" />
                                    <Text className="text-white font-bold text-lg">Save Category</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
