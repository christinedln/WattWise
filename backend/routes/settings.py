from flask import Blueprint, request, jsonify
from services.settings_service import get_user_settings, update_user_settings

settings_bp = Blueprint("settings", __name__)

# GET settings
@settings_bp.route("/<user_id>", methods=["GET"])
def fetch_settings(user_id):
    settings = get_user_settings(user_id)
    return jsonify(settings)

# SAVE settings
@settings_bp.route("/<user_id>", methods=["POST"])
def save_settings(user_id):

    print("REQUEST RECEIVED")  # add this line

    data = request.get_json()

    print("RAW DATA:", request.data)   
    print("JSON DATA:", data)          

    updated = update_user_settings(user_id, data)
    return jsonify(updated)