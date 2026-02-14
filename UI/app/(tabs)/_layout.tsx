import { Tabs } from 'expo-router';
import { Home, User, PlusCircle } from 'lucide-react-native';
import { View } from 'react-native';

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: '#22c55e', // green-500
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

            {/* 
        This is a dummy screen to show the prominent "Add" button in the middle.
        In reality, we might want this to open a modal or navigate to a different stack.
        For now, we'll route it to the 'add-price' screen via a listener or just let it exist.
        Actually, let's make it a button that navigates to the global 'add-price' modal.
      */}
            <Tabs.Screen
                name="add_placeholder"
                options={{
                    title: '',
                    tabBarIcon: ({ color }) => (
                        <View className="bg-green-500 p-3 rounded-full -mt-4 shadow-lg shadow-green-200">
                            <PlusCircle size={30} color="white" />
                        </View>
                    ),
                    href: '/add-price', // Directs to the /add-price route
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        navigation.navigate('add-price');
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
