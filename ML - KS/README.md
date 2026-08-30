# Kisan Setu AI/ML Service

AI/ML service for the Kisan Setu procurement-centre platform.

The service predicts:

- Farmer waiting time
- Future queue size
- Queue trend
- Queue risk
- Recommended farmer action

## Tech Stack

- Python
- FastAPI
- Scikit-learn
- Pandas
- NumPy
- Random Forest
- Pytest
- Uvicorn

## ML Models

### 1. Waiting Time Prediction

Predicts the estimated waiting time for a farmer.

Features:

- queue_length
- active_counters
- avg_service_time
- appointments_next_hour
- hour
- day_of_week
- peak_hour

Model:

Random Forest Regressor

### 2. Queue Forecasting

Predicts future queue size.

Features:

- queue_length
- active_counters
- arrivals
- served
- hour
- day_of_week

Forecast horizons:

- 15 minutes
- 30 minutes
- 45 minutes
- 60 minutes

## API

Start the service:

```bash
python -m uvicorn src.api:app --reload