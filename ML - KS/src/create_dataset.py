import numpy as np
import pandas as pd

np.random.seed(42)

N = 10000

queue_length = np.random.randint(1, 81, N)

active_counters = np.random.randint(1, 6, N)

avg_service_time = np.round(
    np.random.uniform(4, 12, N),
    2
)

appointments_next_hour = np.random.randint(0, 21, N)

hour = np.random.randint(7, 19, N)

day_of_week = np.random.randint(0, 7, N)

peak_hour = (
    (hour >= 10) & (hour <= 13)
).astype(int)

# Estimate number of farmers ahead per counter
farmers_per_counter = queue_length / active_counters

# Base waiting time
waiting_time = (
    farmers_per_counter * avg_service_time * 0.65
)

# Upcoming appointments increase pressure
waiting_time += appointments_next_hour * 0.5

# Peak hours add some additional load
waiting_time += peak_hour * 4

# Small amount of natural variation
waiting_time += np.random.normal(0, 2, N)

# Keep waiting time realistic
waiting_time = np.clip(
    waiting_time,
    1,
    240
)

data = pd.DataFrame({
    "queue_length": queue_length,
    "active_counters": active_counters,
    "avg_service_time": avg_service_time,
    "appointments_next_hour": appointments_next_hour,
    "hour": hour,
    "day_of_week": day_of_week,
    "peak_hour": peak_hour,
    "waiting_time": np.round(waiting_time, 2)
})

data.to_csv(
    "data/queue_data.csv",
    index=False
)

print("Dataset created successfully!")
print(f"Number of records: {len(data)}")

print("\nFirst 5 records:")
print(data.head())

print("\nWaiting time statistics:")
print(data["waiting_time"].describe())