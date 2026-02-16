import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Unit, Item } from '../../types';
import UnitSelector from '../../components/item/UnitSelector';
import ItemImagePicker from '../../components/item/ImagePicker';

// Define locally to ensure compatibility
interface PriceHistoryItem {
    date: string;
    unit: string;
    price: number;
}

export default function AddPrice() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const { user } = useAuth();
    const { showToast } = useToast();

    // Required Params: itemId
    const itemId = params.itemId as string;

    // State for Item Details (fetched from API)
    const [fetchedItem, setFetchedItem] = useState<Item | null>(null);
    const [priceHistory, setPriceHistory] = useState<PriceHistoryItem[]>([]);

    const [unit, setUnit] = useState<Unit | null>(null);
    const [price, setPrice] = useState('');
    const [units, setUnits] = useState<Unit[]>([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, [itemId]);

    useEffect(() => {
        if (unit && priceHistory.length > 0) {
            // Find most recent price for this unit
            // History is ordered by date ASC (latest at end) based on API check earlier
            // Actually API code said: .order(price_entries::created_at.desc()) OR .asc()? 
            // Wait, I saw .order(price_entries::created_at.asc()) in get_history handler.
            // So last item is latest.

            // let's reverse to find first match from newest
            const historyReversed = [...priceHistory].reverse();
            const lastEntry = historyReversed.find(h => h.unit === unit.name);

            if (lastEntry) {
                const value = lastEntry.price.toString();
                setPrice(value);
            } else {
                setPrice('');
            }
        }
    }, [unit, priceHistory]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [itemRes, unitsRes, historyRes] = await Promise.all([
                api.get<Item>(`/items/${itemId}`),
                api.get<Unit[]>('/units'),
                api.get<PriceHistoryItem[]>(`/prices/history/${itemId}`)
            ]);

            setFetchedItem(itemRes.data);
            setUnits(unitsRes.data);
            setPriceHistory(historyRes.data);

            // Auto-select unit if item has one
            if (itemRes.data.unit) {
                const matchingUnit = unitsRes.data.find(u => u.name === itemRes.data.unit);
                if (matchingUnit) {
                    setUnit(matchingUnit);
                }
            }

        } catch (error) {
            console.error(error);
            showToast('Failed to load item data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUnitCreated = (newUnit: Unit) => {
        setUnits([...units, newUnit]);
    };

    const handleSubmit = async () => {
        if (!user || !unit || !price) {
            showToast('Please fill all fields', 'error');
            return;
        }

        setSubmitting(true);
        try {
            await api.post('/prices', {
                item_id: itemId,
                unit_id: unit.id,
                price: parseFloat(price),
            });
            showToast('Price updated successfully', 'success');
            router.dismissAll();
            router.replace('/(tabs)');
        } catch (error: any) {
            console.error(error);
            showToast('Failed to add price', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading || !fetchedItem) {
        return (
            <SafeAreaView className="flex-1 bg-white dark:bg-slate-900 justify-center items-center">
                <ActivityIndicator size="large" color="#047857" />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">Add Price</Text>
                <TouchableOpacity onPress={() => router.back()}>
                    <Text className="text-gray-500">Cancel</Text>
                </TouchableOpacity>
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                <ScrollView className="p-6">
                    <ItemImagePicker
                        image={fetchedItem.image || null}
                        onImageSelected={() => { }}
                        disabled={true}
                    />

                    {/* Item Info Card - Computed/Disabled Fields */}
                    <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Item Name</Text>
                    <TextInput
                        className="input bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 p-4 rounded-xl mb-4 text-base"
                        value={fetchedItem.name}
                        editable={false}
                    />

                    <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Category</Text>
                    <TextInput
                        className="input bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400 p-4 rounded-xl mb-6 text-base"
                        value={fetchedItem.category_name}
                        editable={false}
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
                        autoFocus
                    />

                    <TouchableOpacity
                        onPress={handleSubmit}
                        disabled={submitting}
                        className={`bg-[#047857] py-4 rounded-xl items-center shadow-lg ${submitting ? 'opacity-70' : ''}`}
                    >
                        {submitting ? <ActivityIndicator color="white" /> : (
                            <Text className="text-white font-bold text-lg">Save Price</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

