# Green Pulse - Docker Deployment Guide

## Quick Start with Docker

### Prerequisites
- Docker (version 20.0+)
- Docker Compose (version 2.0+)

### Single Command Deployment

1. **Clone or download the repository**
2. **Navigate to the project root directory**
3. **Run the complete application:**

```bash
docker-compose up --build
```

This single command will:
- Build both frontend and backend Docker images
- Start all services with proper networking
- Make the application available at:
  - **Frontend**: http://localhost
  - **Backend API**: http://localhost:8000
  - **API Documentation**: http://localhost:8000/docs

### Individual Service Commands

#### Backend Only
```bash
# Build and run backend
docker-compose up --build backend

# Access API at http://localhost:8000
```

#### Frontend Only (requires backend running)
```bash
# Build and run frontend
docker-compose up --build frontend

# Access app at http://localhost
```

### Production Deployment

#### Environment Configuration
Create a `.env` file in the project root:

```env
# Backend Configuration
PYTHONPATH=/app
PYTHONUNBUFFERED=1

# Frontend Configuration  
VITE_API_BASE_URL=http://your-domain.com:8000

# Gemini AI API Key (optional)
API_KEY=your_gemini_api_key_here
```

#### Production Docker Compose
```bash
# Production deployment with environment files
docker-compose -f docker-compose.yml --env-file .env up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### Docker Commands Reference

```bash
# Build without cache
docker-compose build --no-cache

# Run in detached mode
docker-compose up -d

# Stop all services
docker-compose down

# Remove all containers and volumes
docker-compose down -v

# View service logs
docker-compose logs <service-name>

# Access container shell
docker-compose exec backend bash
docker-compose exec frontend sh
```

### Troubleshooting

#### Common Issues

1. **Port Already in Use**
   ```bash
   # Change ports in docker-compose.yml
   ports:
     - "3000:80"  # Frontend
     - "8001:8000"  # Backend
   ```

2. **Model Files Not Found**
   ```bash
   # Ensure model files are in the correct location
   ls green_pulse_backend/model/
   # Should show: gru_model2.h5, scaler2.joblib, le.joblib
   ```

3. **Database Connection Issues**
   ```bash
   # Check if database file exists
   ls green_pulse_backend/gru_predictions.sqlite
   ```

4. **API Connection Failed**
   - Update `VITE_API_BASE_URL` in frontend environment
   - Ensure backend is healthy: `curl http://localhost:8000/docs`

#### Health Checks
```bash
# Check service health
docker-compose ps

# Backend health
curl http://localhost:8000/docs

# Frontend health  
curl http://localhost

# View container logs
docker-compose logs backend
docker-compose logs frontend
```

### Development with Docker

#### Hot Reload Development
For development with file watching:

```yaml
# Add to docker-compose.override.yml
version: '3.8'
services:
  backend:
    volumes:
      - ./green_pulse_backend:/app
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    
  frontend:
    volumes:
      - ./green-pulse-frontend:/app
      - /app/node_modules
    command: npm run dev
```

#### Database Management
```bash
# Access database directly
docker-compose exec backend sqlite3 /app/gru_predictions.sqlite

# Backup database
docker-compose exec backend cp /app/gru_predictions.sqlite /app/backup.sqlite
```

### Scaling and Load Balancing

#### Multiple Backend Instances
```yaml
services:
  backend:
    deploy:
      replicas: 3
  
  nginx-lb:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
```

### Monitoring and Logging

#### Service Monitoring
```bash
# Monitor resource usage
docker stats

# View real-time logs
docker-compose logs -f --tail=100

# Export logs
docker-compose logs > application.log
```

This Docker setup provides a complete, containerized deployment of the Green Pulse application with minimal configuration required.