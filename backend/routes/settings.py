from flask import Blueprint, request, jsonify
from services.settings_service import get_user_settings, update_user_settings
from utils.auth import auth_required

settings_bp = Blueprint("settings", __name__)

@settings_bp.route("", methods=["GET"])
@auth_required
def fetch_settings():
    user_id = request.user_id 
    settings = get_user_settings(user_id)
    return jsonify(settings)

@settings_bp.route("", methods=["POST"])
@auth_required
def save_settings():
    user_id = request.user_id 
    data = request.get_json()

    updated = update_user_settings(user_id, data)
    return jsonify(updated)