import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


# Load dataset
data = pd.read_csv("data/queue_data.csv")


# Features
X = data[
    [
        "queue_length",
        "active_counters",
        "avg_service_time",
        "appointments_next_hour",
        "hour",
        "day_of_week",
        "peak_hour"
    ]
]


# Target
y = data["waiting_time"]


# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42
)


print("Training samples:", len(X_train))
print("Testing samples:", len(X_test))


# Create model
model = LinearRegression()


# Train model
model.fit(X_train, y_train)


# Make predictions
predictions = model.predict(X_test)


# Evaluate model
mae = mean_absolute_error(y_test, predictions)

rmse = mean_squared_error(
    y_test,
    predictions
) ** 0.5

r2 = r2_score(
    y_test,
    predictions
)


print("\nModel Performance")
print("---------------------------")
print(f"MAE  : {mae:.2f} minutes")
print(f"RMSE : {rmse:.2f} minutes")
print(f"R²   : {r2:.4f}")


# Show some predictions
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