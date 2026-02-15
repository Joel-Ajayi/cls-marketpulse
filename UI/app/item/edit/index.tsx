import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../api/client';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Category, Item } from '../../../types';
import ItemImagePicker from '../../../components/item/ImagePicker';
import CategorySelector from '../../../components/item/CategorySelector';

export default function EditItem() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState('');
    const [category, setCategory] = useState<Category | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    // Read-only fields
    const [currentPrice, setCurrentPrice] = useState<string>('');
    const [currentUnit, setCurrentUnit] = useState<string>('');

    // UI State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [itemRes, catsRes] = await Promise.all([
                api.get<Item>(`/items/${id}`),
                api.get<Category[]>('/categories')
            ]);

            const item = itemRes.data;
            setName(item.name);
            setImage(item.image || null);
            setOriginalImage(item.image || null);

            // Format price: divide by 100 if it exists
            if (item.current_price !== undefined && item.current_price !== null) {
                setCurrentPrice((item.current_price / 100).toString());
            }
            if (item.unit) {
                setCurrentUnit(item.unit);
            }

            setCategories(catsRes.data);

            const cat = catsRes.data.find(c => c.name === item.category_name) || null;
            setCategory(cat);

        } catch (error) {
            console.error(error);
            showToast('Failed to load item data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCategoryCreated = (newCat: Category) => {
        setCategories([...categories, newCat]);
    };

    const handleSubmit = async () => {
        if (!user) return;
        setSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (category) formData.append('category_id', category.id);

            if (image && image !== originalImage) {
                const filename = image.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                // @ts-ignore
                formData.append('image', { uri: image, name: filename, type });
            }

            await api.put(`/items/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            showToast('Item updated successfully', 'success');
            router.back();
        } catch (error: any) {
            console.error(error);
            showToast('Failed to update item', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
                <ActivityIndicator size="large" color="#047857" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Edit Item</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-gray-500">Cancel</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="p-6">
                    <ItemImagePicker
                        image={image}
                        onImageSelected={setImage}
                    />

                    <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Item Name</Text>
                    <TextInput
                        className="input bg-gray-50 dark:bg-slate-800 dark:text-white p-4 rounded-xl mb-4 text-lg"
                        value={name}
                        onChangeText={setName}
                        placeholder="Item Name"
                        placeholderTextColor="#9CA3AF"
                    />

                    <CategorySelector
                        categories={categories}
                        selectedCategory={category}
                        onSelect={setCategory}
                        onCategoryCreated={handleCategoryCreated}
                    />

                    {/* Read-Only Fields */}
                    <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Unit</Text>
                    <TextInput
                        className="input bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 p-4 rounded-xl mb-4 text-base"
                        value={currentUnit || 'N/A'}
                        editable={false}
                    />

                    <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Current Price (₦)</Text>
                    <TextInput
                        className="input bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 p-4 rounded-xl mb-6 text-base"
                        value={currentPrice}
                        editable={false}
                        placeholder="N/A"
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        className={`bg-[#047857] py-4 rounded-xl items-center shadow-lg ${submitting ? 'opacity-70' : ''}`}
                    >
                        {submitting ? <ActivityIndicator color="white" /> : (
                            <Text className="text-white font-bold text-lg">Save Changes</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

