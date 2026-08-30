import joblib
import pandas as pd

from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


data = pd.read_csv(
    "data/queue_history.csv"
)


features = [
    "queue_length",
    "active_counters",
    "arrivals",
    "served",
    "hour",
    "day_of_week"
]


X = data[features]

y = data["queue_next"]


# IMPORTANT:
# Use chronological split instead of random split.

split_index = int(
    len(data) * 0.80
)

X_train = X.iloc[:split_index]
X_test = X.iloc[split_index:]

y_train = y.iloc[:split_index]
y_test = y.iloc[split_index:]


print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


model = RandomForestRegressor(
    n_estimators=200,
    random_state=42,
    n_jobs=-1
)


print("\nTraining queue forecasting model...")

model.fit(
    X_train,
    y_train
)

print("Training completed!")


predictions = model.predict(
    X_test
)


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


print("\nQueue Forecast Performance")
print("---------------------------")

print(
    f"MAE  : {mae:.2f} farmers"
)

print(
    f"RMSE : {rmse:.2f} farmers"
)

print(
    f"R²   : {r2:.4f}"
)


# Save model

joblib.dump(
    model,
    "models/queue_forecast_model.pkl"
)

print(
    "\nQueue forecast model saved successfully!"
)


print("\nFeature Importance")

importance = pd.Series(
    model.feature_importances_,
    index=features
).sort_values(
    ascending=False
)

print(importance)