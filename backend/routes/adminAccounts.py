"""
Admin Accounts Management Routes
Handles creation and management of admin/role-based accounts
"""

from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import auth, firestore
from datetime import datetime

admin_accounts_bp = Blueprint('admin_accounts', __name__)
db = firestore.client()

# Middleware to check superadmin role
def require_superadmin(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        if not token:
            return jsonify({"error": "No authorization token"}), 401
        
        try:
            decoded_token = auth.verify_id_token(token)
            claims = decoded_token.get('custom_claims', {})
            
            if claims.get('role') != 'superadmin':
                return jsonify({"error": "Superadmin access required"}), 403
            
            request.admin_uid = decoded_token['uid']
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({"error": str(e)}), 401
    
    return decorated_function


@admin_accounts_bp.route('/create', methods=['POST'])
@require_superadmin
def create_admin_account():
    """
    Create a new admin/role-based account
    
    Request body:
    {
        "email": "admin@company.com",
        "role": "superadmin|admin|security|support|analyst|operator",
        "displayName": "John Doe (optional)",
        "password": "temporaryPassword123 (optional)"
    }
    """
    try:
        data = request.get_json()
        email = data.get('email')
        role = data.get('role')
        display_name = data.get('displayName', '')
        password = data.get('password', 'TempPass123!@#')  # Default temporary password
        
        # Validate required fields
        if not email or not role:
            return jsonify({"error": "email and role are required"}), 400
        
        # Validate role
        valid_roles = ['superadmin', 'admin', 'security', 'support', 'analyst', 'operator', 'user']
        if role not in valid_roles:
            return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
        
        # Check if user already exists
        try:
            existing_user = auth.get_user_by_email(email)
            return jsonify({"error": f"User with email {email} already exists"}), 409
        except auth.UserNotFoundError:
            pass  # User doesn't exist, which is what we want
        
        # Create Firebase Auth user
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name,
            email_verified=False
        )
        
        # Set custom claims for role
        custom_claims = {'role': role}
        auth.set_custom_user_claims(user.uid, custom_claims)
        
        # Create roleBasedAccounts Firestore document
        now = datetime.utcnow().isoformat()
        role_account = {
            'uid': user.uid,
            'email': email,
            'role': role,
            'displayName': display_name,
            'createdAt': now,
            'updatedAt': now,
            'createdBy': request.admin_uid,
            'status': 'active'
        }
        
        db.collection('roleBasedAccounts').document(user.uid).set(role_account)
        
        return jsonify({
            "success": True,
            "message": f"Account created for {email} with role: {role}",
            "user": {
                "uid": user.uid,
                "email": user.email,
                "displayName": user.display_name,
                "role": role,
                "createdAt": now
            }
        }), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_accounts_bp.route('/<user_id>/update-role', methods=['PUT'])
@require_superadmin
def update_account_role(user_id):
    """
    Update the role of an existing admin account
    
    Request body:
    {
        "role": "admin|security|support|analyst"
    }
    """
    try:
        data = request.get_json()
        new_role = data.get('role')
        
        if not new_role:
            return jsonify({"error": "role is required"}), 400
        
        valid_roles = ['superadmin', 'admin', 'security', 'support', 'analyst', 'operator', 'user']
        if new_role not in valid_roles:
            return jsonify({"error": f"Invalid role. Must be one of: {', '.join(valid_roles)}"}), 400
        
        # Update Firebase Auth custom claims
        user = auth.get_user(user_id)
        existing_claims = user.custom_claims or {}
        existing_claims['role'] = new_role
        auth.set_custom_user_claims(user_id, existing_claims)
        
        # Update Firestore document
        db.collection('roleBasedAccounts').document(user_id).update({
            'role': new_role,
            'updatedAt': datetime.utcnow().isoformat()
        })
        
        return jsonify({
            "success": True,
            "message": f"Role updated to {new_role}",
            "user": {
                "uid": user.uid,
                "email": user.email,
                "displayName": user.display_name,
                "role": new_role
            }
        }), 200
    
    except auth.UserNotFoundError:
        return jsonify({"error": f"User {user_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@admin_accounts_bp.route('/<user_id>/disable', methods=['POST'])
@require_superadmin
def disable_account(user_id):
    """
    Disable an admin account (soft delete)
    """
    try:
        # Disable Firebase Auth user
        auth.update_user(user_id, disabled=True)
        
        # Update Firestore status
        db.collection('roleBasedAccounts').document(user_id).update({
            'status': 'disabled',
            'updatedAt': datetime.utcnow().isoformat()
        })
        
        return jsonify({
            "success": True,
            "message": "Account disabled"
        }), 200
    
    except auth.UserNotFoundError:
        return jsonify({"error": f"User {user_id} not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500
