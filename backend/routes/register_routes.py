from flask import Blueprint, request, jsonify
from services.register_service import handle_register_collectible

register_bp = Blueprint('register_bp', __name__)

@register_bp.route('/register-collectible', methods=['POST'])
def register_collectible():
    try:
        data = request.get_json()
        tx_hash = handle_register_collectible(data)
        return jsonify({"txHash": tx_hash}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
