# services/data_service.py
from firebase_config import db
# SENSOR DATA
devices = [
    {
        "device_id": "1",
        "voltage": 255,
        "current": 13,
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

def get_devices(user_id):
    try:
        docs = db.collection("devices") \
                 .document(user_id) \
                 .collection("user_devices") \
                 .stream()

        devices = []

        for doc in docs:
            data = doc.to_dict()
            data["device_id"] = doc.id  # keep device_1, device_2
            devices.append(data)

        print("LOADED DEVICES:", devices)

        return devices

    except Exception as e:
        print("Devices fetch error:", e)
        return []

def get_registry():
    return registry


def get_rate(user_id):
    return rate_per_kwh