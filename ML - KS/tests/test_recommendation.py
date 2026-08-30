from src.recommendation import generate_recommendation


def test_decreasing_high_wait():

    result = generate_recommendation(
        waiting_time=80,
        queue_status="CRITICAL",
        current_queue=42,
        forecast={
            "15_minutes": 39,
            "30_minutes": 36,
            "45_minutes": 34,
            "60_minutes": 32
        },
        trend="DECREASING",
        risk="MEDIUM"
    )

    assert result["action"] == "WAIT"
    assert result["priority"] == "HIGH"


def test_increasing_high_wait():

    result = generate_recommendation(
        waiting_time=80,
        queue_status="CRITICAL",
        current_queue=42,
        forecast={
            "15_minutes": 48,
            "30_minutes": 55,
            "45_minutes": 65,
            "60_minutes": 75
        },
        trend="INCREASING",
        risk="CRITICAL"
    )

    assert result["action"] == "AVOID_NOW"


def test_low_waiting_time():

    result = generate_recommendation(
        waiting_time=10,
        queue_status="LOW",
        current_queue=10,
        forecast={
            "15_minutes": 9,
            "30_minutes": 9,
            "45_minutes": 8,
            "60_minutes": 8
        },
        trend="DECREASING",
        risk="LOW"
    )

    assert result["action"] == "VISIT_NOW"