import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { useState, useRef } from 'react';
import { useRouter } from 'expo-router';
import { ArrowRight, Mail, Lock } from 'lucide-react-native';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);

    // Refs for input focus management
    const inputRefs = useRef<Array<TextInput | null>>([]);

    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/request-otp', { email });
            setStep('otp');
        } catch (error: any) {
            let msg = 'Failed to send OTP';
            if (error.code === 'ECONNABORTED') {
                msg = 'Request timed out. Please check your internet connection.';
            } else if (error.response?.data) {
                msg = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
            }
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (text: string, index: number) => {
        const newOtp = [...otp];
        newOtp[index] = text.toUpperCase(); // Ensure alphanumeric is uppercase
        setOtp(newOtp);

        // Auto-focus next input
        if (text && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            // If current input is empty and we hit backspace, go to previous
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleVerify = async () => {
        const code = otp.join('');
        if (code.length !== 6) {
            Alert.alert('Error', 'Please enter the complete 6-character code');
            return;
        }
        setLoading(true);
        try {
            const response = await api.post('/auth/verify-otp', { email, code });
            const { token, user } = response.data;

            if (token && user) {
                await signIn(token, user);
                // Router replace handled by _layout protection
            } else {
                Alert.alert('Error', 'Invalid response from server');
            }
        } catch (error: any) {
            let msg = 'Verification failed';
            if (error.code === 'ECONNABORTED') {
                msg = 'Request timed out. Please check your internet connection and try again.';
            } else if (error.response?.data) {
                msg = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
            }
            Alert.alert('Error', msg);
        } finally {
            setLoading(false);
        }
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
                            editable={!loading}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleSendOtp}
                        disabled={loading}
                        className={`bg-[#047857] py-4 rounded-xl flex-row justify-center items-center shadow-sm shadow-green-200 ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-bold text-lg mr-2">Send Code</Text>
                                <ArrowRight size={20} color="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            ) : (
                <View>
                    <View className="flex-row justify-between mb-8 w-full">
                        {otp.map((digit, index) => (
                            <TextInput
                                key={index}
                                ref={(ref) => (inputRefs.current[index] = ref)}
                                className={`w-12 h-14 border-2 rounded-xl text-center text-xl font-bold bg-gray-50 text-gray-900 ${digit ? 'border-green-500 bg-green-50' : 'border-gray-200'
                                    } focus:border-green-600`}
                                value={digit}
                                onChangeText={(text) => handleOtpChange(text, index)}
                                onKeyPress={(e) => handleKeyPress(e, index)}
                                keyboardType="default" // Allow alphanumeric
                                maxLength={1}
                                autoCapitalize="characters"
                                editable={!loading}
                            />
                        ))}
                    </View>

                    <TouchableOpacity
                        onPress={handleVerify}
                        disabled={loading}
                        className={`bg-[#047857] py-4 rounded-xl flex-row justify-center items-center shadow-sm shadow-green-200 ${loading ? 'opacity-70' : ''}`}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-bold text-lg mr-2">Verify & Login</Text>
                                <ArrowRight size={20} color="white" />
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => !loading && setStep('email')} className="mt-4 items-center">
                        <Text className="text-gray-500">Change email</Text>
                    </TouchableOpacity>
                </View>
            )}
        </KeyboardAvoidingView>
    );
}
