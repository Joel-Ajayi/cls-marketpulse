import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useState } from 'react';
import { Unit } from '../../types';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

interface UnitSelectorProps {
    units: Unit[];
    selectedUnit: Unit | null;
    onSelect: (unit: Unit) => void;
    onUnitCreated: (unit: Unit) => void;
}

export default function UnitSelector({ units, selectedUnit, onSelect, onUnitCreated }: UnitSelectorProps) {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [isModalVisible, setModalVisible] = useState(false);
    const [newUnitName, setNewUnitName] = useState('');

    const handleCreateUnit = async () => {
        if (!newUnitName.trim() || !user) return;
        try {
            const res = await api.post<Unit>('/units', { name: newUnitName.trim(), user_id: user.id });
            onUnitCreated(res.data);
            onSelect(res.data);
            setNewUnitName('');
            setModalVisible(false);
            showToast('Unit created', 'success');
        } catch (error) {
            showToast('Failed to create unit', 'error');
        }
    };

    return (
        <View className="mb-6">
            <Text className="label mb-2 font-medium text-gray-700 dark:text-gray-300">Unit of Measure</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    className="px-4 py-2 mr-2 rounded-full border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex-row items-center"
                >
                    <Plus size={14} color="#047857" className="mr-1" />
                    <Text className="text-[#047857] dark:text-green-400 font-medium">New</Text>
                </TouchableOpacity>
                {units.map((u) => (
                    <TouchableOpacity
                        key={u.id}
                        onPress={() => onSelect(u)}
                        className={`mr-2 px-4 py-2 rounded-full border ${selectedUnit?.id === u.id
                            ? 'bg-[#047857] border-[#047857]'
                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                            }`}
                    >
                        <Text className={selectedUnit?.id === u.id ? 'text-white font-medium' : 'text-gray-600 dark:text-gray-300'}>
                            {u.name}
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
                        <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create New Unit</Text>
                        <TextInput
                            className="bg-gray-50 dark:bg-slate-700 dark:text-white border border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 text-base mb-4"
                            placeholder="Name..."
                            placeholderTextColor="#9CA3AF"
                            value={newUnitName}
                            onChangeText={setNewUnitName}
                            autoFocus
                        />
                        <View className="flex-row justify-end space-x-4">
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="px-4 py-2">
                                <Text className="text-gray-500 dark:text-gray-400 font-medium">Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleCreateUnit}
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
