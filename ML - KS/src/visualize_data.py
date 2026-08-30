import pandas as pd
import matplotlib.pyplot as plt

data = pd.read_csv("data/queue_data.csv")

# Queue length vs waiting time
plt.figure(figsize=(8, 5))
plt.scatter(data["queue_length"], data["waiting_time"], alpha=0.3)
plt.xlabel("Queue Length")
plt.ylabel("Waiting Time (minutes)")
plt.title("Queue Length vs Waiting Time")
plt.show()