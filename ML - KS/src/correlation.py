import pandas as pd
import matplotlib.pyplot as plt

data = pd.read_csv("data/queue_data.csv")

correlation = data.corr(numeric_only=True)

print("Correlation with Waiting Time:")
print(correlation["waiting_time"].sort_values(ascending=False))

plt.figure(figsize=(10, 7))

plt.imshow(correlation, cmap="coolwarm", aspect="auto")
plt.colorbar()

plt.xticks(
    range(len(correlation.columns)),
    correlation.columns,
    rotation=45,
    ha="right"
)

plt.yticks(
    range(len(correlation.columns)),
    correlation.columns
)

plt.title("Feature Correlation Matrix")

plt.tight_layout()
plt.show()