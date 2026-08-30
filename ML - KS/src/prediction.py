import joblib
import pandas as pd


MODEL_PATH = "models/waiting_time_model.pkl"


waiting_time_model = joblib.load(MODEL_PATH)


def get_waiting_status(waiting_time):

    if waiting_time < 15:
        return "LOW"

    elif waiting_time < 30:
        return "MEDIUM"

    elif waiting_time < 60:
        return "HIGH"

    else:
        return "CRITICAL"


def predict_waiting_time(
    queue_length,
    active_counters,
    avg_service_time,
    appointments_next_hour,
    hour,
    day_of_week,
    peak_hour
):

    input_data = pd.DataFrame([{
        "queue_length": queue_length,
        "active_counters": active_counters,
        "avg_service_time": avg_service_time,
        "appointments_next_hour": appointments_next_hour,
        "hour": hour,
        "day_of_week": day_of_week,
        "peak_hour": peak_hour
    }])

    prediction = waiting_time_model.predict(input_data)[0]

    prediction = round(float(prediction), 2)

    status = get_waiting_status(prediction)

    return prediction, status