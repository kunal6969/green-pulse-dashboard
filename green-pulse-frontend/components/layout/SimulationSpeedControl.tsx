import React, { useContext } from 'react';
import { FastForward } from 'lucide-react';
import { SimulationContext } from '../../contexts/SimulationContext';

// Define the speed options for the simulation clock
const speedOptions = [
    { label: 'Slow', hoursPerTick: 1, intervalMs: 20000, description: '1 sim hour / 20 real secs' },
    { label: 'Normal', hoursPerTick: 1, intervalMs: 10000, description: '1 sim hour / 10 real secs' },
    { label: 'Fast', hoursPerTick: 1, intervalMs: 5000, description: '1 sim hour / 5 real secs' },
    { label: 'Hyper', hoursPerTick: 10, intervalMs: 5000, description: '10 sim hours / 5 real secs' },
];

const SimulationSpeedControl: React.FC = () => {
    const { simulationRate, setSimulationRate } = useContext(SimulationContext);

    return (
        <div className="flex items-center space-x-2 bg-bg-secondary p-2 rounded-lg border border-border-color">
            {/* FIX: The `title` prop is not supported on lucide-react icons. Wrapped the icon in a span to provide a tooltip. */}
            <span title="Simulation Speed">
                <FastForward size={18} className="text-text-secondary ml-1" />
            </span>
            <div className="flex items-center space-x-1">
                {speedOptions.map(option => {
                    const isActive = simulationRate.intervalMs === option.intervalMs && simulationRate.hoursPerTick === option.hoursPerTick;
                    return (
                        <button
                            key={option.label}
                            onClick={() => setSimulationRate({ hoursPerTick: option.hoursPerTick, intervalMs: option.intervalMs })}
                            title={`${option.label} Speed (${option.description})`}
                            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                                isActive ? 'bg-primary text-bg-primary shadow-glow-primary' : 'text-text-secondary hover:bg-primary/20'
                            }`}
                        >
                            {option.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default SimulationSpeedControl;
