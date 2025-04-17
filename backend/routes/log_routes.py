from flask import Blueprint, request, jsonify
from services.log_service import write_log_entry

log_bp = Blueprint('log', __name__)

@log_bp.route('/log', methods=['POST'])
def log_activity():
    data = request.get_json()
    success = write_log_entry(data)
    return jsonify({"status": "logged" if success else "failed"}), 200
