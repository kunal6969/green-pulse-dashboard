import React, { useState, useContext, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, Area, Label, ComposedChart } from 'recharts';
import Card from '../ui/Card';
import { SimulationContext } from '../../contexts/SimulationContext';
import { predictFutureUsage, processApiData } from '../../services/dataService';
import { EnergyDataPoint } from '../../types';
import { Sliders, Loader2 } from 'lucide-react';
import LeafLoader from '../ui/LeafLoader';
import TimeRangeSelector, { TimeRangeOption } from '../ui/TimeRangeSelector';

const ParameterSlider = ({ label, value, onChange, min, max, step, unit }: { label: string, value: number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, min: number, max: number, step: number, unit: string }) => (
    <div>
        <label className="flex justify-between items-center text-sm font-medium text-text-secondary">
            <span>{label}</span>
            <span className="text-primary font-semibold">{value}{unit}</span>
        </label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-bg-secondary rounded-lg appearance-none cursor-pointer range-thumb"
        />
        <style>{`
            .range-thumb::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                background: var(--primary);
                border-radius: 50%;
                cursor: pointer;
            }
            .range-thumb::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: var(--primary);
                border-radius: 50%;
                cursor: pointer;
            }
        `}</style>
    </div>
);

const AIInsightsPage: React.FC = () => {
    const { buildingId, buildingData } = useContext(SimulationContext);
    
    // State for historical chart
    const [historicalViewHours, setHistoricalViewHours] = useState(24);
    const [historicalDisplayInfo, setHistoricalDisplayInfo] = useState('');

    const historicalTimeRangeOptions: TimeRangeOption[] = [
        { label: '12 Hours', value: 12 },
        { label: '24 Hours', value: 24 },
        { label: '1 Week', value: 168 },
    ];

    const predictTimeRangeOptions: TimeRangeOption[] = [
        { label: '12 Hours', value: 12 },
        { label: '24 Hours', value: 24 },
        { label: '1 Week', value: 168 },
    ];

    const historicalChartData = useMemo(() => {
        const dataSlice = buildingData.slice(-historicalViewHours);
        
        if (dataSlice.length > 0) {
            const start = dataSlice[0]?.historical;
            const end = dataSlice[dataSlice.length - 1]?.historical;

            if (start && end && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
                 if (historicalViewHours === 168) { // 1 Week
                     setHistoricalDisplayInfo(
                        `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
                    );
                } else {
                    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60));
                    setHistoricalDisplayInfo(
                        `${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleDateString()} ${end.toLocaleTimeString()} (${duration} hours)`
                    );
                }
            } else {
                setHistoricalDisplayInfo('Not enough data to display.');
            }
        } else {
            setHistoricalDisplayInfo('Not enough data to display.');
        }
        
        if (historicalViewHours === 168 && dataSlice.length > 0) { // 1 Week view
            const daysData: { [key: string]: { points: EnergyDataPoint[], date: Date } } = {};
            
            dataSlice.forEach(p => {
                if (p.historical) {
                    const dayKey = p.historical.toLocaleDateString([], { weekday: 'short' });
                    if (!daysData[dayKey]) {
                        const startOfDay = new Date(p.historical);
                        startOfDay.setHours(0, 0, 0, 0);
                        daysData[dayKey] = { points: [], date: startOfDay };
                    }
                    daysData[dayKey].points.push(p);
                }
            });

            const aggregated = Object.entries(daysData).map(([key, day]) => {
                const actualPoints = day.points.filter(p => p.actual !== null);
                const predictedPoints = day.points.filter(p => p.predicted !== null);

                const avgActual = actualPoints.length > 0 ? actualPoints.reduce((sum, p) => sum + p.actual!, 0) / actualPoints.length : null;
                const avgPredicted = predictedPoints.length > 0 ? predictedPoints.reduce((sum, p) => sum + p.predicted!, 0) / predictedPoints.length : null;
                
                return {
                    time: key,
                    actual: avgActual,
                    predicted: avgPredicted,
                    date: day.date,
                };
            });
            
            aggregated.sort((a, b) => a.date.getTime() - b.date.getTime());
            return aggregated;
        }

        return dataSlice;
    }, [buildingData, historicalViewHours]);

    // State for custom forecasting
    const [customForecastData, setCustomForecastData] = useState<EnergyDataPoint[]>([]);
    const [isLoadingPrediction, setIsLoadingPrediction] = useState(false);
    const [predictionError, setPredictionError] = useState<string | null>(null);
    const [predictHours, setPredictHours] = useState(24);

    const [params, setParams] = useState({
        air_temperature: 20,
        cloud_coverage: 2,
        dew_temperature: 10,
        sea_level_pressure: 1015,
        wind_speed: 5,
        floor_count: 5,
    });
    
    useEffect(() => {
        // Reset state when building changes
        setCustomForecastData([]);
        setPredictionError(null);
    }, [buildingId]);

    const handleParamChange = (paramName: keyof typeof params) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setParams(prev => ({ ...prev, [paramName]: parseFloat(e.target.value) }));
    };

    const handlePredict = async () => {
        setIsLoadingPrediction(true);
        setCustomForecastData([]);
        setPredictionError(null);
        try {
            const result = await predictFutureUsage({
                building_id: buildingId,
                user_params: params,
                predict_hours: predictHours,
            });
            const processed = processApiData(result);
            setCustomForecastData(processed.map(p => ({ ...p, actual: null }))); // Future data only has predictions
        } catch (error) {
            console.error("Prediction failed:", error);
            setPredictionError(error instanceof Error ? error.message : "An unknown error occurred during prediction.");
        } finally {
            setIsLoadingPrediction(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <Card>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-text-primary">Historical & Baseline Forecast</h2>
                        <p className="text-sm text-text-secondary font-mono">{historicalDisplayInfo}</p>
                    </div>
                    <TimeRangeSelector
                        options={historicalTimeRangeOptions}
                        selected={historicalViewHours}
                        onSelect={setHistoricalViewHours}
                    />
                </div>
                <div className="h-96">
                    <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={historicalChartData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(104, 216, 177,0.1)" />
                            <XAxis dataKey="time" stroke="#A8B2D1" fontSize={12} >
                                <Label value="Time" position="insideBottom" offset={-15} fill="#A8B2D1" />
                            </XAxis>
                            <YAxis stroke="#A8B2D1" fontSize={12} >
                                <Label value="Energy (kWh)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#A8B2D1" />
                            </YAxis>
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 20, 20, 0.8)', borderColor: 'rgba(104, 216, 177, 0.2)' }} />
                            <Legend verticalAlign="top" height={36}/>
                            <defs>
                                <linearGradient id="colorActualInsights" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#68D8B1" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#68D8B1" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Area type="monotone" dataKey="actual" stroke="#68D8B1" strokeWidth={2} fill="url(#colorActualInsights)" name="Historical Usage" connectNulls />
                            <Line type="monotone" dataKey="predicted" stroke="#A8B2D1" strokeWidth={2} name="Baseline Forecast" connectNulls dot={false} />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            </Card>

            <Card className="grid grid-cols-1 lg:grid-cols-3 gap-x-8 gap-y-6 animate-fade-in-down" style={{animationDelay: '150ms'}}>
                <div className="lg:col-span-1 space-y-4">
                    <div className="flex items-center space-x-2">
                        <Sliders className="text-primary"/>
                        <h2 className="text-xl font-bold text-text-primary">Custom Forecast Simulation</h2>
                    </div>
                    <ParameterSlider label="Air Temperature" value={params.air_temperature} onChange={handleParamChange('air_temperature')} min={-10} max={40} step={1} unit="°C" />
                    <ParameterSlider label="Cloud Coverage" value={params.cloud_coverage} onChange={handleParamChange('cloud_coverage')} min={0} max={8} step={1} unit="" />
                    <ParameterSlider label="Dew Temperature" value={params.dew_temperature} onChange={handleParamChange('dew_temperature')} min={-10} max={30} step={1} unit="°C" />
                    <ParameterSlider label="Sea Level Pressure" value={params.sea_level_pressure} onChange={handleParamChange('sea_level_pressure')} min={980} max={1050} step={1} unit=" hPa" />
                    <ParameterSlider label="Wind Speed" value={params.wind_speed} onChange={handleParamChange('wind_speed')} min={0} max={25} step={0.5} unit=" m/s" />
                    <ParameterSlider label="Floor Count" value={params.floor_count} onChange={handleParamChange('floor_count')} min={1} max={20} step={1} unit="" />
                    <div className="pt-2">
                        <p className="text-sm font-medium text-text-secondary mb-2">Time Horizon</p>
                        <div className="flex items-center flex-wrap gap-2">
                            <TimeRangeSelector
                                options={predictTimeRangeOptions}
                                selected={predictHours}
                                onSelect={setPredictHours}
                            />
                        </div>
                    </div>
                    <button onClick={handlePredict} disabled={isLoadingPrediction} className="w-full bg-primary hover:bg-primary-focus text-bg-primary font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center disabled:bg-gray-500">
                        {isLoadingPrediction && <Loader2 className="animate-spin mr-2" />}
                        Generate Forecast
                    </button>
                </div>
                <div className="lg:col-span-2 h-96">
                    {isLoadingPrediction ? (
                        <LeafLoader />
                    ) : predictionError ? (
                        <div className="flex items-center justify-center h-full text-red-400">{predictionError}</div>
                    ) : customForecastData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={customForecastData} margin={{ top: 5, right: 30, left: 20, bottom: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(104, 216, 177,0.1)" />
                                <XAxis dataKey="time" stroke="#A8B2D1" fontSize={12}>
                                    <Label value="Time" position="insideBottom" offset={-15} fill="#A8B2D1" />
                                </XAxis>
                                <YAxis stroke="#A8B2D1" fontSize={12}>
                                    <Label value="Predicted Energy (kWh)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} fill="#A8B2D1" />
                                </YAxis>
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(10, 20, 20, 0.8)', borderColor: 'rgba(104, 216, 177, 0.2)' }} />
                                <Legend verticalAlign="top" height={36}/>
                                <Line type="monotone" dataKey="predicted" name="Forecasted Usage" stroke="#F7C948" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-full text-text-secondary">
                            <p>Adjust parameters and click "Generate Forecast" to see results.</p>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default AIInsightsPage;