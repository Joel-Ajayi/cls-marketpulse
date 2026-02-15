import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Category } from '../../types';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface CategorySelectorProps {
    categories: Category[];
    selectedCategory: Category | null;
    onSelect: (category: Category) => void;
    onCategoryCreated: (category: Category) => void;
}

export default function CategorySelector({ categories, selectedCategory, onSelect, onCategoryCreated }: CategorySelectorProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isModalVisible, setModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim() || !user) return;
        try {
            const res = await api.post<Category>('/categories', { name: newCategoryName.trim(), user_id: user.id });
            onCategoryCreated(res.data);
            onSelect(res.data);
            setNewCategoryName('');
            setModalVisible(false);
            showToast('Category created', 'success');
        } catch (error) {
            showToast('Failed to create category', 'error');
        }
    };

    return (
        <View className="mb-8">
            <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="px-4 py-2 mr-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex-row items-center"
                >
                    <Plus size={14} color="#047857" className="mr-1" />
                    <Text className="text-[#047857] dark:text-green-400 font-medium">New</Text>
                </TouchableOpacity>
                {categories.map((c) => (
                    <TouchableOpacity
                        key={c.id}
                        onPress={() => onSelect(c)}
                        className={`mr-2 px-4 py-2 rounded-full border ${selectedCategory?.id === c.id
                            ? 'bg-[#047857] border-[#047857]'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                            }`}
                    >
                        <Text className={selectedCategory?.id === c.id ? 'text-white font-medium' : 'text-gray-600 dark:text-gray-300'}>
                            {c.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <Modal
                visible={isModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Category</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-base mb-4"
                            placeholder="Name..."
                            placeholderTextColor="#9CA3AF"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            autoFocus
                        />
                        <View className="flex-row justify-end space-x-4">
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2">
                                <Text className="text-gray-500 dark:text-gray-400 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreateCategory}
                                className="bg-[#047857] px-6 py-2 rounded-lg"
                            >
                                <Text className="text-white font-bold">Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </View>
    );
}
