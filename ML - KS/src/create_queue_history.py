import numpy as np
import pandas as pd


np.random.seed(42)


# --------------------------------------------------
# Configuration
# --------------------------------------------------

N = 15000

timestamps = pd.date_range(
    start="2026-01-01",
    periods=N,
    freq="15min"
)


# --------------------------------------------------
# Time features
# --------------------------------------------------

hour = timestamps.hour

day_of_week = timestamps.dayofweek


# --------------------------------------------------
# Generate realistic queue evolution
# --------------------------------------------------

queue = 20

records = []


for i in range(N):

    current_hour = hour[i]
    current_day = day_of_week[i]


    # Demand increases during busy hours

    if 9 <= current_hour <= 12:

        arrival_rate = 18

    elif 13 <= current_hour <= 16:

        arrival_rate = 15

    elif 17 <= current_hour <= 19:

        arrival_rate = 12

    else:

        arrival_rate = 6


    # Slightly higher demand on weekdays

    if current_day < 5:

        arrival_rate += 3


    arrivals = max(
        0,
        int(
            np.random.normal(
                arrival_rate,
                4
            )
        )
    )


    # Number of active counters

    active_counters = np.random.randint(
        2,
        6
    )


    # Each counter can serve several farmers
    # during a 15-minute period

    service_per_counter = np.random.randint(
        4,
        8
    )


    served = (
        active_counters
        * service_per_counter
    )


    # Small random fluctuation

    noise = np.random.normal(
        0,
        2
    )


    # Calculate next queue

    next_queue = (
        queue
        + arrivals
        - served
        + noise
    )


    next_queue = int(
        np.clip(
            next_queue,
            1,
            100
        )
    )


    records.append({

        "timestamp": timestamps[i],

        "queue_length": queue,

        "active_counters": active_counters,

        "arrivals": arrivals,

        "served": served,

        "hour": current_hour,

        "day_of_week": current_day,

        "queue_next": next_queue

    })


    # Next timestep becomes current queue

    queue = next_queue


# --------------------------------------------------
# Create DataFrame
# --------------------------------------------------

data = pd.DataFrame(records)


# --------------------------------------------------
# Save dataset
# --------------------------------------------------

data.to_csv(
    "data/queue_history.csv",
    index=False
)


print("Queue history dataset created!")

print(
    f"Records: {len(data)}"
)


print("\nFirst 10 records:")

print(
    data.head(10)
)


print("\nDataset statistics:")

print(
    data.describe()
)