# services/data_service.py

# SENSOR DATA
devices = [
    {
        "device_id": "1",
        "voltage": 220,
        "current": 0.10,
        "power": 1200,
        "status": "ON",
        "runtime": 1200
    },
    {
        "device_id": "2",
        "voltage": 230,
        "current": 0.08,
        "power": 18.4,
        "status": "OFF",
        "runtime": 800
    }
]


# DEVICE REGISTRY
registry = {
    "1": {
        "name": "Electric Fan",
        "type": "Appliance",
        "location": "Bedroom"
    },
    "2": {
        "name": "Rice Cooker",
        "type": "Appliance",
        "location": "Kitchen"
    }
}


# RATE CONFIG
rate_per_kwh = 12.5


# ACCESSORS
def get_devices():
    return devices


def get_registry():
    return registry


def get_rate():
    return rate_per_kwh