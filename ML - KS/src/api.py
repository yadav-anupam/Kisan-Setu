from fastapi import FastAPI
from pydantic import BaseModel, Field

from src.prediction import predict_waiting_time
from src.forecasting import forecast_queue
from src.recommendation import generate_recommendation


app = FastAPI(
    title="Kisan Setu AI/ML API",
    description="AI service for procurement centre queue prediction",
    version="1.0.0"
)


# ============================================================
# REQUEST MODELS
# ============================================================

class PredictionRequest(BaseModel):

    queue_length: int = Field(
        ge=0,
        description="Number of farmers currently in queue"
    )

    active_counters: int = Field(
        ge=1,
        le=20,
        description="Number of active procurement counters"
    )

    avg_service_time: float = Field(
        gt=0,
        description="Average service time per farmer in minutes"
    )

    appointments_next_hour: int = Field(
        ge=0,
        description="Expected appointments in the next hour"
    )

    hour: int = Field(
        ge=0,
        le=23,
        description="Current hour"
    )

    day_of_week: int = Field(
        ge=0,
        le=6,
        description="Day of week (0 = Sunday)"
    )

    peak_hour: int = Field(
        ge=0,
        le=1,
        description="Whether current time is peak hour"
    )


class ForecastRequest(BaseModel):

    queue_length: int = Field(
        ge=0,
        description="Current number of farmers in queue"
    )

    active_counters: int = Field(
        ge=1,
        le=20,
        description="Number of active counters"
    )

    arrivals: int = Field(
        ge=0,
        description="Expected farmer arrivals"
    )

    served: int = Field(
        ge=0,
        description="Farmers served during the current interval"
    )

    hour: int = Field(
        ge=0,
        le=23,
        description="Current hour"
    )

    day_of_week: int = Field(
        ge=0,
        le=6,
        description="Day of week"
    )


class AIAnalysisRequest(BaseModel):

    queue_length: int = Field(ge=0)

    active_counters: int = Field(
        ge=1,
        le=20
    )

    avg_service_time: float = Field(gt=0)

    appointments_next_hour: int = Field(ge=0)

    hour: int = Field(
        ge=0,
        le=23
    )

    day_of_week: int = Field(
        ge=0,
        le=6
    )

    peak_hour: int = Field(
        ge=0,
        le=1
    )

    arrivals: int = Field(ge=0)

    served: int = Field(ge=0)


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "service": "Kisan Setu AI/ML API",
        "status": "running",
        "model": "Random Forest",
        "purpose": "Procurement waiting-time prediction"
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True
    }


# ============================================================
# WAITING TIME PREDICTION
# ============================================================

@app.post("/predict")
def predict_waiting_time_api(
    request: PredictionRequest
):

    prediction, status = predict_waiting_time(
        queue_length=request.queue_length,
        active_counters=request.active_counters,
        avg_service_time=request.avg_service_time,
        appointments_next_hour=request.appointments_next_hour,
        hour=request.hour,
        day_of_week=request.day_of_week,
        peak_hour=request.peak_hour
    )


    if status == "LOW":

        recommendation = (
            "Good time to visit. "
            "Queue is currently low."
        )

    elif status == "MEDIUM":

        recommendation = (
            "Moderate waiting time expected. "
            "Normal processing conditions."
        )

    elif status == "HIGH":

        recommendation = (
            "High waiting time expected. "
            "Consider visiting during a less busy period."
        )

    else:

        recommendation = (
            "Very high waiting time expected. "
            "Consider visiting another time or "
            "another nearby procurement centre."
        )


    return {
        "predicted_waiting_time": prediction,
        "queue_status": status,
        "recommendation": recommendation
    }


# ============================================================
# QUEUE FORECAST
# ============================================================

@app.post("/forecast")
def forecast_queue_api(
    request: ForecastRequest
):

    result = forecast_queue(
        queue_length=request.queue_length,
        active_counters=request.active_counters,
        arrivals=request.arrivals,
        served=request.served,
        hour=request.hour,
        day_of_week=request.day_of_week
    )

    return result


# ============================================================
# RECOMMENDATION
# ============================================================

@app.post("/recommend")
def recommendation(
    waiting_time: float,
    queue_status: str,
    current_queue: int,
    forecast: dict,
    trend: str,
    risk: str
):

    result = generate_recommendation(
        waiting_time=waiting_time,
        queue_status=queue_status,
        current_queue=current_queue,
        forecast=forecast,
        trend=trend,
        risk=risk
    )

    return result


# ============================================================
# COMPLETE AI ANALYSIS
# ============================================================

@app.post("/ai/analyze")
def analyze_procurement_centre(
    request: AIAnalysisRequest
):

    # --------------------------------------------------------
    # 1. Waiting time prediction
    # --------------------------------------------------------

    predicted_waiting_time, waiting_status = predict_waiting_time(
        queue_length=request.queue_length,
        active_counters=request.active_counters,
        avg_service_time=request.avg_service_time,
        appointments_next_hour=request.appointments_next_hour,
        hour=request.hour,
        day_of_week=request.day_of_week,
        peak_hour=request.peak_hour
    )


    # --------------------------------------------------------
    # 2. Queue forecasting
    # --------------------------------------------------------

    queue_result = forecast_queue(
        queue_length=request.queue_length,
        active_counters=request.active_counters,
        arrivals=request.arrivals,
        served=request.served,
        hour=request.hour,
        day_of_week=request.day_of_week
    )


    current_queue = queue_result["current_queue"]

    forecasts = queue_result["forecast"]

    trend = queue_result["trend"]

    risk = queue_result["risk"]


    # --------------------------------------------------------
    # 3. Recommendation
    # --------------------------------------------------------

    recommendation = generate_recommendation(
        waiting_time=predicted_waiting_time,
        queue_status=waiting_status,
        current_queue=current_queue,
        forecast=forecasts,
        trend=trend,
        risk=risk
    )


    # --------------------------------------------------------
    # 4. Final response
    # --------------------------------------------------------

    return {

        "waiting_time": {

            "minutes": predicted_waiting_time,

            "status": waiting_status

        },

        "queue_forecast": {

            "current": current_queue,

            "15_minutes": forecasts["15_minutes"],

            "30_minutes": forecasts["30_minutes"],

            "45_minutes": forecasts["45_minutes"],

            "60_minutes": forecasts["60_minutes"],

            "trend": trend,

            "risk": risk

        },

        "recommendation": recommendation
    }