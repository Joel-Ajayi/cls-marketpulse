import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Category, Unit } from '../../types';
import ItemImagePicker from '../../components/item/ImagePicker';
import CategorySelector from '../../components/item/CategorySelector';
import UnitSelector from '../../components/item/UnitSelector';

export default function CreateItem() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const { showToast } = useToast();

    const [name, setName] = useState(params.name as string || '');
    const [category, setCategory] = useState<Category | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);

    // New Fields
    const [unit, setUnit] = useState<Unit | null>(null);
    const [price, setPrice] = useState('');
    const [units, setUnits] = useState<Unit[]>([]);

    // UI state
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [catRes, unitRes] = await Promise.all([
                api.get<Category[]>('/categories'),
                api.get<Unit[]>('/units')
            ]);
            setCategories(catRes.data);
            setUnits(unitRes.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCategoryCreated = (newCat: Category) => {
        setCategories([...categories, newCat]);
    };

    const handleUnitCreated = (newUnit: Unit) => {
        setUnits([...units, newUnit]);
    };

    const handleSubmit = async () => {
        if (!user) return;
        if (!name || !category || !image || !unit || !price) {
            showToast('Please fill all fields', 'error');
            return;
        }

        setSubmitting(true);
        try {
            // 1. Create Item
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category_id', category.id);
            formData.append('user_id', user.id);

            const filename = image.split('/').pop() || 'image.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image`;

            // @ts-ignore
            formData.append('image', { uri: image, name: filename, type });

            const itemRes = await api.post<string>('/items', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const newItemId = itemRes.data;

            // 2. Add Initial Price
            await api.post('/prices', {
                item_id: newItemId,
                unit_id: unit.id,
                price: parseFloat(price),
            });

            showToast('Item created successfully', 'success');
            router.dismissAll();
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error(error);
            showToast('Failed to create item', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Create New Item</Text>
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
                        placeholder="e.g. Rice (Foreign)"
                        placeholderTextColor="#9CA3AF"
                    />

                    <CategorySelector
                        categories={categories}
                        selectedCategory={category}
                        onSelect={setCategory}
                        onCategoryCreated={handleCategoryCreated}
                    />

                    <UnitSelector
                        units={units}
                        selectedUnit={unit}
                        onSelect={setUnit}
                        onUnitCreated={handleUnitCreated}
                    />

                    <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Price (₦)</Text>
                    <TextInput
                        className="input bg-gray-50 dark:bg-slate-800 p-4 rounded-xl mb-6 text-2xl font-bold text-[#047857] dark:text-green-400"
                        value={price}
                        onChangeText={setPrice}
                        keyboardType="numeric"
                        placeholder="0"
                        placeholderTextColor="#9CA3AF"
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        className={`bg-[#047857] py-4 rounded-xl items-center shadow-lg ${submitting ? 'opacity-70' : ''}`}
                    >
                        {submitting ? <ActivityIndicator color="white" /> : (
                            <Text className="text-white font-bold text-lg">Create Item</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


