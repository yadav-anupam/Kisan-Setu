from fastapi.testclient import TestClient

from src.api import app


client = TestClient(app)


def test_negative_queue_length():

    payload = {
        "queue_length": -10,
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

    assert response.status_code == 422


def test_invalid_hour():

    payload = {
        "queue_length": 42,
        "active_counters": 3,
        "avg_service_time": 8,
        "appointments_next_hour": 10,
        "hour": 25,
        "day_of_week": 1,
        "peak_hour": 1
    }

    response = client.post(
        "/predict",
        json=payload
    )

    assert response.status_code == 422


def test_zero_active_counters():

    payload = {
        "queue_length": 42,
        "active_counters": 0,
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

    assert response.status_code == 422