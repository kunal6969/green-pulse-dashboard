import { EnergyDataPoint, Alert, Anomaly, BuildingDataRecord, LeaderboardEntry, LiveEvent } from '../types';

export const API_BASE_URL = 'https://green-pulse.onrender.com';

export interface PredictRequest {
    building_id: number;
    user_params: { [key: string]: any };
    predict_hours?: number;
    seq_length?: number;
}

export interface SuggestRequest {
    building_id: number;
    user_params: { [key: string]: any };
    target_usage: number;
    param_candidates?: string[];
    seq_length?: number;
}

export const fetchBuildingData = async (buildingId: number): Promise<BuildingDataRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/building/${buildingId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch building data. Server responded with status: ${response.status}`);
    }
    return response.json();
};

export interface BuildingCumulativeData {
    building_id: number;
    cumulative_net_savings: number;
}

export const fetchAllBuildingsCumulativeData = async (endTime: Date): Promise<BuildingCumulativeData[]> => {
    const response = await fetch(`${API_BASE_URL}/leaderboard?time=${endTime.toISOString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch leaderboard data. Server responded with status: ${response.status}`);
    }
    return response.json();
};

export const predictFutureUsage = async (data: PredictRequest): Promise<BuildingDataRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/predict_future_usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error(`Prediction server responded with status: ${response.status}`);
    }
    return response.json();
};

export const suggestParamAdjustment = async (data: SuggestRequest) => {
    const response = await fetch(`${API_BASE_URL}/suggest_param_adjustment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) {
        throw new Error('Failed to get suggestion');
    }
    return response.json();
};


export const processApiData = (records: BuildingDataRecord[]): EnergyDataPoint[] => {
    if (!records || records.length === 0) return [];
    return records
      .map(record => ({
        historical: new Date(record.timestamp),
        time: new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
        actual: record.meter_reading,
        predicted: record.predicted_meter_reading,
      }))
      .filter(p => p.actual !== null || p.predicted !== null) // Keep if either value is present
      .sort((a, b) => a.historical!.getTime() - b.historical!.getTime());
};

export const fetchAlerts = async (time: Date): Promise<Alert[]> => {
    const response = await fetch(`${API_BASE_URL}/alerts?time=${time.toISOString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch alerts. Server responded with status: ${response.status}`);
    }
    return response.json();
};

export interface BuildingBreakdownData {
  id: string;
  name: string;
  usage: number;
  change: number;
}

export const fetchBuildingBreakdown = async (time: Date): Promise<BuildingBreakdownData[]> => {
    const response = await fetch(`${API_BASE_URL}/building_breakdown?time=${time.toISOString()}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch building breakdown. Server responded with status: ${response.status}`);
    }
    return response.json();
};

export const fetchLiveEvents = async (since?: Date): Promise<LiveEvent[]> => {
    // If no 'since' date is provided, fetch the last 10 minutes of events.
    const sinceTimestamp = since ? since.toISOString() : new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const response = await fetch(`${API_BASE_URL}/live_events?since=${sinceTimestamp}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch live events. Server responded with status: ${response.status}`);
    }
    return response.json();
};
