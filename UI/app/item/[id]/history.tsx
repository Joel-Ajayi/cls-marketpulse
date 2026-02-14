import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { matchFont } from "@shopify/react-native-skia";
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function History() {
    const { id, unit } = useLocalSearchParams();
    const router = useRouter();
    const [selectedUnit, setSelectedUnit] = useState(typeof unit === 'string' ? unit : 'Kg');

    const UNITS = ['Kg', 'Bag', 'Basket', 'Crate'];

    const font = matchFont({
        fontFamily: "Arial",
        fontSize: 12,
    });

    const DATA_BY_UNIT: Record<string, any[]> = {
        'Kg': [
            { x: 1, label: 'Jan', price: 6500 },
            { x: 2, label: 'Feb', price: 7200 },
            { x: 3, label: 'Mar', price: 7100 },
            { x: 4, label: 'Apr', price: 8500 },
            { x: 5, label: 'May', price: 9000 },
            { x: 6, label: 'Jun', price: 8800 },
        ],
        'Bag': [
            { x: 1, label: 'Jan', price: 42000 },
            { x: 2, label: 'Feb', price: 45000 },
            { x: 3, label: 'Mar', price: 44000 },
            { x: 4, label: 'Apr', price: 48000 },
            { x: 5, label: 'May', price: 55000 },
            { x: 6, label: 'Jun', price: 53000 },
        ],
        'Basket': [
            { x: 1, label: 'Jan', price: 12000 },
            { x: 2, label: 'Feb', price: 13500 },
            { x: 3, label: 'Mar', price: 13000 },
            { x: 4, label: 'Apr', price: 15000 },
            { x: 5, label: 'May', price: 16500 },
            { x: 6, label: 'Jun', price: 16000 },
        ],
        'Crate': [
            { x: 1, label: 'Jan', price: 8000 },
            { x: 2, label: 'Feb', price: 8500 },
            { x: 3, label: 'Mar', price: 9000 },
            { x: 4, label: 'Apr', price: 9500 },
            { x: 5, label: 'May', price: 11000 },
            { x: 6, label: 'Jun', price: 10500 },
        ],
    };

    const currentData = DATA_BY_UNIT[selectedUnit] || DATA_BY_UNIT['Kg'];
    const currentPrice = currentData[currentData.length - 1].price;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-slate-800 bg-[#047857]">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-white/20 rounded-full">
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-white">Price History</Text>
                    <Text className="text-sm text-green-100 opacity-80">Rice (Foreign)</Text>
                </View>
            </View>

            <ScrollView className="flex-1">
                <View className="px-6 pb-6 pt-6">
                    <Text className="text-gray-900 dark:text-white font-bold mb-3">Unit: {selectedUnit}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                        {UNITS.map((u) => (
                            <TouchableOpacity
                                key={u}
                                onPress={() => setSelectedUnit(u)}
                                className={`mr-3 px-4 py-2 rounded-full border ${selectedUnit === u
                                    ? 'bg-[#047857] border-[#047857]'
                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'
                                    }`}
                            >
                                <Text className={selectedUnit === u ? 'text-white font-medium' : 'text-gray-600 dark:text-gray-300'}>
                                    {u}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    <Text className="text-gray-500 dark:text-gray-400 mb-2">Visual Trends</Text>
                    <Text className="text-3xl font-bold text-[#047857] dark:text-green-400">₦{currentPrice.toLocaleString()}</Text>
                    <Text className="text-red-500 text-sm font-medium">+35.4% vs Jan</Text>
                </View>

                {/* Chart */}
                <View className="h-80 w-full px-4">
                    <CartesianChart
                        data={currentData}
                        xKey="x"
                        yKeys={["price"]}
                        axisOptions={{
                            font,
                            formatXLabel: (value) => {
                                const item = currentData.find(d => d.x === value);
                                return item ? item.label : "";
                            },
                            formatYLabel: (value) => `₦${(value / 1000).toFixed(1)}k`,
                            lineColor: "#e5e7eb",
                            labelColor: "#9ca3af",
                        }}
                    >
                        {({ points }) => (
                            <>
                                <Line
                                    points={points.price}
                                    color="#047857"
                                    strokeWidth={3}
                                    animate={{ type: "timing", duration: 1000 }}
                                />
                                <Scatter
                                    points={points.price}
                                    radius={6}
                                    color="#047857"
                                    style="fill"
                                />
                            </>
                        )}
                    </CartesianChart>
                </View>

                {/* Time Filters */}
                <View className="flex-row justify-center space-x-4 mb-8 mt-6">
                    {['1W', '1M', '3M', '6M', '1Y', 'ALL'].map((period) => (
                        <TouchableOpacity
                            key={period}
                            className={`px-4 py-2 rounded-full ${period === '6M' ? 'bg-[#047857]' : 'bg-gray-100 dark:bg-slate-800'}`}
                        >
                            <Text className={period === '6M' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}>{period}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                <View className="px-6 mb-8">
                    <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex-row items-start">
                        <Calendar size={20} color="#3b82f6" className="mt-1" />
                        <View className="ml-3 flex-1">
                            <Text className="text-blue-800 dark:text-blue-200 font-bold mb-1">Seasonal Insight</Text>
                            <Text className="text-blue-600 dark:text-blue-300 text-sm leading-5">
                                Prices typically spike in December due to holiday demand. consider stocking up in October.
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
