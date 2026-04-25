from firebase_config import db

DEFAULT_SETTINGS = {
    "electricity_rate": 12.5,
    "polling_interval": 5,
    "energy_alert_threshold": 5000,
    "security_alert_level": 3
}


def get_user_settings(user_id):
    try:
        doc = db.collection("settings").document(user_id).get()

        if not doc.exists:
            # use defaults instead of empty dict
            return DEFAULT_SETTINGS

        data = doc.to_dict() or {}

        # merge defaults + DB values (important)
        return {**DEFAULT_SETTINGS, **data}

    except Exception as e:
        print("Settings fetch error:", e)

        # IMPORTANT: fallback to defaults (not empty dict)
        return DEFAULT_SETTINGS


def update_user_settings(user_id, data):
    try:
        db.collection("settings").document(user_id).set(data)
        return True

    except Exception as e:
        print("Settings update error:", e)
        return False