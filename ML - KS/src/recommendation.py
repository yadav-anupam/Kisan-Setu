def generate_recommendation(
    waiting_time,
    queue_status,
    current_queue,
    forecast,
    trend,
    risk
):

    if waiting_time >= 60:

        if trend == "DECREASING":

            return {
                "action": "WAIT",
                "priority": "HIGH",
                "message": (
                    "Current waiting time is very high, "
                    "but the queue is expected to decrease. "
                    "Consider visiting after some time."
                )
            }

        elif trend == "INCREASING":

            return {
                "action": "AVOID_NOW",
                "priority": "HIGH",
                "message": (
                    "Waiting time is very high and the queue "
                    "is expected to increase. Consider visiting "
                    "another procurement centre or coming later."
                )
            }

        else:

            return {
                "action": "AVOID_NOW",
                "priority": "HIGH",
                "message": (
                    "Very high waiting time is expected. "
                    "Consider visiting another procurement centre."
                )
            }



    if waiting_time >= 30:

        if trend == "DECREASING":

            return {
                "action": "WAIT",
                "priority": "MEDIUM",
                "message": (
                    "The queue is decreasing. "
                    "Waiting for some time may reduce your waiting time."
                )
            }

        elif trend == "INCREASING":

            return {
                "action": "VISIT_LATER",
                "priority": "MEDIUM",
                "message": (
                    "The queue is increasing. "
                    "Consider visiting later when congestion decreases."
                )
            }

        else:

            return {
                "action": "PROCEED_WITH_CAUTION",
                "priority": "MEDIUM",
                "message": (
                    "Moderate to high waiting time is expected."
                )
            }



    if waiting_time < 15:

        return {
            "action": "VISIT_NOW",
            "priority": "LOW",
            "message": (
                "Current conditions are favorable. "
                "This is a good time to visit."
            )
        }



    return {
        "action": "VISIT",
        "priority": "LOW",
        "message": (
            "Moderate waiting time is expected. "
            "Normal procurement conditions."
        )
    }