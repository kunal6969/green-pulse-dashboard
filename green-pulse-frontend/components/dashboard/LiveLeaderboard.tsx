import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import Card from '../ui/Card';
import { SimulationContext } from '../../contexts/SimulationContext';
import { fetchAllBuildingsCumulativeData, BuildingCumulativeData } from '../../services/dataService';
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Trophy, ArrowUp, ArrowDown } from 'lucide-react';

interface LeaderboardItem extends BuildingCumulativeData {
    rank: number;
    rankChange: 'up' | 'down' | 'stable' | 'new';
}

const ROW_HEIGHT = 64; // px, corresponds to h-16 in Tailwind

const SavingsBar = ({ savings, maxAbsSaving }: { savings: number, maxAbsSaving: number }) => {
    const width = maxAbsSaving > 0 ? (Math.abs(savings) / maxAbsSaving) * 100 : 0;
    const isPositive = savings >= 0;

    return (
        <div className="w-full bg-bg-secondary rounded-full h-2.5 my-1">
            <div
                className={`${isPositive ? 'bg-primary' : 'bg-red-500'} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${width}%` }}
            ></div>
        </div>
    );
};


const LiveLeaderboard: React.FC = () => {
    const { simulationTime } = useContext(SimulationContext);
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const prevDataRef = useRef<Map<number, { rank: number }>>(new Map());

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const cumulativeData = await fetchAllBuildingsCumulativeData(simulationTime);
                
                const sortedData = cumulativeData
                    .sort((a, b) => b.cumulative_net_savings - a.cumulative_net_savings);

                const top20 = sortedData.slice(0, 20);

                const rankedDataWithChange = top20.map((record, index) => {
                    const rank = index + 1;
                    const prevRankData = prevDataRef.current.get(record.building_id);
                    let rankChange: LeaderboardItem['rankChange'] = 'stable';

                    if (!prevRankData) {
                        rankChange = 'new';
                    } else if (rank < prevRankData.rank) {
                        rankChange = 'up';
                    } else if (rank > prevRankData.rank) {
                        rankChange = 'down';
                    }

                    return {
                        ...record,
                        rank,
                        rankChange,
                    };
                });
                
                setLeaderboardData(rankedDataWithChange);
                setError(null);

                const allRanksMap = new Map<number, { rank: number }>();
                sortedData.forEach((record, index) => {
                    allRanksMap.set(record.building_id, { rank: index + 1 });
                });
                prevDataRef.current = allRanksMap;

            } catch (err) {
                setError('Failed to load leaderboard data.');
                console.error(err);
            } finally {
                if (isLoading) {
                    setIsLoading(false);
                }
            }
        };

        fetchLeaderboard();
    }, [simulationTime, isLoading]);
    
    const maxAbsSaving = useMemo(() => {
        if (leaderboardData.length === 0) return 0;
        return Math.max(...leaderboardData.map(item => Math.abs(item.cumulative_net_savings)));
    }, [leaderboardData]);

    return (
        <Card>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <div className="flex items-center space-x-3">
                     <Trophy className="w-6 h-6 text-primary" />
                    <h2 className="text-lg font-semibold text-text-primary">Campus Efficiency Rankings</h2>
                </div>
                <div className="text-sm text-text-secondary font-mono bg-bg-secondary px-3 py-1 rounded-md border border-border-color">
                    Last Updated: {simulationTime.toLocaleString()}
                </div>
            </div>

            <div className="w-full text-left">
                {/* Header */}
                <div className="flex items-center border-b-2 border-border-color">
                    <div className="p-3 text-sm font-semibold text-text-secondary w-16 text-center">Rank</div>
                    <div className="p-3 text-sm font-semibold text-text-secondary flex-grow">Building</div>
                    <div className="p-3 text-sm font-semibold text-text-secondary w-1/2 hidden md:block">Performance</div>
                    <div className="p-3 text-sm font-semibold text-text-secondary w-48 text-right">24h Net Savings (kWh)</div>
                </div>

                {/* Animated Body */}
                <div style={{ position: 'relative', height: `${leaderboardData.length * ROW_HEIGHT}px`, transition: 'height 0.5s ease-in-out' }}>
                    {isLoading ? (
                         <div className="absolute inset-0 flex items-center justify-center text-text-secondary space-x-2">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Loading live rankings...</span>
                        </div>
                    ) : error ? (
                        <div className="absolute inset-0 flex items-center justify-center text-red-400 space-x-2">
                            <AlertCircle className="w-6 h-6" />
                            <span>{error}</span>
                        </div>
                    ) : leaderboardData.map((item) => {
                        const isNew = item.rankChange === 'new';
                        return (
                            <div 
                                key={item.building_id} 
                                className={`flex items-center w-full border-b border-border-color/50 ${isNew ? 'animate-fade-in' : ''}`}
                                style={{
                                    position: 'absolute',
                                    height: `${ROW_HEIGHT}px`,
                                    top: `${(item.rank - 1) * ROW_HEIGHT}px`,
                                    transition: 'top 0.8s ease-in-out',
                                    willChange: 'top' // Performance hint for the browser
                                }}
                            >
                                <div className="p-3 font-bold text-lg text-center text-text-primary w-16 flex items-center justify-center">
                                    <span>{item.rank}</span>
                                    {item.rankChange === 'up' && <ArrowUp size={16} className="text-primary animate-bob-up ml-1" />}
                                    {item.rankChange === 'down' && <ArrowDown size={16} className="text-red-500 animate-bob-down ml-1" />}
                                </div>
                                <div className="p-3 font-semibold text-text-primary flex-grow">Building #{item.building_id}</div>
                                <div className="p-3 hidden md:flex items-center w-1/2">
                                    <SavingsBar savings={item.cumulative_net_savings} maxAbsSaving={maxAbsSaving} />
                                </div>
                                <div className={`p-3 font-semibold text-right w-48 ${item.cumulative_net_savings >= 0 ? 'text-primary' : 'text-red-500'}`}>
                                    <div className="flex items-center justify-end space-x-1">
                                        {item.cumulative_net_savings >= 0 ? <TrendingDown size={16} /> : <TrendingUp size={16} />}
                                        <span>{item.cumulative_net_savings.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
};

export default LiveLeaderboard;