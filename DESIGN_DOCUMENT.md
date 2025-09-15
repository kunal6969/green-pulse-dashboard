# Green Pulse - Detailed Design Document

## Table of Contents
1. [System Overview](#1-system-overview)
2. [Architecture Design](#2-architecture-design)
3. [Component Specifications](#3-component-specifications)
4. [Data Flow Architecture](#4-data-flow-architecture)
5. [Machine Learning Pipeline](#5-machine-learning-pipeline)
6. [Database Design](#6-database-design)
7. [API Design](#7-api-design)
8. [Security Considerations](#8-security-considerations)
9. [Performance & Scalability](#9-performance--scalability)
10. [Key Design Decisions](#10-key-design-decisions)
11. [Assumptions & Constraints](#11-assumptions--constraints)
12. [Future Enhancements](#12-future-enhancements)

---

## 1. System Overview

### 1.1 Purpose
Green Pulse is an intelligent energy management dashboard designed to transform raw energy consumption data into actionable insights for facility managers and campus administrators. The system combines real-time monitoring, predictive analytics, and gamification elements to promote sustainable energy practices.

### 1.2 Scope
- **Primary Users**: Facility managers, campus administrators, energy analysts
- **Core Functionality**: Real-time monitoring, predictive forecasting, anomaly detection, performance gamification
- **Data Sources**: Building energy meters, weather data, building metadata
- **Output**: Interactive dashboards, automated reports, AI-powered recommendations

### 1.3 Key Success Metrics
- **Accuracy**: ML model prediction accuracy within 10-15% MAPE
- **Performance**: Sub-second response times for dashboard interactions
- **Usability**: Intuitive interface requiring minimal training
- **Engagement**: Active use of gamification features driving behavior change

---

## 2. Architecture Design

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Browser)                       │
├─────────────────────────────────────────────────────────────────┤
│  React 19 + TypeScript Frontend Application                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ Dashboard   │ │ Analytics   │ │ Forecasting │              │
│  │ Components  │ │ Components  │ │ Components  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ┌─────────────────────────────────────────────────────────────┤
│  │            SimulationContext (Global State)               │ │
│  └─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
                                │ HTTPS/REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  FastAPI Backend Server                                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ REST API    │ │ ML Model    │ │ Data        │              │
│  │ Endpoints   │ │ Integration │ │ Processing  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ SQLite      │ │ ML Models   │ │ External    │              │
│  │ Database    │ │ (H5/Joblib) │ │ APIs        │              │
│  │             │ │             │ │ (Gemini)    │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Frontend Stack
- **Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite 6.2.0
- **Styling**: Tailwind CSS with custom theme
- **State Management**: React Context API
- **Charting**: Recharts 3.2.0
- **Icons**: Lucide React 0.543.0
- **AI Integration**: Google GenAI 1.19.0

#### Backend Stack
- **Framework**: FastAPI (Python 3.8+)
- **ML Framework**: TensorFlow/Keras
- **Data Processing**: Pandas, NumPy
- **Database**: SQLite
- **Model Storage**: Joblib, HDF5
- **Server**: Uvicorn ASGI server

### 2.3 Deployment Architecture

#### Development Environment
```
Frontend (localhost:5173) ←→ Backend (localhost:8000) ←→ SQLite Database
                          ↓
                    Gemini API (External)
```

#### Production Environment
```
CDN/Static Hosting ←→ FastAPI Server (Render/AWS) ←→ Database
                              ↓
                        External APIs
```

---

## 3. Component Specifications

### 3.1 Frontend Component Architecture

#### 3.1.1 Layout Components
- **Header**: Navigation, building selector, time controls
- **Sidebar**: Main navigation menu
- **BuildingSelector**: Dynamic building selection with status indicators
- **TimeControl**: Simulation playback controls (play/pause/scrub)
- **SimulationSpeedControl**: Adjust simulation playback speed

#### 3.1.2 Dashboard Components
- **Dashboard**: Main orchestrating component
- **EnergyChart**: Primary line chart showing actual vs predicted consumption
- **BalanceCard**: KPI display for consumption metrics
- **BiometricsPanel**: Environmental parameter display
- **RecentTransactions**: Latest energy consumption events
- **MoneySpent**: Cost analysis and savings calculations

#### 3.1.3 Analytics Components
- **AnalyticsPage**: Historical data analysis interface
- **TimeRangeSelector**: Date range picker for analysis periods
- **TrendAnalysis**: Long-term consumption pattern visualization

#### 3.1.4 AI & Forecasting Components
- **AIInsightsPage**: Machine learning prediction interface
- **ForecastChart**: Future consumption predictions
- **ParameterAdjustment**: Interactive controls for scenario modeling
- **PredictionConfidence**: Model uncertainty visualization

#### 3.1.5 Gamification Components
- **RewardsPage**: Gamification hub
- **LiveLeaderboard**: Real-time building rankings
- **BadgesGallery**: Achievement system
- **ProgressTracker**: Individual building performance metrics
- **TaskList**: Energy-saving challenges

#### 3.1.6 Reporting Components
- **ReportsPage**: Report generation interface
- **ReportViewer**: Generated report display
- **PDFExporter**: Client-side PDF generation using jsPDF

#### 3.1.7 Chat Components
- **ChatbotWidget**: Persistent AI assistant
- **ChatMessage**: Individual message components
- **StreamingResponse**: Real-time AI response rendering

### 3.2 Backend Component Architecture

#### 3.2.1 API Layer (`main.py`)
- **FastAPI Application**: Main server application
- **CORS Middleware**: Cross-origin request handling
- **Route Handlers**: RESTful endpoint implementations
- **Request/Response Models**: Pydantic data validation

#### 3.2.2 ML Integration Layer (`interactive_gru_predictor.py`)
- **Model Loader**: TensorFlow model initialization
- **Prediction Engine**: Future usage forecasting
- **Parameter Sensitivity**: What-if scenario analysis
- **Data Preprocessing**: Feature scaling and encoding

#### 3.2.3 Data Access Layer
- **Database Connections**: SQLite connection management
- **Query Optimization**: Efficient data retrieval
- **Data Validation**: Input sanitization and validation

---

## 4. Data Flow Architecture

### 4.1 Frontend Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Action   │───▶│  Component      │───▶│ Context Update  │
│                 │    │  Event Handler  │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Re-render All   │◀───│   State         │◀───│  API Service    │
│ Subscribed      │    │   Management    │    │  Call           │
│ Components      │    │   (Context)     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

#### 4.1.1 SimulationContext Flow
1. **Initial Load**: Fetch building data via `dataService.fetchBuildingData()`
2. **Data Processing**: Transform raw API data into chart-ready format
3. **State Storage**: Store processed data in context state
4. **Component Subscription**: Components consume data through `useContext`
5. **Time Simulation**: Automatic time progression updates all subscribed components
6. **User Interactions**: Building selection, time changes trigger new API calls

#### 4.1.2 Component Communication Patterns

**Parent-Child Communication**:
```typescript
// Props down, callbacks up
<EnergyChart 
  data={energyData} 
  onTimeSelect={(time) => setSimulationTime(time)}
/>
```

**Sibling Communication**:
```typescript
// Through shared context
const { buildingData, simulationTime } = useContext(SimulationContext);
```

**Global State Updates**:
```typescript
// Context provider manages all shared state
const [buildingData, setBuildingData] = useState<EnergyDataPoint[]>([]);
const [simulationTime, setSimulationTime] = useState<Date>(new Date());
```

### 4.2 Backend Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  HTTP Request   │───▶│   FastAPI       │───▶│  Request        │
│  (Frontend)     │    │   Route Handler │    │  Validation     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  HTTP Response  │◀───│   Response      │◀───│  Business       │
│  (JSON)         │    │   Serialization │    │  Logic          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                               ┌─────────────────┐    ┌─────────────────┐
                               │  ML Model       │    │  Database       │
                               │  Prediction     │    │  Query          │
                               └─────────────────┘    └─────────────────┘
```

#### 4.2.1 API Request Processing
1. **Request Receipt**: FastAPI receives and validates incoming requests
2. **Route Matching**: URL routing to appropriate handler function
3. **Data Validation**: Pydantic models validate request payload
4. **Business Logic**: Core application logic execution
5. **Database Access**: SQLite queries for historical data
6. **ML Processing**: Model predictions for forecasting requests
7. **Response Formation**: JSON serialization and HTTP response

#### 4.2.2 ML Pipeline Integration
1. **Model Loading**: Load pre-trained GRU model and preprocessing artifacts
2. **Data Preparation**: Feature scaling, encoding, sequence preparation
3. **Prediction Generation**: Forward pass through neural network
4. **Post-processing**: Transform predictions back to original scale
5. **Response Formatting**: Structure predictions for API response

---

## 5. Machine Learning Pipeline

### 5.1 Model Architecture

#### 5.1.1 GRU Neural Network Design
```python
# Model Architecture (Inferred from artifacts)
Input Layer: (batch_size, sequence_length=24, features=15)
    ↓
GRU Layer(s): Hidden units, return sequences
    ↓
Dense Layer(s): Fully connected layers
    ↓
Output Layer: Single regression output (log-transformed energy consumption)
    ↓
Activation: Linear (regression output)
```

#### 5.1.2 Feature Engineering
**Input Features (15 total)**:
1. **Building Characteristics**: building_id, meter, site_id, primary_use, square_feet, year_built, floor_count
2. **Weather Parameters**: air_temperature, cloud_coverage, dew_temperature, sea_level_pressure, wind_speed  
3. **Temporal Features**: hour, day_of_week, month

**Target Variable**:
- **meter_reading**: Energy consumption (log-transformed for training)

#### 5.1.3 Data Preprocessing Pipeline
```python
# Preprocessing Steps
1. Label Encoding: primary_use (categorical → integer)
2. Feature Scaling: StandardScaler for all numerical features
3. Sequence Creation: Sliding window approach (24-hour sequences)
4. Log Transformation: np.log1p() for target variable
5. Inverse Transform: np.expm1() for predictions
```

### 5.2 Training Assumptions

#### 5.2.1 Data Quality Assumptions
- **Temporal Consistency**: Regular hourly measurements without significant gaps
- **Feature Completeness**: All 15 input features available for each timestamp
- **Data Validity**: Reasonable ranges for weather and building parameters
- **Label Accuracy**: Ground truth energy readings are accurate

#### 5.2.2 Model Performance Assumptions
- **Sequence Length**: 24 hours provides sufficient context for predictions
- **Prediction Horizon**: Model optimized for short-term forecasting (1-24 hours)
- **Feature Importance**: Weather and temporal features significantly impact consumption
- **Generalization**: Model performs well across different building types

### 5.3 Interactive Prediction Features

#### 5.3.1 Future Usage Prediction
```python
def predict_future_usage(model, scaler, le, building_history_df, 
                        features, user_params, predict_hours=6):
    """
    Generate future energy consumption predictions with user-defined parameters.
    
    Process:
    1. Load last 24 hours of building data
    2. Apply user parameter overrides
    3. Generate sequence predictions iteratively
    4. Update temporal features for each future hour
    5. Return timestamped predictions
    """
```

#### 5.3.2 Parameter Sensitivity Analysis
```python
def suggest_param_adjustment(model, scaler, le, building_history_df,
                           features, user_params, target_usage):
    """
    Suggest parameter adjustments to achieve target energy consumption.
    
    Process:
    1. Generate baseline prediction with current parameters
    2. Test parameter variations across plausible ranges
    3. Identify parameter values minimizing error to target
    4. Return optimal parameter suggestions
    """
```

---

## 6. Database Design

### 6.1 Database Schema

#### 6.1.1 Energy Data Table Structure
```sql
CREATE TABLE IF NOT EXISTS "energy_data" (
    "building_id" INTEGER,              -- Building identifier
    "meter" INTEGER,                    -- Meter type (0=electricity, 1=chilled water, etc.)
    "timestamp" TIMESTAMP,              -- Measurement timestamp (hourly)
    "meter_reading" REAL,               -- Actual energy consumption
    "site_id" INTEGER,                  -- Site identifier
    "primary_use" INTEGER,              -- Building use type (encoded)
    "square_feet" INTEGER,              -- Building size
    "year_built" REAL,                  -- Construction year
    "floor_count" REAL,                 -- Number of floors
    "air_temperature" REAL,             -- Weather: air temperature (°C)
    "cloud_coverage" REAL,              -- Weather: cloud coverage (0-9)
    "dew_temperature" REAL,             -- Weather: dew point (°C)
    "precip_depth_1_hr" REAL,          -- Weather: precipitation (mm)
    "sea_level_pressure" REAL,          -- Weather: pressure (hPa)
    "wind_direction" REAL,              -- Weather: wind direction (degrees)
    "wind_speed" REAL,                  -- Weather: wind speed (m/s)
    "hour" INTEGER,                     -- Temporal: hour of day (0-23)
    "day_of_week" INTEGER,              -- Temporal: day of week (0-6)
    "month" INTEGER,                    -- Temporal: month (1-12)
    "building_id_orig" INTEGER,         -- Original building ID (before processing)
    "predicted_meter_reading" REAL      -- ML model prediction
);
```

#### 6.1.2 Data Characteristics
- **Temporal Resolution**: Hourly measurements
- **Building Coverage**: Multiple buildings with unique IDs
- **Historical Depth**: Sufficient data for training and backtesting
- **Weather Integration**: Comprehensive weather parameter coverage
- **Prediction Storage**: Pre-computed ML predictions for comparison

### 6.2 Data Access Patterns

#### 6.2.1 Common Query Patterns
```sql
-- Building historical data
SELECT * FROM energy_data 
WHERE building_id = ? 
ORDER BY timestamp ASC;

-- Time-specific building breakdown
SELECT building_id, meter_reading, predicted_meter_reading
FROM energy_data 
WHERE timestamp = ?;

-- Recent data for sequence preparation
SELECT * FROM energy_data 
WHERE building_id = ? 
ORDER BY timestamp DESC 
LIMIT 24;
```

#### 6.2.2 Performance Considerations
- **Indexing**: Primary indexes on (building_id, timestamp)
- **Query Optimization**: Efficient temporal range queries
- **Data Volume**: Manageable size for SQLite deployment
- **Caching**: Potential for query result caching

---

## 7. API Design

### 7.1 RESTful Endpoint Design

#### 7.1.1 Core Data Endpoints
```python
# Building Data Retrieval
GET /building/{building_id}
Response: List[BuildingDataRecord]
Description: Complete historical energy data for specified building

# Leaderboard Data  
GET /leaderboard?time={iso_timestamp}
Response: List[BuildingCumulativeData]
Description: Building rankings based on cumulative savings at specified time

# Alert System
GET /alerts?time={iso_timestamp}
Response: List[Alert]
Description: Active alerts and anomalies at specified time

# Building Performance Breakdown
GET /building_breakdown?time={iso_timestamp}
Response: List[BuildingBreakdownData]
Description: Performance metrics for all buildings at specified time
```

#### 7.1.2 Machine Learning Endpoints
```python
# Future Usage Prediction
POST /predict_future_usage
Request: PredictRequest {
    building_id: int,
    user_params: Dict[str, Any],
    predict_hours: int = 24,
    seq_length: int = 24
}
Response: List[BuildingDataRecord]
Description: Generate future consumption predictions with custom parameters

# Parameter Optimization
POST /suggest_param_adjustment  
Request: SuggestRequest {
    building_id: int,
    user_params: Dict[str, Any],
    target_usage: float,
    param_candidates: List[str] = None,
    seq_length: int = 24
}
Response: Dict[str, float]
Description: Suggest parameter adjustments to achieve target consumption
```

### 7.2 Request/Response Patterns

#### 7.2.1 Data Validation
```python
# Pydantic Models for Type Safety
class PredictRequest(BaseModel):
    building_id: int
    user_params: Dict[str, Any]
    predict_hours: int = 24
    seq_length: int = 24

# Automatic validation and serialization
@app.post("/predict_future_usage")
def predict_future_usage_route(req: PredictRequest):
    # FastAPI handles validation automatically
    # Business logic implementation
```

#### 7.2.2 Error Handling
```python
# Consistent error responses
{
    "error": "Building not found",
    "detail": "No data available for building_id: 999",
    "status_code": 404
}

# Graceful degradation for missing data
def handle_missing_data(building_id):
    if not data_exists(building_id):
        return {"error": f"No data for building {building_id}"}
```

### 7.3 API Integration Patterns

#### 7.3.1 Frontend Service Layer
```typescript
// Centralized API client
export const fetchBuildingData = async (buildingId: number): Promise<BuildingDataRecord[]> => {
    const response = await fetch(`${API_BASE_URL}/building/${buildingId}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch building data: ${response.status}`);
    }
    return response.json();
};

// Error handling and retry logic
export const predictFutureUsage = async (data: PredictRequest): Promise<BuildingDataRecord[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/predict_future_usage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return await response.json();
    } catch (error) {
        // Centralized error handling
        throw new APIError('Prediction failed', error);
    }
};
```

---

## 8. Security Considerations

### 8.1 Authentication & Authorization
- **Current State**: No authentication implemented (demo system)
- **Production Requirements**: JWT-based authentication, role-based access control
- **API Security**: Rate limiting, request validation, CORS configuration

### 8.2 Data Security
- **Database**: Local SQLite file, no sensitive personal data
- **API Keys**: Environment variable storage for external services
- **Input Validation**: Pydantic models prevent injection attacks
- **HTTPS**: Required for production deployment

### 8.3 Privacy Considerations
- **Energy Data**: Aggregated building-level data, no individual user tracking
- **AI Services**: External API calls (Gemini) with data anonymization
- **Logging**: No sensitive data in application logs

---

## 9. Performance & Scalability

### 9.1 Frontend Performance

#### 9.1.1 Optimization Strategies
- **Code Splitting**: Vite-based lazy loading of route components
- **State Management**: Efficient Context API usage with selective subscriptions
- **Chart Performance**: Recharts with data sampling for large datasets
- **Memory Management**: Proper cleanup of intervals and event listeners

#### 9.1.2 User Experience Optimizations
```typescript
// Debounced API calls to prevent excessive requests
const debouncedFetch = useMemo(
    () => debounce((buildingId: number) => {
        fetchBuildingData(buildingId);
    }, 300),
    []
);

// Optimistic updates for better perceived performance
const updateSimulationTime = (newTime: Date) => {
    setSimulationTime(newTime); // Immediate UI update
    // Background data sync
};
```

### 9.2 Backend Performance

#### 9.2.1 Database Optimization
- **Query Performance**: Indexed columns for common queries
- **Connection Pooling**: SQLite connection management
- **Data Pagination**: Limit large result sets
- **Caching Strategy**: In-memory caching for frequently accessed data

#### 9.2.2 ML Model Performance
```python
# Model optimization strategies
1. Model Loading: Load once at startup, reuse across requests
2. Batch Prediction: Process multiple predictions efficiently
3. Feature Caching: Cache preprocessed features when possible
4. Memory Management: Efficient tensor operations
```

### 9.3 Scalability Considerations

#### 9.3.1 Current Limitations
- **Database**: SQLite suitable for demo, PostgreSQL needed for production
- **Concurrent Users**: Limited by SQLite's concurrent access capabilities  
- **Data Volume**: Current approach works for moderate dataset sizes
- **Geographic Distribution**: Single deployment region

#### 9.3.2 Scaling Strategies
```
Vertical Scaling:
- Larger server instances
- Enhanced database performance
- ML model optimization

Horizontal Scaling:
- Load balancing across multiple API servers
- Database sharding by building_id
- CDN for frontend assets
- Microservices architecture for ML pipeline
```

---

## 10. Key Design Decisions

### 10.1 Technology Choices

#### 10.1.1 Frontend Framework Selection
**Decision**: React 19 with TypeScript
**Rationale**: 
- Mature ecosystem with extensive component libraries
- Strong TypeScript integration for type safety
- Vite build tool for fast development experience
- Large community and extensive documentation

**Alternatives Considered**:
- Vue.js: Simpler learning curve but smaller ecosystem
- Angular: More opinionated but heavier framework
- Svelte: Better performance but smaller community

#### 10.1.2 Backend Framework Selection
**Decision**: FastAPI (Python)
**Rationale**:
- Excellent integration with ML/Data Science ecosystem
- Automatic API documentation generation
- Native async support for high performance
- Type validation through Pydantic models

**Alternatives Considered**:
- Django: More features but slower for API-only backends
- Flask: More flexible but requires more boilerplate
- Node.js: JavaScript consistency but weaker ML ecosystem

#### 10.1.3 Database Selection
**Decision**: SQLite
**Rationale**:
- Zero-configuration for development and demo
- File-based storage simplifies deployment
- Sufficient performance for current data volumes
- Easy migration path to PostgreSQL

**Alternatives Considered**:
- PostgreSQL: Better for production but more complex setup
- MongoDB: Good for unstructured data but overkill for time-series
- InfluxDB: Optimized for time-series but specialized learning curve

### 10.2 Architecture Decisions

#### 10.2.1 State Management Approach
**Decision**: React Context API
**Rationale**:
- Built-in solution, no external dependencies
- Sufficient for current application complexity
- Simple mental model for developers
- Easy to refactor to Redux if needed

**Trade-offs**:
- Pros: Simple, lightweight, integrated with React
- Cons: Can cause unnecessary re-renders if not optimized
- Mitigation: Careful context structure and selective subscriptions

#### 10.2.2 Time Simulation Architecture
**Decision**: Client-side simulation with backend data
**Rationale**:
- Smooth user experience with no network latency
- Complex interactions (play/pause/scrub) work seamlessly
- Reduces backend load for simulation features
- Enables offline-like experience once data is loaded

**Implementation Details**:
```typescript
// Central simulation loop with configurable speed
useEffect(() => {
    if (!isPaused && buildingData.length > 0) {
        intervalRef.current = setInterval(() => {
            advanceTime();
        }, simulationRate.intervalMs);
    }
    return () => clearInterval(intervalRef.current);
}, [isPaused, buildingData, simulationRate]);
```

#### 10.2.3 ML Model Integration Pattern
**Decision**: Server-side inference with client-side parameter adjustment
**Rationale**:
- Model complexity requires server-side execution
- Interactive parameter adjustment provides rich UX
- Separates concerns: UI handles interaction, backend handles computation
- Enables model updates without frontend changes

### 10.3 UX/UI Design Decisions

#### 10.3.1 Single Page Application Architecture
**Decision**: SPA with client-side routing
**Rationale**:
- Smooth navigation between different views
- Shared state across pages (building selection, time)
- Better performance after initial load
- Modern user expectations for web applications

#### 10.3.2 Real-time Visualization Approach
**Decision**: Time-based simulation rather than live streaming
**Rationale**:
- Historical data analysis is primary use case
- Simulation allows exploration of "what happened when"
- More educational value than simple live monitoring
- Enables scenario analysis and comparison

**Implementation**:
```typescript
// Time control enables analysis of historical patterns
const setSpecificTime = (time: Date) => {
    // Clamp to available data range
    let clampedTime = time;
    if (time < dataStartDate) clampedTime = dataStartDate;
    if (time > dataEndDate) clampedTime = dataEndDate;
    
    setSimulationTime(clampedTime);
    setIsPaused(true); // Always pause after manual change
};
```

---

## 11. Assumptions & Constraints

### 11.1 Data Assumptions

#### 11.1.1 Historical Data Quality
**Assumptions**:
- Energy meter readings are accurate and regularly collected
- Weather data corresponds to actual conditions at building locations
- Building metadata (square footage, year built, etc.) is current and accurate
- No significant gaps in the time series data

**Impact**: Model accuracy depends heavily on these assumptions
**Mitigation**: Data validation and preprocessing to handle missing values

#### 11.1.2 Building Behavior Assumptions
**Assumptions**:
- Building energy patterns follow predictable daily/weekly cycles
- Weather conditions significantly influence energy consumption
- Building characteristics remain relatively stable over time
- Past patterns are indicative of future behavior (for ML training)

### 11.2 Technical Constraints

#### 11.2.1 Performance Constraints
- **Browser Memory**: Large datasets may impact client-side performance
- **Network Latency**: API response times affect user experience
- **Database Size**: SQLite performance degrades with very large datasets
- **Model Inference**: GRU predictions require significant computation

#### 11.2.2 Deployment Constraints
- **Environment Variables**: API keys must be properly configured
- **File System**: Model files and database must be accessible
- **Network Access**: External API access required for AI features
- **Browser Compatibility**: Modern browser features required (ES2020+)

### 11.3 Business Constraints

#### 11.3.1 Scope Limitations
- **Demo System**: Not production-ready security or scalability
- **Sample Data**: Limited to available historical dataset
- **Single Tenant**: No multi-organization support
- **Limited Customization**: Fixed dashboard layout and metrics

#### 11.3.2 External Dependencies
- **Gemini API**: AI features depend on external service availability
- **Hosted Backend**: Production deployment requires cloud hosting
- **Model Updates**: ML model improvements require redeployment
- **Weather Data**: Predictions assume continued weather data availability

---

## 12. Future Enhancements

### 12.1 Short-term Improvements (1-3 months)

#### 12.1.1 Enhanced User Experience
- **Responsive Design**: Full mobile and tablet optimization
- **Advanced Filtering**: More granular data filtering options
- **Custom Dashboards**: User-configurable dashboard layouts
- **Export Features**: Additional export formats (Excel, CSV)

#### 12.1.2 Performance Optimizations
- **Data Virtualization**: Handle larger datasets efficiently
- **Caching Layer**: Redis-based caching for API responses
- **Database Migration**: PostgreSQL for better concurrent performance
- **CDN Integration**: Faster static asset delivery

### 12.2 Medium-term Enhancements (3-12 months)

#### 12.2.1 Advanced Analytics
- **Anomaly Detection**: Real-time anomaly identification algorithms
- **Cost Analytics**: Detailed cost analysis and optimization recommendations
- **Comparative Analysis**: Cross-building performance comparisons
- **Trend Analysis**: Long-term trend identification and forecasting

#### 12.2.2 Machine Learning Improvements
- **Model Ensemble**: Multiple models for improved prediction accuracy
- **Transfer Learning**: Adapt models to new buildings with limited data
- **Feature Engineering**: Automated feature discovery and selection
- **Model Interpretability**: Explain model predictions and feature importance

#### 12.2.3 Integration Capabilities
- **IoT Integration**: Direct connection to building management systems
- **Weather API**: Live weather data integration for real-time predictions
- **Alert Systems**: Email/SMS notifications for anomalies
- **Third-party Platforms**: Integration with existing facility management tools

### 12.3 Long-term Vision (1+ years)

#### 12.3.1 Advanced AI Features
- **Natural Language Queries**: Enhanced NLP for complex data questions
- **Automated Insights**: Proactive identification of optimization opportunities
- **Predictive Maintenance**: Equipment failure prediction based on energy patterns
- **Optimization Algorithms**: Automated parameter tuning for energy efficiency

#### 12.3.2 Platform Evolution
- **Multi-tenant Architecture**: Support for multiple organizations
- **Microservices Migration**: Scalable, distributed backend architecture
- **Edge Computing**: Local processing for reduced latency
- **Real-time Streaming**: Live data ingestion and processing

#### 12.3.3 Ecosystem Expansion
- **API Platform**: Public API for third-party integrations
- **Plugin Architecture**: Extensible system for custom modules
- **Marketplace**: Third-party widgets and analytics tools
- **Community Features**: User-generated content and best practices sharing

---

## Conclusion

Green Pulse represents a comprehensive approach to energy management through intelligent data visualization, machine learning-powered predictions, and user engagement strategies. The architecture balances current requirements with future scalability needs, while the component-based design enables incremental improvements and feature additions.

The system successfully demonstrates the integration of modern web technologies with advanced machine learning capabilities, creating an intuitive yet powerful platform for energy analytics and optimization.

Key architectural strengths include:
- **Scalable Component Design**: Modular frontend architecture supporting growth
- **Efficient State Management**: Centralized state with optimized data flow  
- **Robust ML Integration**: Seamless integration of complex AI models
- **User-Centric Design**: Intuitive interface with powerful underlying capabilities

This design document serves as both a technical specification and a roadmap for future development, ensuring the platform can evolve to meet changing user needs while maintaining architectural integrity.