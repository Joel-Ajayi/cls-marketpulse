import { Tabs } from 'expo-router';
import { Home, User, PlusCircle } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#047857', // green-700
                tabBarInactiveTintColor: '#9ca3af', // gray-400
                tabBarStyle: {
                    borderTopWidth: 0,
                    elevation: 0,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: '500',
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Market',
                    tabBarIcon: ({ color }) => <Home size={24} color={color} />,
                }}
            />

            <Tabs.Screen
                name="add_placeholder"
                options={{
                    title: '',
                    tabBarIcon: ({ color }) => (
                        <View className="bg-[#047857] p-3 rounded-full -mt-[-5px] shadow-lg shadow-green-200">
                            <PlusCircle size={20} color="white" />
                        </View>
                    ),
                    href: '/item/search', // Directs to the /add-price route
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        const router = require('expo-router').router;
                        router.push('/item/search');
                    },
                })}
            />

            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Settings',
                    tabBarIcon: ({ color }) => <User size={24} color={color} />,
                }}
            />
        </Tabs>
    );
}
