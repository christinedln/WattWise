# services/data_service.py
from firebase_config import db

# DEVICE REGISTRY (fallback metadata)
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
        print("\n================ FIRESTORE DEVICE FETCH ================")
        print("USER ID:", user_id)

        docs = (
            db.collection("devices")
              .document(user_id)
              .collection("user_devices")
              .stream()
        )

        devices = []

        for doc in docs:
            d = doc.to_dict()

            print("RAW DEVICE DOC:", doc.id, d)

            d["device_id"] = doc.id

            enabled = d.get("enabled", True)
            if isinstance(enabled, str):
                enabled = enabled.lower() == "true"

            d["enabled"] = enabled

            devices.append(d)

        print("TOTAL DEVICES LOADED:", len(devices))
        print("FINAL DEVICES:", devices)

        return devices

    except Exception as e:
        print("Devices fetch error:", e)
        return []


def get_registry():
    return registry


def get_rate(user_id):
    return rate_per_kwh