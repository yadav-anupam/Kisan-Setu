from fastapi.testclient import TestClient

from src.api import app


client = TestClient(app)


def test_health():

    response = client.get("/health")

    assert response.status_code == 200

    data = response.json()

    assert data["status"] == "healthy"
    assert data["model_loaded"] is True


def test_predict():

    payload = {
        "queue_length": 42,
        "active_counters": 3,
        "avg_service_time": 8,
        "appointments_next_hour": 10,
        "hour": 11,
        "day_of_week": 1,
        "peak_hour": 1
    }

    response = client.post(
        "/predict",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()

    assert "predicted_waiting_time" in data
    assert "queue_status" in data

    assert isinstance(
        data["predicted_waiting_time"],
        (int, float)
    )


def test_forecast():

    payload = {
        "queue_length": 42,
        "active_counters": 3,
        "arrivals": 15,
        "served": 18,
        "hour": 11,
        "day_of_week": 1
    }

    response = client.post(
        "/forecast",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()

    assert "current_queue" in data
    assert "forecast" in data
    assert "trend" in data
    assert "risk" in data

    forecast = data["forecast"]

    assert "15_minutes" in forecast
    assert "30_minutes" in forecast
    assert "45_minutes" in forecast
    assert "60_minutes" in forecast


def test_ai_analyze():

    payload = {
        "queue_length": 42,
        "active_counters": 3,
        "avg_service_time": 8,
        "appointments_next_hour": 10,
        "hour": 11,
        "day_of_week": 1,
        "peak_hour": 1,
        "arrivals": 15,
        "served": 18
    }

    response = client.post(
        "/ai/analyze",
        json=payload
    )

    assert response.status_code == 200

    data = response.json()

    assert "waiting_time" in data
    assert "queue_forecast" in data
    assert "recommendation" in data

    assert "minutes" in data["waiting_time"]
    assert "status" in data["waiting_time"]

    assert "current" in data["queue_forecast"]
    assert "60_minutes" in data["queue_forecast"]

    assert "action" in data["recommendation"]
    assert "message" in data["recommendation"]