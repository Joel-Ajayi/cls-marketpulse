import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ArrowRight, Mail, Lock } from 'lucide-react-native';

export default function Login() {
    const router = useRouter();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');

    const handleSendOtp = () => {
        // TODO: Integrate API to send OTP
        console.log('Sending OTP to:', email);
        setStep('otp');
    };

    const handleVerify = () => {
        // TODO: Integrate API to verify OTP
        console.log('Verifying OTP:', otp);
        // On success:
        // router.replace('/(tabs)');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white px-6 justify-center"
        >
            <View className="mb-10">
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                    {step === 'email' ? 'Welcome Back' : 'Verify Identity'}
                </Text>
                <Text className="text-gray-500 text-base">
                    {step === 'email'
                        ? 'Enter your email to sign in or create an account.'
                        : `Enter the code sent to ${email}`}
                </Text>
            </View>

            {step === 'email' ? (
                <View>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:border-green-500 bg-gray-50">
                        <Mail size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-gray-900"
                            placeholder="name@example.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSendOtp}
                        className="bg-green-500 py-4 rounded-xl flex-row justify-center items-center shadow-sm shadow-green-200"
                    >
                        <Text className="text-white font-bold text-lg mr-2">Send Code</Text>
                        <ArrowRight size={20} color="white" />
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 py-3 mb-6 focus:border-green-500 bg-gray-50">
                        <Lock size={20} color="#9CA3AF" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-gray-900"
                            placeholder="000000"
                            value={otp}
                            onChangeText={setOtp}
                            keyboardType="number-pad"
                            maxLength={6}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleVerify}
                        className="bg-green-500 py-4 rounded-xl flex-row justify-center items-center shadow-sm shadow-green-200"
                    >
                        <Text className="text-white font-bold text-lg mr-2">Verify & Login</Text>
                        <ArrowRight size={20} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => setStep('email')} className="mt-4 items-center">
                        <Text className="text-gray-500">Change email</Text>
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
