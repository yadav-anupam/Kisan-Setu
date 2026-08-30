import joblib
import pandas as pd

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


waiting_time_model = joblib.load(
    "models/waiting_time_model.pkl"
)
queue_forecast_model = joblib.load(
    "models/queue_forecast_model.pkl"
)


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

    queue_length: int = Field(
        ge=0
    )

    active_counters: int = Field(
        ge=1,
        le=20
    )

    avg_service_time: float = Field(
        gt=0
    )

    appointments_next_hour: int = Field(
        ge=0
    )

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

    arrivals: int = Field(
        ge=0
    )

    served: int = Field(
        ge=0
    )

@app.get("/")
def home():

    return {
        "service": "Kisan Setu AI/ML API",
        "status": "running",
        "model": "Random Forest",
        "purpose": "Procurement waiting-time prediction"
    }



@app.get("/health")
def health():

    return {
        "status": "healthy",
        "model_loaded": True
    }



@app.post("/predict")
def predict_waiting_time(
    request: PredictionRequest
):

    input_data = pd.DataFrame([{
        "queue_length": request.queue_length,
        "active_counters": request.active_counters,
        "avg_service_time": request.avg_service_time,
        "appointments_next_hour": request.appointments_next_hour,
        "hour": request.hour,
        "day_of_week": request.day_of_week,
        "peak_hour": request.peak_hour
    }])


    prediction = waiting_time_model.predict(input_data)[0]


    if prediction < 15:

        status = "LOW"

    elif prediction < 30:

        status = "MEDIUM"

    elif prediction < 60:

        status = "HIGH"

    else:

        status = "CRITICAL"



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

        "predicted_waiting_time": round(
            float(prediction),
            2
        ),

        "queue_status": status,

        "recommendation": recommendation

    }
    
@app.post("/forecast")
def forecast_queue(
    request: ForecastRequest
):

    current_queue = request.queue_length

    current_hour = request.hour

    forecasts = {}

    queue = current_queue

    # Forecast 15, 30, 45 and 60 minutes
    for minutes in [15, 30, 45, 60]:

        # Approximate future hour
        future_hour = (
            current_hour + (minutes // 60)
        ) % 24

        input_data = pd.DataFrame([{
            "queue_length": queue,
            "active_counters": request.active_counters,
            "arrivals": request.arrivals,
            "served": request.served,
            "hour": future_hour,
            "day_of_week": request.day_of_week
        }])

        predicted_queue = queue_forecast_model.predict(
            input_data
        )[0]

        predicted_queue = max(
            1,
            round(float(predicted_queue))
        )

        forecasts[f"{minutes}_minutes"] = predicted_queue

        # Use prediction for next step
        queue = predicted_queue


    # Final predicted queue
    final_queue = forecasts["60_minutes"]


    # Determine overall trend
    if final_queue > current_queue + 5:

        trend = "INCREASING"

    elif final_queue < current_queue - 5:

        trend = "DECREASING"

    else:

        trend = "STABLE"


    # Determine risk
    if final_queue < 20:

        risk = "LOW"

    elif final_queue < 40:

        risk = "MEDIUM"

    elif final_queue < 60:

        risk = "HIGH"

    else:

        risk = "CRITICAL"


    return {

        "current_queue": current_queue,

        "forecast": forecasts,

        "trend": trend,

        "risk": risk

    }
    
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

@app.post("/ai/analyze")
def analyze_procurement_centre(
    request: AIAnalysisRequest
):

    # 1. Waiting time prediction

    waiting_input = pd.DataFrame([{
        "queue_length": request.queue_length,
        "active_counters": request.active_counters,
        "avg_service_time": request.avg_service_time,
        "appointments_next_hour": request.appointments_next_hour,
        "hour": request.hour,
        "day_of_week": request.day_of_week,
        "peak_hour": request.peak_hour
    }])

    predicted_waiting_time = waiting_time_model.predict(
        waiting_input
    )[0]

    predicted_waiting_time = round(
        float(predicted_waiting_time),
        2
    )


    # 2. Waiting time status

    if predicted_waiting_time < 15:
        waiting_status = "LOW"

    elif predicted_waiting_time < 30:
        waiting_status = "MEDIUM"

    elif predicted_waiting_time < 60:
        waiting_status = "HIGH"

    else:
        waiting_status = "CRITICAL"


    # 3. Queue forecasting

    current_queue = request.queue_length

    queue = current_queue

    forecasts = {}

    for minutes in [15, 30, 45, 60]:

        future_hour = (
            request.hour + (minutes // 60)
        ) % 24

        forecast_input = pd.DataFrame([{
            "queue_length": queue,
            "active_counters": request.active_counters,
            "arrivals": request.arrivals,
            "served": request.served,
            "hour": future_hour,
            "day_of_week": request.day_of_week
        }])

        predicted_queue = queue_forecast_model.predict(
            forecast_input
        )[0]

        predicted_queue = max(
            1,
            round(float(predicted_queue))
        )

        forecasts[f"{minutes}_minutes"] = predicted_queue

        queue = predicted_queue


    # 4. Trend

    final_queue = forecasts["60_minutes"]

    if final_queue > current_queue + 5:

        trend = "INCREASING"

    elif final_queue < current_queue - 5:

        trend = "DECREASING"

    else:

        trend = "STABLE"


    # 5. Risk

    if final_queue < 20:

        risk = "LOW"

    elif final_queue < 40:

        risk = "MEDIUM"

    elif final_queue < 60:

        risk = "HIGH"

    else:

        risk = "CRITICAL"


    # 6. Recommendation

    recommendation = generate_recommendation(

        waiting_time=predicted_waiting_time,

        queue_status=waiting_status,

        current_queue=current_queue,

        forecast=forecasts,

        trend=trend,

        risk=risk
    )


    # 7. Final response

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