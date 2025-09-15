import React, { useRef, useState, useContext, useMemo } from 'react';
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, ComposedChart } from 'recharts';
import Card from '../ui/Card';
import { SimulationContext } from '../../contexts/SimulationContext';
import { EnergyDataPoint } from '../../types';
import TimeRangeSelector from '../ui/TimeRangeSelector';
import { aggregateAndFindAnomalies } from '../../utils/dataAggregation';

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const actualData = payload.find(p => p.name === 'Actual Usage');
        const predictedData = payload.find(p => p.name === 'Predicted Usage');

        const formatValue = (data: any) => {
            if (data && typeof data.value === 'number') {
                return `${data.value.toFixed(2)} kWh`;
            }
            return 'N/A';
        };

        return (
        <div className="bg-bg-secondary/80 backdrop-blur-sm p-4 border border-glass-border rounded-lg shadow-lg">
            <p className="label text-text-primary font-semibold">{`Time: ${label}`}</p>
            <p className="intro text-primary">{`Actual : ${formatValue(actualData)}`}</p>
            <p className="intro text-secondary">{`Predicted : ${formatValue(predictedData)}`}</p>
        </div>
        );
    }
    return null;
};


const ConsumptionOverview: React.FC<{ className?: string, data?: EnergyDataPoint[] }> = ({ className, data: reportDataProp }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { simulationTime, buildingData } = useContext(SimulationContext);
  const [timeRangeHours, setTimeRangeHours] = useState(24);

  const timeRangeOptions = [
    { label: '24h', value: 24 },
    { label: '7d', value: 168 },
    { label: '30d', value: 720 },
  ];

  const chartData = useMemo(() => {
    // If data is passed as a prop for the reports page, use it directly.
    if (reportDataProp) {
        return reportDataProp;
    }
    // Otherwise, calculate from context for the dashboard view using the new utility.
    return aggregateAndFindAnomalies(buildingData, timeRangeHours, simulationTime);
  }, [simulationTime, buildingData, reportDataProp, timeRangeHours]);


  return (
    <Card className={className} ref={chartRef}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-lg font-semibold text-text-primary">{reportDataProp ? 'Consumption Chart' : 'Consumption Overview'}</h2>
             {!reportDataProp && (
                <TimeRangeSelector
                    options={timeRangeOptions}
                    selected={timeRangeHours}
                    onSelect={setTimeRangeHours}
                />
            )}
        </div>
        <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                data={chartData}
                margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                >
                <defs>
                    <linearGradient id="colorPredicted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F7C948" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#F7C948" stopOpacity={0}/>
                    </linearGradient>
                     <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#68D8B1" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#68D8B1" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(104, 216, 177,0.1)" />
                <XAxis dataKey="time" stroke="#A8B2D1" fontSize={12} tick={{ fill: '#A8B2D1' }} />
                <YAxis stroke="#A8B2D1" fontSize={12} tick={{ fill: '#A8B2D1' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" />
                <Area
                    type="monotone"
                    dataKey="predicted"
                    stroke="#F7C948"
                    strokeWidth={2}
                    fill="url(#colorPredicted)"
                    name="Predicted Usage"
                    connectNulls
                />
                <Area
                    type="monotone"
                    dataKey="actual"
                    stroke="#68D8B1"
                    strokeWidth={2}
                    fill="url(#colorActual)"
                    name="Actual Usage"
                    connectNulls
                />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    </Card>
  );
};

export default ConsumptionOverview;