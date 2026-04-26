from firebase_admin import auth
from flask import request, jsonify
from functools import wraps

def auth_required(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return jsonify({"error": "Missing token"}), 401

        try:
            token = auth_header.split("Bearer ")[1]
            decoded = auth.verify_id_token(token)

            # attach user id to request
            request.user_id = decoded["uid"]

        except Exception:
            return jsonify({"error": "Invalid token"}), 401

        return f(*args, **kwargs)

    return wrapper