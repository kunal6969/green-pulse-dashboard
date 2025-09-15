import React, { useState, useEffect, useContext, useRef } from 'react';
import Card from '../ui/Card';
import Modal from '../ui/Modal';
import { Trophy, ArrowUp, ArrowDown, Minus, Loader2, AlertCircle as AlertCircleIcon } from 'lucide-react';
import { fetchAllBuildingsCumulativeData } from '../../services/dataService';
import { LeaderboardEntry } from '../../types';
import { SimulationContext } from '../../contexts/SimulationContext';

const podiumStyles = {
    1: {
        gradient: 'from-amber-400 to-yellow-500',
        shadow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
        iconColor: 'text-yellow-300',
    },
    2: {
        gradient: 'from-slate-300 to-slate-400',
        shadow: 'shadow-[0_0_20px_rgba(191,200,212,0.5)]',
        iconColor: 'text-slate-200',
    },
    3: {
        gradient: 'from-amber-700 to-orange-700',
        shadow: 'shadow-[0_0_20px_rgba(200,100,60,0.5)]',
        iconColor: 'text-amber-400',
    },
};

const RankChangeIcon = ({ change }: { change: LeaderboardEntry['rankChange'] }) => {
    if (change === 'up') return <ArrowUp size={16} className="text-primary" />;
    if (change === 'down') return <ArrowDown size={16} className="text-red-400" />;
    return <Minus size={16} className="text-text-secondary" />;
};


const PodiumItem: React.FC<{ entry: LeaderboardEntry, index: number }> = ({ entry, index }) => {
    const styles = podiumStyles[entry.rank as keyof typeof podiumStyles];
    const delay = `${index * 100}ms`;

    return (
        <div 
            className={`relative flex flex-col items-center justify-end p-4 rounded-xl text-white h-full bg-gradient-to-b ${styles.gradient} ${styles.shadow} transition-transform duration-300 hover:-translate-y-2 animate-slide-and-fade-in`}
            style={{ animationDelay: delay }}
        >
            <Trophy size={32} className={`absolute top-4 opacity-20 ${styles.iconColor}`} />
            <div className={`absolute -top-4 text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b ${styles.gradient}`}>{entry.rank}</div>
            <p className="mt-4 text-center font-semibold text-sm drop-shadow-md">{entry.name}</p>
            <p className="text-xl font-bold mt-1 drop-shadow-md">{entry.score.toLocaleString(undefined, { maximumFractionDigits: 0 })} <span className="text-sm font-medium opacity-80">GP</span></p>
        </div>
    );
};


const GamificationLeaderboard: React.FC<{ className?: string }> = ({ className }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { simulationTime } = useContext(SimulationContext);
  const prevDataRef = useRef<Map<number, { rank: number }>>(new Map());

  useEffect(() => {
    const getLeaderboard = async () => {
        setError(null);
        try {
            const data = await fetchAllBuildingsCumulativeData(simulationTime);
            const sortedData = [...data].sort((a, b) => b.cumulative_net_savings - a.cumulative_net_savings);

            const allRanksMap = new Map<number, { rank: number }>();
            sortedData.forEach((record, index) => {
                allRanksMap.set(record.building_id, { rank: index + 1 });
            });

            const formattedLeaderboard: LeaderboardEntry[] = sortedData.map((d, i) => {
                const rank = i + 1;
                const prevRankData = prevDataRef.current.get(d.building_id);
                let rankChange: LeaderboardEntry['rankChange'] = 'stable';
                if (prevRankData) {
                    if (rank < prevRankData.rank) rankChange = 'up';
                    else if (rank > prevRankData.rank) rankChange = 'down';
                }

                return {
                    rank,
                    name: `Building #${d.building_id}`,
                    score: d.cumulative_net_savings,
                    rankChange
                };
            });
            
            setLeaderboard(formattedLeaderboard);
            prevDataRef.current = allRanksMap;

        } catch (err) {
            setError("Could not load leaderboard.");
            console.error(err);
        } finally {
            if (isLoading) setIsLoading(false);
        }
    };
    getLeaderboard();
  }, [simulationTime, isLoading]);
  
  const podiumEntries = leaderboard.slice(0, 3);
  
  const renderPodium = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full text-text-secondary space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      );
    }
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-red-400 text-center">
          <AlertCircleIcon className="w-8 h-8 mb-2" />
          <p className="text-sm">{error}</p>
        </div>
      );
    }
    if (podiumEntries.length < 3) {
      return <div className="flex items-center justify-center h-full text-text-secondary">Not enough data for podium.</div>;
    }
    return (
      <div className="grid grid-cols-3 gap-2 sm:gap-4 flex-grow">
        <div className="h-40 mt-auto">
          <PodiumItem entry={podiumEntries[1]} index={1} />
        </div>
        <div className="h-48">
          <PodiumItem entry={podiumEntries[0]} index={0} />
        </div>
        <div className="h-32 mt-auto">
          <PodiumItem entry={podiumEntries[2]} index={2} />
        </div>
      </div>
    );
  };


  return (
    <>
      <Card className={`${className} flex flex-col`}>
        <h2 className="text-lg font-semibold text-text-primary mb-4">Green Points Challenge</h2>
        {renderPodium()}
        <button 
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading || error !== null}
          className="mt-4 w-full bg-primary/10 hover:bg-primary/20 text-primary font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View Full Leaderboard
        </button>
      </Card>
      
      <Modal title="Full Leaderboard" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="space-y-2 pr-2 max-h-[60vh] overflow-y-auto">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.rank}
              className="flex items-center justify-between p-3 bg-white/5 rounded-lg animate-slide-and-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
                <div className="flex items-center">
                    <span className="text-text-secondary font-semibold w-6 text-center">{entry.rank}</span>
                    <p className="ml-4 font-medium text-text-primary">{entry.name}</p>
                </div>
                <div className="flex items-center space-x-4">
                    <RankChangeIcon change={entry.rankChange} />
                    <p className="font-semibold text-primary w-24 text-right">{entry.score.toLocaleString(undefined, { maximumFractionDigits: 0 })} GP</p>
                </div>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
};

export default GamificationLeaderboard;
