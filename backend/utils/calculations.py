# utils/calculations.py
def calc_kwh(power_w, runtime_seconds):
    return round((power_w * runtime_seconds) / 3600 / 1000, 4)

def compute_power_trend(devices):
    """
    placeholder for real-time graph generation
    """
    return [
        {"time": "04:45", "power": 150},
        {"time": "04:50", "power": 165},
        {"time": "04:55", "power": 175},
        {"time": "05:00", "power": 192},
    ]

def calculate_kwh(power_watts, runtime_seconds):
    """
    Convert power (W) + runtime (seconds) → kWh
    """
    return round((power_watts * runtime_seconds) / 3600000, 4)


def calculate_cost(kwh, rate):
    """
    Compute cost from kWh and rate per kWh
    """
    return round(kwh * rate, 2)