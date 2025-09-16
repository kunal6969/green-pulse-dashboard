# Green Pulse - Intelligent Energy Management Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)

Green Pulse is a sophisticated, real-time energy monitoring and management web application designed for facility managers and campus administrators. It transforms raw energy data into actionable insights through data visualization, predictive analytics using GRU neural networks, and gamification elements to promote sustainable energy practices.

The website takes 2-5 minutes in the starting to load the data from the backend because the backend of the website is being hosted on render which has a cooldown period of 15 minutes.

## 🌟 Key Features

### 🎯 Core Functionality
- **Real-time Energy Monitoring**: Live dashboard with KPIs including consumption, savings, carbon footprint, and anomaly alerts
- **Time-Series Simulation**: Interactive time control system allowing users to play, pause, and scrub through historical data
- **AI-Powered Forecasting**: GRU-based machine learning model for energy usage prediction and "what-if" scenario analysis
- **Comprehensive Analytics**: Deep dive into historical data with multiple time range selections and trend analysis

### 🤖 AI & Machine Learning
- **GRU Neural Network**: Advanced recurrent neural network for time-series energy prediction
- **Interactive Predictions**: Real-time parameter adjustment for custom forecasting scenarios
- **Anomaly Detection**: Automated identification of unusual energy consumption patterns
- **Natural Language AI Consultation**: Gemini AI-powered insights and recommendations

### 🎮 Gamification & Engagement
- **Live Leaderboard**: Dynamic ranking system based on energy savings vs. predictions
- **Badges & Achievements**: Milestone tracking and reward system for energy conservation
- **Progress Tracking**: Building-specific performance metrics and competitive analysis

### 📊 Reporting & Analysis
- **Automated Reports**: Comprehensive performance summaries with statistical highlights
- **AI-Powered Consultation**: Natural language insights and actionable recommendations
- **PDF Export**: Professional report generation for stakeholders
- **Interactive Chatbot**: Context-aware AI assistant for data queries and insights

## 🏗️ Architecture Overview

### Frontend Architecture
- **Framework**: React 19.1.1 with TypeScript
- **Styling**: Tailwind CSS with custom theme system
- **State Management**: React Context API with centralized SimulationContext
- **Charting**: Recharts for interactive data visualizations
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Framework**: FastAPI (Python) for high-performance REST API
- **Database**: SQLite with time-series energy data storage
- **Machine Learning**: TensorFlow/Keras GRU model with scikit-learn preprocessing
- **AI Integration**: Google Gemini API for natural language processing

## 📁 Project Structure

```
GREEN PULSE PROJECT/
├── green-pulse-frontend/           # React Frontend Application
│   ├── components/                 # React Components
│   │   ├── dashboard/             # Main dashboard components
│   │   ├── analytics/             # Data analysis components
│   │   ├── ai-insights/           # AI forecasting components
│   │   ├── rewards/               # Gamification components
│   │   ├── reports/               # Report generation components
│   │   ├── chat/                  # Chatbot widget
│   │   ├── layout/                # Layout and navigation
│   │   └── ui/                    # Reusable UI components
│   ├── contexts/                  # React Context providers
│   ├── services/                  # API and external service clients
│   ├── hooks/                     # Custom React hooks
│   ├── utils/                     # Utility functions
│   └── types.ts                   # TypeScript type definitions
├── green_pulse_backend/           # Python Backend API
│   ├── main.py                    # FastAPI application entry point
│   ├── interactive_gru_predictor.py # ML model prediction logic
│   ├── gru_predictions.sqlite     # SQLite database with energy data
│   └── model/                     # Trained ML model artifacts
│       ├── gru_model2.h5         # Trained GRU neural network
│       ├── scaler2.joblib         # Feature scaling transformer
│       └── le.joblib              # Label encoder for categorical data
└── docs/                          # Documentation and assets
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+ recommended)
- **Python** (3.8+ required)
- **SQLite** (included with Python)
- **Git** for version control

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd green-pulse-frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the frontend root:
   ```env
   API_KEY=your_gemini_api_key_here
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd green_pulse_backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install fastapi uvicorn pandas numpy sqlite3 tensorflow scikit-learn joblib
   ```

4. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`
   Interactive API documentation: `http://localhost:8000/docs`

### Database Setup

The SQLite database (`gru_predictions.sqlite`) comes pre-populated with sample energy data. The database contains:

- **energy_data table**: Time-series energy consumption data with weather parameters
- **Columns**: building_id, timestamp, meter_reading, predicted_meter_reading, weather data, and building metadata

## 🔧 Tech Stack

### Frontend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | Core UI framework |
| TypeScript | 5.8.2 | Type safety and development experience |
| Vite | 6.2.0 | Build tool and development server |
| Tailwind CSS | Latest | Utility-first CSS framework |
| Recharts | 3.2.0 | Interactive charts and visualizations |
| Lucide React | 0.543.0 | Icon library |
| Google GenAI | 1.19.0 | Gemini API integration |

### Backend Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | Latest | High-performance web framework |
| Python | 3.8+ | Core backend language |
| TensorFlow/Keras | Latest | Machine learning framework |
| SQLite | Latest | Lightweight database |
| Pandas | Latest | Data manipulation and analysis |
| NumPy | Latest | Numerical computing |
| Scikit-learn | Latest | ML preprocessing and utilities |
| Joblib | Latest | Model serialization |

## 🤖 Machine Learning Model

### GRU Neural Network Architecture
The system uses a Gated Recurrent Unit (GRU) neural network for time-series energy prediction:

- **Model Type**: GRU (Gated Recurrent Unit)
- **Input Features**: 15 features including building characteristics, weather data, and temporal features
- **Sequence Length**: 24 hours (configurable)
- **Output**: Single energy consumption prediction
- **Training**: Pre-trained on historical building energy data

### Key Features Used by the Model
1. **Building Characteristics**: ID, meter type, site ID, primary use, square feet, year built, floor count
2. **Weather Parameters**: Air temperature, cloud coverage, dew temperature, sea level pressure, wind speed
3. **Temporal Features**: Hour of day, day of week, month

### Model Capabilities
- **Future Usage Prediction**: Generate forecasts for customizable time horizons
- **Parameter Sensitivity Analysis**: "What-if" scenarios by adjusting environmental parameters
- **Real-time Inference**: Fast predictions suitable for interactive web applications

## 🌐 API Endpoints

### Core Data Endpoints
- `GET /building/{building_id}` - Retrieve all energy data for a specific building
- `POST /predict_future_usage` - Generate future energy consumption predictions
- `POST /suggest_param_adjustment` - Get parameter recommendations for target usage

### Frontend-Backend Integration
The frontend communicates with the backend through a well-defined REST API:

1. **Data Fetching**: Retrieval of historical energy data and real-time metrics
2. **ML Predictions**: Interactive forecasting with user-defined parameters
3. **Analytics**: Complex aggregations and statistical analysis
4. **Gamification**: Leaderboard calculations and performance metrics

## 🎯 Usage Guide

### 1. Landing Page
- Clean, professional landing page with feature highlights
- "Get Started" button leads to the main dashboard
- Overview of key capabilities and benefits

### 2. Main Dashboard
- **Building Selector**: Choose from available buildings in the system
- **Time Controls**: Play/pause simulation and adjust playback speed
- **KPI Cards**: Live consumption, net savings, carbon footprint
- **Energy Chart**: Real-time visualization of actual vs. predicted usage
- **Recent Alerts**: Latest anomalies and system notifications

### 3. Analytics Deep Dive
- **Time Range Selection**: Analyze data over different periods (24h, 7d, 30d)
- **Historical Trends**: Detailed charts showing consumption patterns
- **Anomaly Identification**: Highlight unusual consumption events
- **Statistical Summary**: Key metrics and performance indicators

### 4. AI-Powered Forecasting
- **Baseline Predictions**: View model-generated forecasts
- **Interactive Parameters**: Adjust weather and building parameters
- **Custom Scenarios**: Run "what-if" analyses with different conditions
- **Prediction Confidence**: Understand model certainty and limitations

### 5. Gamification & Rewards
- **Live Leaderboard**: Real-time ranking of buildings by energy efficiency
- **Badge System**: Unlock achievements for energy saving milestones
- **Progress Tracking**: Monitor improvement over time
- **Competitive Analytics**: Compare performance against other buildings

### 6. Automated Reporting
- **Date Range Selection**: Generate reports for specific periods
- **Comprehensive Analysis**: Charts, statistics, and data logs
- **AI Consultation**: Gemini-powered insights and recommendations
- **PDF Export**: Download professional reports for stakeholders

### 7. AI Chatbot Assistant
- **Natural Language Queries**: Ask questions about energy data
- **Context-Aware Responses**: Answers based on current building selection
- **Streaming Responses**: Real-time AI conversation
- **Data Insights**: Get explanations and recommendations

## 🔒 Configuration Settings

### Environment Variables

#### Frontend (.env)
```env
# Google Gemini API Key for AI features
API_KEY=your_gemini_api_key_here

# Backend API URL (optional, defaults to https://green-pulse.onrender.com)
VITE_API_BASE_URL=http://localhost:8000
```

#### Backend Environment
```python
# Database path (automatically configured)
DB_PATH = './gru_predictions.sqlite'

# Model directory (automatically configured)
MODEL_DIR = './model'

# CORS settings (configured for cross-origin requests)
CORS_ORIGINS = ["*"]  # Configure for production
```

### Deployment Configuration

#### Frontend Production Build
```bash
npm run build
```
Generates optimized static files in the `dist/` directory.

#### Backend Production Deployment
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 🧪 Development

### Frontend Development
```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Development
```bash
# Start with auto-reload for development
uvicorn main:app --reload

# Run with specific host and port
uvicorn main:app --host 0.0.0.0 --port 8000
```

### Code Quality
- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting and style consistency
- **Component Architecture**: Modular, reusable component design
- **API Design**: RESTful endpoints with clear documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@greenpulse.com or create an issue in the GitHub repository.

## 🙏 Acknowledgments

- **TensorFlow/Keras** for the machine learning framework
- **FastAPI** for the high-performance backend framework
- **React** team for the excellent frontend framework
- **Google Gemini** for AI consultation capabilities
- **Recharts** for beautiful data visualizations

---

**Green Pulse Dashboard** - Transforming Energy Data into Actionable Insights 🌱⚡
