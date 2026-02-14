import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit2, X, Check } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Dummy Initial Data
const INITIAL_CATEGORIES = [
    { id: '1', name: 'Grains', itemsCount: 12 },
    { id: '2', name: 'Vegetables', itemsCount: 8 },
    { id: '3', name: 'Proteins', itemsCount: 15 },
    { id: '4', name: 'Tubers', itemsCount: 5 },
    { id: '5', name: 'Oils', itemsCount: 3 },
    { id: '6', name: 'Spices', itemsCount: 7 },
];

export default function ManageCategories() {
    const router = useRouter();
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal State
    const [isModalVisible, setModalVisible] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);
    const [categoryName, setCategoryName] = useState('');

    const filteredCategories = categories.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = () => {
        setEditingCategory(null);
        setCategoryName('');
        setModalVisible(true);
    };

    const handleEdit = (category: any) => {
        setEditingCategory(category);
        setCategoryName(category.name);
        setModalVisible(true);
    };

    // Delete functionality removed as per requirements

    const handleSave = () => {
        if (categoryName.trim().length === 0) return;

        if (editingCategory) {
            // Update existing
            setCategories(prev => prev.map(c =>
                c.id === editingCategory.id ? { ...c, name: categoryName } : c
            ));
        } else {
            // Create new
            const newCategory = {
                id: Date.now().toString(),
                name: categoryName,
                itemsCount: 0
            };
            setCategories(prev => [...prev, newCategory]);
        }
        setModalVisible(false);
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            {/* Header */}
            <View className="px-6 mt-[-55px] pt-16 pb-4 flex-row items-center border-b border-gray-100 dark:border-slate-800 bg-[#047857] shadow-sm">
                <View className="flex-row items-center flex-1">
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
            <FlatList
                data={filteredCategories}
                keyExtractor={item => item.id}
                contentContainerStyle={{ padding: 24 }}
                renderItem={({ item }) => (
                    <View className="flex-row items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl mb-3 border border-gray-100 dark:border-slate-700 shadow-sm dark:shadow-none">
                        <View>
                            <Text className="text-lg font-bold text-gray-900 dark:text-white">{item.name}</Text>
                            <Text className="text-sm text-gray-500 dark:text-gray-400">{item.itemsCount} items</Text>
                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={() => handleEdit(item)} className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <Edit2 size={18} color="#047857" />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />

            {/* Add/Edit Modal */}
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
                            <Text className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </Text>
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
                            className="bg-[#047857] w-full py-4 rounded-xl items-center flex-row justify-center shadow-lg dark:shadow-none"
                        >
                            <Check size={20} color="white" className="mr-2" />
                            <Text className="text-white font-bold text-lg">Save Category</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
