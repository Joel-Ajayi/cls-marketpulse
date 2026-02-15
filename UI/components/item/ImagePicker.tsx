import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Camera } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface ImagePickerProps {
    image: string | null;
    onImageSelected: (uri: string) => void;
    disabled?: boolean;
}

export default function ItemImagePicker({ image, onImageSelected, disabled = false }: ImagePickerProps) {
    const pickImage = async () => {
        if (disabled) return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            onImageSelected(result.assets[0].uri);
        }
    };

    return (
        <TouchableOpacity
            onPress={pickImage}
            activeOpacity={disabled ? 1 : 0.7}
            className={`w-full h-48 bg-gray-100 dark:bg-slate-800 rounded-2xl items-center justify-center mb-6 border-2 border-dashed ${disabled ? 'border-transparent' : 'border-gray-300 dark:border-slate-700'} overflow-hidden`}
        >
            {image ? (
                <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
                <>
                    <Camera size={40} color={disabled ? "#D1D5DB" : "#9CA3AF"} />
                    <Text className="text-gray-400 mt-2">{disabled ? 'No Image' : 'Upload Image'}</Text>
                </>
            )}
        </TouchableOpacity>
    );
}
