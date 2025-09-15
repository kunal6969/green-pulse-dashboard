export interface BuildingDataRecord {
  timestamp: string;
  meter_reading: number | null;
  predicted_meter_reading?: number | null;
  building_id: number;
  meter: number;
  site_id: number;
  primary_use: string;
  square_feet: number;
  year_built: number;
  floor_count: number | null;
  air_temperature: number;
  cloud_coverage: number;
  dew_temperature: number;
  sea_level_pressure: number | null;
  wind_speed: number;
  hour: number;
  day_of_week: number;
  month: number;
}


export interface EnergyDataPoint {
  time: string;
  actual: number | null;
  predicted: number | null;
  historical?: Date;
}

export interface Alert {
  id: string;
  timestamp: string;
  severity: 'high' | 'medium' | 'low';
  building: string;
  description: string;
}

export interface Anomaly {
    id: string;
    timestamp: string;
    building: string;
    device: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    deviation: number;
    data: { time: string; actual: number | null; predicted: number | null }[];
}

export interface LiveEvent {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  device: string;
  message: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  score: number;
  rankChange: 'up' | 'down' | 'stable';
}

export interface ReportSummary {
  startDate: string;
  endDate: string;
  totalActualKwh: number;
  totalPredictedKwh: number;
  netSavingsKwh: number;
  peakConsumption: { value: number; time: string; };
  lowestConsumption: { value: number; time: string; };
  anomalyCount: number;
  buildingId: number;
}
// FIX: Added ChatMessage interface to be used by the ChatbotWidget.
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}
