import joblib
import pandas as pd


# Load trained model
model = joblib.load("models/waiting_time_model.pkl")

print("Model loaded successfully!")


# Current procurement centre data
input_data = pd.DataFrame([{
    "queue_length": 42,
    "active_counters": 3,
    "avg_service_time": 8.0,
    "appointments_next_hour": 10,
    "hour": 11,
    "day_of_week": 1,
    "peak_hour": 1
}])


# Predict waiting time
prediction = model.predict(input_data)[0]


# Determine queue status
if prediction < 15:
    status = "LOW"
elif prediction < 30:
    status = "MEDIUM"
elif prediction < 60:
    status = "HIGH"
else:
    status = "CRITICAL"


print("\nKisan Setu Prediction")
print("---------------------------")
print(f"Estimated Waiting Time: {prediction:.2f} minutes")
print(f"Queue Status: {status}")