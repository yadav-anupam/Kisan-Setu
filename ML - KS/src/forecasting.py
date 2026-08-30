import joblib
import pandas as pd


MODEL_PATH = "models/queue_forecast_model.pkl"


queue_forecast_model = joblib.load(MODEL_PATH)


def forecast_queue(
    queue_length,
    active_counters,
    arrivals,
    served,
    hour,
    day_of_week
):

    current_queue = queue_length

    queue = current_queue

    forecasts = {}

    for minutes in [15, 30, 45, 60]:

        future_hour = (
            hour + (minutes // 60)
        ) % 24

        input_data = pd.DataFrame([{
            "queue_length": queue,
            "active_counters": active_counters,
            "arrivals": arrivals,
            "served": served,
            "hour": future_hour,
            "day_of_week": day_of_week
        }])

        predicted_queue = queue_forecast_model.predict(
            input_data
        )[0]

        predicted_queue = max(
            1,
            round(float(predicted_queue))
        )

        forecasts[f"{minutes}_minutes"] = predicted_queue

        queue = predicted_queue

    final_queue = forecasts["60_minutes"]

    if final_queue > current_queue + 5:
        trend = "INCREASING"

    elif final_queue < current_queue - 5:
        trend = "DECREASING"

    else:
        trend = "STABLE"

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