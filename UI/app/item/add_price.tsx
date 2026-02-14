import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Modal, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Search, Camera, Plus } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddPrice() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const isEditMode = params.mode === 'edit';

    const [step, setStep] = useState<'search' | 'form'>('search');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedItem, setSelectedItem] = useState<any>(null);

    // New Item Form State
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [unit, setUnit] = useState('Kg');
    const [price, setPrice] = useState('');

    // Dynamic Lists (In a real app, these would come from a context or DB)
    const [availableUnits, setAvailableUnits] = useState(['Kg', 'Liter', 'Basket', 'Bag', 'Tuber', 'Unit', 'Paint Bucket', 'Crate']);
    const [availableCategories, setAvailableCategories] = useState(['Grains', 'Vegetables', 'Proteins', 'Tubers', 'Oils', 'Spices']);

    // Modal States
    const [isUnitModalVisible, setUnitModalVisible] = useState(false);
    const [isCategoryModalVisible, setCategoryModalVisible] = useState(false);
    const [newItemName, setNewItemName] = useState(''); // reused for both modals

    useEffect(() => {
        if (isEditMode) {
            setStep('form');
            if (params.existingName) setName(params.existingName as string);
            if (params.existingCategory) setCategory(params.existingCategory as string);
        }
    }, [isEditMode, params]);

    const DUMMY_RESULTS = [
        { id: '1', name: 'Rice (Foreign)', category: 'Grains' },
        { id: '2', name: 'Rice (Local)', category: 'Grains' },
    ];

    const handleItemSelect = (item: any) => {
        setSelectedItem(item);
        setName(item.name);
        setCategory(item.category);
        setStep('form');
    };

    const handleCreateNew = () => {
        setSelectedItem(null);
        setName(searchQuery); // Pre-fill with what user typed
        setStep('form');
    };

    const handleAddUnit = () => {
        if (newItemName.trim()) {
            setAvailableUnits([...availableUnits, newItemName.trim()]);
            setUnit(newItemName.trim());
            setNewItemName('');
            setUnitModalVisible(false);
        }
    };

    const handleAddCategory = () => {
        if (newItemName.trim()) {
            setAvailableCategories([...availableCategories, newItemName.trim()]);
            setCategory(newItemName.trim());
            setNewItemName('');
            setCategoryModalVisible(false);
        }
    };

    const handleSubmit = () => {
        // TODO: Convert price to Kobo and submit
        console.log('Submitting:', {
            name,
            category,
            unit,
            priceKobo: parseInt(price) * 100,
            isNewItem: !selectedItem
        });

        router.push('/(tabs)');
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex-row items-center justify-between">
                <Text className="text-2xl font-bold text-gray-900 dark:text-white">{isEditMode ? 'Edit Item' : 'Add Price'}</Text>
            </View>

            {step === 'search' ? (
                <View className="p-6">
                    <View className="flex-row items-center bg-gray-100 dark:bg-slate-800 rounded-xl px-4 py-3 mb-6">
                        <Search size={20} color="#9CA3AF" />
                        <TextInput
                            autoFocus
                            className="flex-1 ml-2 text-base text-gray-900 dark:text-white"
                            placeholder="Search for item..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>

                    {searchQuery.length > 0 && (
                        <View>
                            {DUMMY_RESULTS.map(item => (
                                <TouchableOpacity
                                    key={item.id}
                                    onPress={() => handleItemSelect(item)}
                                    className="p-4 border-b border-gray-50 dark:border-slate-800 flex-row justify-between items-center"
                                >
                                    <Text className="text-lg text-gray-800 dark:text-gray-100">{item.name}</Text>
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">{item.category}</Text>
                                </TouchableOpacity>
                            ))}

                            <TouchableOpacity
                                onPress={handleCreateNew}
                                className="mt-4 flex-row items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-xl"
                            >
                                <Plus size={20} color="#047857" />
                                <Text className="ml-2 text-[#047857] dark:text-green-400 font-medium">Create "{searchQuery}"</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            ) : (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
                    <ScrollView className="p-6">
                        {/* Image Picker Stub */}
                        <TouchableOpacity className="w-full h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl items-center justify-center mb-6 border-2 border-dashed border-gray-300 dark:border-slate-700">
                            <Camera size={40} color="#9CA3AF" />
                            <Text className="text-gray-400 mt-2">Take Photo / Upload</Text>
                        </TouchableOpacity>

                        <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Item Name</Text>
                        <TextInput
                            className="input bg-gray-50 dark:bg-slate-800 dark:text-white p-4 rounded-xl mb-4 text-lg"
                            value={name}
                            onChangeText={setName}
                            editable={!selectedItem} // Lock name if selecting existing
                            placeholderTextColor="#9CA3AF"
                        />

                        <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Category</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                            <TouchableOpacity
                                onPress={() => {
                                    setNewItemName('');
                                    setCategoryModalVisible(true);
                                }}
                                className="px-4 py-2 mr-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex-row items-center"
                            >
                                <Plus size={14} color="#047857" className="mr-1" />
                                <Text className="text-[#047857] dark:text-green-400 font-medium">New</Text>
                            </TouchableOpacity>
                            {availableCategories.map((c) => (
                                <TouchableOpacity
                                    key={c}
                                    onPress={() => !selectedItem && setCategory(c)} // Lock if existing
                                    disabled={!!selectedItem}
                                    className={`mr-2 px-4 py-2 rounded-full border ${category === c
                                        ? 'bg-[#047857] border-[#047857]'
                                        : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                                        }`}
                                >
                                    <Text className={category === c ? 'text-white font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                        {c}
                                    </Text>
                                </TouchableOpacity>
                            ))}

                        </ScrollView>

                        {!isEditMode && (
                            <>
                                <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Unit of Measure</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                    <TouchableOpacity
                                        onPress={() => {
                                            setNewItemName('');
                                            setUnitModalVisible(true);
                                        }}
                                        className="px-4 py-2 mr-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex-row items-center"
                                    >
                                        <Plus size={14} color="#047857" className="mr-1" />
                                        <Text className="text-[#047857] dark:text-green-400 font-medium">New</Text>
                                    </TouchableOpacity>
                                    {availableUnits.map((u) => (
                                        <TouchableOpacity
                                            key={u}
                                            onPress={() => setUnit(u)}
                                            className={`mr-2 px-4 py-2 rounded-full border ${unit === u
                                                ? 'bg-[#047857] border-[#047857]'
                                                : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                                                }`}
                                        >
                                            <Text className={unit === u ? 'text-white font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                                {u}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </ScrollView>

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
                            </>
                        )}

                        <TouchableOpacity
                            onPress={handleSubmit}
                            className="bg-[#047857] py-4 rounded-xl items-center shadow-lg dark:shadow-none"
                        >
                            <Text className="text-white font-bold text-lg">{isEditMode ? 'Update Item' : 'Save Price'}</Text>
                        </TouchableOpacity>

                        {isEditMode && (
                            <TouchableOpacity
                                onPress={() => {
                                    Alert.alert(
                                        "Delete Item",
                                        "Are you sure you want to delete this item? This action cannot be undone.",
                                        [
                                            { text: "Cancel", style: "cancel" },
                                            {
                                                text: "Delete",
                                                style: 'destructive',
                                                onPress: () => {
                                                    console.log('Deleting item');
                                                    router.push('/(tabs)');
                                                }
                                            }
                                        ]
                                    );
                                }}
                                className="mt-4 py-4 rounded-xl items-center bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30"
                            >
                                <Text className="text-red-600 dark:text-red-400 font-bold text-lg">Delete Item</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            onPress={() => setStep('search')}
                            className="mt-4 py-3 items-center"
                        >
                            <Text className="text-gray-500 dark:text-gray-400">Cancel</Text>
                        </TouchableOpacity>
                    </ScrollView>
                </KeyboardAvoidingView>
            )}

            {/* Create Unit Modal */}
            <Modal
                visible={isUnitModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setUnitModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Unit</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-base mb-4"
                            placeholder="e.g. Sacks, Bundles"
                            placeholderTextColor="#9CA3AF"
                            value={newItemName}
                            onChangeText={setNewItemName}
                            autoFocus
                        />
                        <View className="flex-row justify-end space-x-4">
                            <TouchableOpacity onPress={() => setUnitModalVisible(false)} className="px-4 py-2">
                                <Text className="text-gray-500 dark:text-gray-400 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddUnit} className="bg-[#047857] px-6 py-2 rounded-lg">
                                <Text className="text-white font-bold">Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Create Category Modal */}
            <Modal
                visible={isCategoryModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setCategoryModalVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-black/50 justify-center px-6">
                    <View className="bg-white dark:bg-slate-800 p-6 rounded-2xl">
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Category</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-base mb-4"
                            placeholder="e.g. Fruits, Beverages"
                            placeholderTextColor="#9CA3AF"
                            value={newItemName}
                            onChangeText={setNewItemName}
                            autoFocus
                        />
                        <View className="flex-row justify-end space-x-4">
                            <TouchableOpacity onPress={() => setCategoryModalVisible(false)} className="px-4 py-2">
                                <Text className="text-gray-500 dark:text-gray-400 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handleAddCategory} className="bg-[#047857] px-6 py-2 rounded-lg">
                                <Text className="text-white font-bold">Create</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}
