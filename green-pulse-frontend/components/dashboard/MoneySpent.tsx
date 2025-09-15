import React, { useState, useEffect, useContext } from 'react';
import { TrendingUp, TrendingDown, Loader2, AlertCircle as AlertCircleIcon } from 'lucide-react';
import Card from '../ui/Card';
import { BuildingBreakdownData, fetchBuildingBreakdown } from '../../services/dataService';
import { SimulationContext } from '../../contexts/SimulationContext';

const BuildingBreakdown: React.FC<{ className?: string }> = ({ className }) => {
    const { simulationTime } = useContext(SimulationContext);
    const [data, setData] = useState<BuildingBreakdownData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const getBreakdown = async () => {
            setError(null);
            try {
                const breakdownData = await fetchBuildingBreakdown(simulationTime);
                setData(breakdownData);
            } catch (err) {
                setError("Failed to load breakdown.");
                console.error(err);
            } finally {
                if (isLoading) setIsLoading(false);
            }
        };

        getBreakdown();
    }, [simulationTime]);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex items-center justify-center h-40 text-text-secondary space-x-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading Breakdown...</span>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center h-40 text-red-400">
                    <AlertCircleIcon className="w-8 h-8 mb-2" />
                    <p>{error}</p>
                </div>
            );
        }

        if (data.length === 0) {
            return (
                <div className="flex items-center justify-center h-40 text-text-secondary">
                    <p>No building data to display.</p>
                </div>
            );
        }

        return data.map((building) => (
            <div key={building.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
                <div>
                    <p className="font-medium text-text-primary">{building.name}</p>
                    <p className="text-sm text-text-secondary">{building.usage.toFixed(1)} kWh</p>
                </div>
                <div className={`flex items-center text-sm font-semibold ${building.change > 0 ? 'text-red-400' : 'text-primary'}`}>
                    {building.change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    <span className="ml-1">{Math.abs(building.change)}%</span>
                </div>
            </div>
        ));
    };

    return (
        <Card className={className}>
            <h2 className="text-lg font-semibold text-text-primary mb-4">Building Breakdown</h2>
            <div className="space-y-2">
                {renderContent()}
            </div>
        </Card>
    );
};

export default BuildingBreakdown;
