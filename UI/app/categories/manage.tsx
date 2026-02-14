import { View, Text, TouchableOpacity, FlatList, TextInput, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Edit2, Trash2, X, Check } from 'lucide-react-native';
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

    const handleDelete = (id: string) => {
        Alert.alert(
            "Delete Category",
            "Are you sure? Items in this category might be affected.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: 'destructive',
                    onPress: () => setCategories(prev => prev.filter(c => c.id !== id))
                }
            ]
        );
    };

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
        <SafeAreaView className="flex-1 bg-white">
            {/* Header */}
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-gray-100 rounded-full">
                        <ArrowLeft size={20} color="#047857" />
                    </TouchableOpacity>
                    <Text className="text-xl font-bold text-gray-900">Manage Categories</Text>
                </View>
                <TouchableOpacity onPress={handleAdd} className="bg-[#047857] p-2 rounded-full">
                    <Plus size={20} color="white" />
                </TouchableOpacity>
            </View>

            {/* Search */}
            <View className="px-6 py-4 bg-gray-50 border-b border-gray-100">
                <TextInput
                    className="bg-white border border-gray-200 rounded-xl px-4 py-3 text-base"
                    placeholder="Search categories..."
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
                    <View className="flex-row items-center justify-between bg-white bg-gray-50 p-4 rounded-xl mb-3 border border-gray-100">
                        <View>
                            <Text className="text-lg font-bold text-gray-900">{item.name}</Text>
                            <Text className="text-sm text-gray-500">{item.itemsCount} items</Text>
                        </View>
                        <View className="flex-row gap-3">
                            <TouchableOpacity onPress={() => handleEdit(item)} className="p-2 bg-green-50 rounded-lg">
                                <Edit2 size={18} color="#047857" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDelete(item.id)} className="p-2 bg-red-50 rounded-lg">
                                <Trash2 size={18} color="#dc2626" />
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
                    <View className="bg-white rounded-t-3xl p-6 pb-10">
                        <View className="flex-row justify-between items-center mb-6">
                            <Text className="text-xl font-bold text-gray-900">
                                {editingCategory ? 'Edit Category' : 'New Category'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <X size={24} color="#9ca3af" />
                            </TouchableOpacity>
                        </View>

                        <Text className="text-gray-500 mb-2 font-medium">Category Name</Text>
                        <TextInput
                            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-lg mb-6"
                            placeholder="e.g. Fruits"
                            value={categoryName}
                            onChangeText={setCategoryName}
                            autoFocus
                        />

                        <TouchableOpacity
                            onPress={handleSave}
                            className="bg-[#047857] w-full py-4 rounded-xl items-center flex-row justify-center"
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
