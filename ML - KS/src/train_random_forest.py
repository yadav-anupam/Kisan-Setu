import pandas as pd
import joblib
import os

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


data = pd.read_csv("data/queue_data.csv")


features = [
    "queue_length",
    "active_counters",
    "avg_service_time",
    "appointments_next_hour",
    "hour",
    "day_of_week",
    "peak_hour"
]

X = data[features]

y = data["waiting_time"]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


model = RandomForestRegressor(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)


print("\nTraining Random Forest...")

model.fit(X_train, y_train)
os.makedirs("models", exist_ok=True)

joblib.dump(
    model,
    "models/waiting_time_model.pkl"
)

print("\nModel saved successfully!")


predictions = model.predict(X_test)


mae = mean_absolute_error(
    y_test,
    predictions
)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)


print("\nRandom Forest Performance")
print("---------------------------")
print(f"MAE  : {mae:.2f} minutes")
print(f"RMSE : {rmse:.2f} minutes")
print(f"R²   : {r2:.4f}")


print("\nSample Predictions")
print("---------------------------")

for actual, predicted in zip(
    y_test.iloc[:10],
    predictions[:10]
):
    print(
        f"Actual: {actual:.2f} min | "
        f"Predicted: {predicted:.2f} min"
    )


print("\nFeature Importance")
print("---------------------------")

importance = pd.Series(
    model.feature_importances_,
    index=features
).sort_values(ascending=False)

print(importance)