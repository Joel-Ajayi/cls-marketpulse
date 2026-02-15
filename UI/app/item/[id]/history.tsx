import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { matchFont } from "@shopify/react-native-skia";
import { ArrowLeft, Calendar } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../../api/client';
import { useToast } from '../../../context/ToastContext';

type HistoryData = {
    date: string;
    unit: string;
    price: number;
    x: number; // for chart
};

export default function History() {
    const { id, unit, name } = useLocalSearchParams();
    const router = useRouter();
    const { showToast } = useToast();
    const [selectedUnit, setSelectedUnit] = useState(typeof unit === 'string' ? unit : '');
    const [historyData, setHistoryData] = useState<HistoryData[]>([]);
    const [units, setUnits] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    const font = matchFont({
        fontFamily: "Arial",
        fontSize: 12,
    });

    useEffect(() => {
        if (id) fetchHistory();
    }, [id]);

    const fetchHistory = async () => {
        try {
            const res = await api.get<{ date: string, unit: string, price: number }[]>(`/prices/history/${id}`);

            // Process data for chart
            // We need to group by unit to find available units
            const allUnits = Array.from(new Set(res.data.map(d => d.unit)));
            setUnits(allUnits);

            if (allUnits.length > 0 && !selectedUnit) {
                setSelectedUnit(allUnits[0]);
            } else if (allUnits.length === 0) {
                // No data
            }

            // Transform for chart
            // Map dates to 1..N indices for simple x-axis, or use timestamps
            // Let's simple mapping for now
            const processed = res.data.map((d, i) => ({
                ...d,
                x: i + 1, // Just sequential for now, ideally parsed date
                // parse date string if needed for sorting?
                // backend returns strings from chrono, usually ISO?
            }));

            setHistoryData(processed);

        } catch (error) {
            console.error('History fetch error', error);
            showToast('Failed to load history', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter data by selected unit
    const currentData = historyData.filter(d => d.unit === selectedUnit);

    // If no data, show placeholder or empty state
    // If we have data, we neeed to re-index x values for the chart to look continuous?
    // Or just use index in filtered array
    const chartData = currentData.map((d, i) => ({ ...d, x: i + 1, label: new Date(d.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }));

    const currentPrice = chartData.length > 0 ? chartData[chartData.length - 1].price : 0;
    const firstPrice = chartData.length > 0 ? chartData[0].price : 0;
    const change = firstPrice > 0 ? ((currentPrice - firstPrice) / firstPrice) * 100 : 0;

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-slate-900">
            <View className="px-6 py-4 flex-row items-center border-b border-gray-100 dark:border-slate-800 bg-[#047857]">
                <TouchableOpacity onPress={() => router.back()} className="mr-4 p-2 bg-white/20 rounded-full">
                    <ArrowLeft size={20} color="white" />
                </TouchableOpacity>
                <View>
                    <Text className="text-xl font-bold text-white">Price History</Text>
                    <Text className="text-sm text-green-100 opacity-80">{name || 'Item Details'}</Text>
                </View>
            </View>

            {loading ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#047857" />
                </View>
            ) : (
                <ScrollView className="flex-1">
                    <View className="px-6 pb-6 pt-6">
                        <Text className="text-gray-900 dark:text-white font-bold mb-3">Unit: {selectedUnit || 'None'}</Text>

                        {units.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">
                                {units.map((u) => (
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
                        ) : (
                            <Text className="text-gray-500 mb-4">No price history available yet.</Text>
                        )}

                        <Text className="text-gray-500 dark:text-gray-400 mb-2">Visual Trends</Text>
                        <Text className="text-3xl font-bold text-[#047857] dark:text-green-400">₦{currentPrice.toLocaleString()}</Text>
                        {chartData.length > 1 && (
                            <Text className={`${change >= 0 ? 'text-red-500' : 'text-green-500'} text-sm font-medium`}>
                                {change >= 0 ? '+' : ''}{change.toFixed(1)}% vs Start
                            </Text>
                        )}
                    </View>

                    {/* Chart */}
                    {chartData.length > 0 ? (
                        <View className="h-80 w-full px-4">
                            <CartesianChart
                                data={chartData}
                                xKey="x"
                                yKeys={["price"]}
                                axisOptions={{
                                    font,
                                    formatXLabel: (value) => {
                                        const item = chartData.find(d => d.x === value);
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
                    ) : (
                        <View className="h-40 w-full items-center justify-center">
                            <Text className="text-gray-400">Not enough data for chart</Text>
                        </View>
                    )}

                    {/* Time Filters - Visual Only for now as backend doesn't support generic filtering yet */}
                    {/* <View className="flex-row justify-center space-x-4 mb-8 mt-6">
                        {['1M', 'ALL'].map((period) => (
                            <TouchableOpacity
                                key={period}
                                className={`px-4 py-2 rounded-full ${period === 'ALL' ? 'bg-[#047857]' : 'bg-gray-100 dark:bg-slate-800'}`}
                            >
                                <Text className={period === 'ALL' ? 'text-white' : 'text-gray-600 dark:text-gray-300'}>{period}</Text>
                            </TouchableOpacity>
                        ))}
                    </View> */}

                    <View className="px-6 mb-8 mt-6">
                        <View className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex-row items-start">
                            <Calendar size={20} color="#3b82f6" className="mt-1" />
                            <View className="ml-3 flex-1">
                                <Text className="text-blue-800 dark:text-blue-200 font-bold mb-1">Market Insight</Text>
                                <Text className="text-blue-600 dark:text-blue-300 text-sm leading-5">
                                    Prices fluctuate based on market conditions. Add regular price updates to better track these trends.
                                </Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
