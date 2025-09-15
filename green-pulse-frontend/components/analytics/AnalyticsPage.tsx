import React, { useContext, useMemo, useState } from 'react';
import Card from '../ui/Card';
import { ResponsiveContainer, Legend, ComposedChart, XAxis, YAxis, Tooltip, Area, CartesianGrid, Line } from 'recharts';
import { SimulationContext } from '../../contexts/SimulationContext';
import TimeRangeSelector from '../ui/TimeRangeSelector';
import { aggregateAndFindAnomalies } from '../../utils/dataAggregation';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const anomalyData = payload.find((p: any) => p.dataKey === 'anomaly');
        
        const formatValue = (value: any) => {
            if (typeof value === 'number') {
                return `${value.toFixed(2)} kWh`;
            }
            return 'N/A';
        };

        return (
        <div className="bg-bg-secondary/80 backdrop-blur-sm p-4 border border-glass-border rounded-lg shadow-lg">
            <p className="label text-text-primary font-semibold">{`Time: ${label}`}</p>
            {payload.map((p: any, i: number) => {
                if (p.dataKey !== 'anomaly') {
                     return <p key={i} style={{ color: p.color }}>{`${p.name} : ${formatValue(p.value)}`}</p>
                }
                return null;
            })}
            {anomalyData && typeof anomalyData.payload.deviation === 'number' && (
                <div className="mt-2 pt-2 border-t border-glass-border">
                    <p className="font-bold text-red-400">Anomaly Detected!</p>
                    <p className="text-sm text-text-secondary">{`Deviation: ${anomalyData.payload.deviation.toFixed(0)}%`}</p>
                </div>
            )}
        </div>
        );
    }
    return null;
};

const AnalyticsPage: React.FC = () => {
    const { buildingData } = useContext(SimulationContext);
    const [timeRangeHours, setTimeRangeHours] = useState(168); // Default 7 days

    const timeRangeOptions = [
        { label: '24h', value: 24 },
        { label: '7d', value: 168 },
        { label: '30d', value: 720 },
    ];

    const chartDataWithAnomalies = useMemo(() => {
        // The analytics page shows the last N hours of the total dataset,
        // so we don't pass a simulationTime to the utility function.
        return aggregateAndFindAnomalies(buildingData, timeRangeHours);
    }, [buildingData, timeRangeHours]);

    return (
        <div className="space-y-6">
            <Card className="animate-fade-in-down">
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Consumption Analysis</h2>
                        <p className="text-text-secondary text-sm mt-1">
                            Visualize actual usage against the AI baseline to identify trends and anomalies.
                        </p>
                    </div>
                     <TimeRangeSelector
                        options={timeRangeOptions}
                        selected={timeRangeHours}
                        onSelect={setTimeRangeHours}
                    />
                </div>
                <div className="h-96">
                   <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartDataWithAnomalies} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                             <defs>
                                <linearGradient id="colorActualAnalytics" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#68D8B1" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#68D8B1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(104, 216, 177,0.1)" />
                            <XAxis dataKey="time" stroke="#A8B2D1" fontSize={12} tick={{ fill: '#A8B2D1' }} />
                            <YAxis stroke="#A8B2D1" fontSize={12} tick={{ fill: '#A8B2D1' }} unit=" kWh"/>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend iconType="circle" />
                             <Area type="monotone" dataKey="actual" stroke="#68D8B1" strokeWidth={2} fill="url(#colorActualAnalytics)" name="Actual Usage" connectNulls />
                             <Line type="monotone" dataKey="predicted" stroke="#F7C948" strokeWidth={2} name="Predicted Usage" connectNulls dot={false} />
                        </ComposedChart>
                   </ResponsiveContainer>
                </div>
            </Card>
        </div>
    );
};

export default AnalyticsPage;