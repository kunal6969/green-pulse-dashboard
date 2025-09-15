import React, { useState, useEffect, useRef } from 'react';
import Card from '../ui/Card';
import { LiveEvent } from '../../types';
import { fetchLiveEvents } from '../../services/dataService';
import { Zap, AlertTriangle, Info, CheckCircle, Cpu, Loader2 } from 'lucide-react';

const eventIcons: { [key in LiveEvent['type']]: React.ReactElement } = {
    info: <Info className="w-5 h-5 text-blue-400" />,
    success: <CheckCircle className="w-5 h-5 text-primary" />,
    warning: <AlertTriangle className="w-5 h-5 text-secondary" />,
    error: <AlertTriangle className="w-5 h-5 text-red-500" />,
};

const eventBorderColors: { [key in LiveEvent['type']]: string } = {
    info: 'border-blue-400/20',
    success: 'border-primary/20',
    warning: 'border-secondary/20',
    error: 'border-red-500/20',
};

const LiveFeedPage: React.FC = () => {
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const feedEndRef = useRef<HTMLDivElement>(null);
  const lastEventTimestamp = useRef<Date | undefined>(undefined);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    
    const getEvents = async (isInitialLoad = false) => {
        try {
          const newEvents = await fetchLiveEvents(lastEventTimestamp.current);
          if (newEvents && newEvents.length > 0) {
            // Assuming events are sorted newest first from API
            lastEventTimestamp.current = new Date(newEvents[0].timestamp);
            setEvents(prevEvents => [...newEvents.reverse(), ...prevEvents].slice(0, 100)); // Prepend new events
          }
        } catch (error) {
          console.error("Failed to fetch live events:", error);
          // Optional: handle error state in UI
        } finally {
            if (isInitialLoad) setIsLoading(false);
        }
    };

    if (isLive) {
      getEvents(true); // Initial fetch
      intervalId = setInterval(() => getEvents(), 5000); // Poll every 5 seconds
    }
    
    return () => clearInterval(intervalId);
  }, [isLive]);

  useEffect(() => {
    // Scroll to bottom on new event if user is near the bottom
    if (feedEndRef.current) {
        feedEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [events]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full text-text-secondary space-x-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Connecting to live stream...</span>
        </div>
      );
    }
    return (
        <div className="space-y-3">
            {events.map((event) => (
                <div
                    key={event.id}
                    className={`flex items-start p-3 rounded-lg border-l-4 animate-fade-in-down ${eventBorderColors[event.type]}`}
                >
                    <div className="shrink-0 mt-1">{eventIcons[event.type]}</div>
                    <div className="ml-3 flex-1">
                        <p className="font-mono text-xs text-text-secondary">
                            [{new Date(event.timestamp).toLocaleTimeString()}] <span className="font-semibold text-text-primary">{event.device}</span>
                        </p>
                        <p className="text-sm text-text-primary mt-1">{event.message}</p>
                    </div>
                </div>
            ))}
            {events.length === 0 && (
                <div className="text-center py-10 text-text-secondary">
                    <p>No new events to display.</p>
                </div>
            )}
            <div ref={feedEndRef} />
        </div>
    );
  };

  return (
    <Card className="h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
                <Zap className="text-primary"/>
                <h2 className="text-lg font-semibold text-text-primary">Live Event Stream</h2>
            </div>
            <button
                onClick={() => setIsLive(!isLive)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center space-x-2 transition-colors ${
                    isLive
                        ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        : 'bg-primary/10 text-primary hover:bg-primary/20'
                }`}
            >
                <Cpu size={16} />
                <span>{isLive ? 'Pause Feed' : 'Resume Feed'}</span>
            </button>
        </div>
        <div className="flex-1 overflow-y-auto pr-2 bg-black/20 rounded-lg p-4 border border-glass-border">
            {renderContent()}
        </div>
    </Card>
  );
};

export default LiveFeedPage;
