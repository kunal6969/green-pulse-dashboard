import React, { useContext } from 'react';
import { SimulationContext } from '../../contexts/SimulationContext';

const BuildingSelector: React.FC = () => {
    const { buildingId, setBuildingId, isLoading } = useContext(SimulationContext);
    const options = Array.from({ length: 100 }, (_, i) => i + 1);

    return (
        <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-text-secondary hidden sm:inline">Building:</span>
            <select
                value={buildingId}
                onChange={(e) => setBuildingId(Number(e.target.value))}
                disabled={isLoading}
                className="bg-bg-secondary border border-border-color rounded-lg px-2 py-1 text-text-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all text-sm w-20"
            >
                {options.map(id => <option key={id} value={id}>{id}</option>)}
            </select>
        </div>
    );
};

export default BuildingSelector;