import React, { useContext } from 'react';
import TimeControl from './TimeControl';
import BuildingSelector from './BuildingSelector';
import { SimulationContext } from '../../contexts/SimulationContext';


const Header: React.FC<{ title: string; subtitle: string; }> = ({ title, subtitle }) => {
    const { dataStartDate, dataEndDate, isLoading } = useContext(SimulationContext);

    const formatDate = (date: Date | null) => {
        if (!date) return '...';
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    return (
        <header className={`flex-shrink-0 flex flex-wrap items-center justify-between gap-4 p-6 border-b border-border-color`}>
            <div>
                <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
                <p className="text-sm text-text-secondary">{subtitle}</p>
                {!isLoading && dataStartDate && dataEndDate && (
                    <p className="text-xs text-text-secondary font-mono mt-1 animate-fade-in">
                        Dataset Range: {formatDate(dataStartDate)} to {formatDate(dataEndDate)}
                    </p>
                )}
            </div>
            <div className="flex items-center space-x-4">
                <BuildingSelector />
                <TimeControl />
            </div>
        </header>
    );
};

export default Header;