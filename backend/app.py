from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from datetime import datetime, timezone

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})  # allow all origins i.e. localhost number doesn't matter
 
LOG_FILE = 'logs/bottle_log.jsonl'  # .jsonl = JSON Lines format

@app.route('/log', methods=['POST'])
def log_activity():
    data = request.get_json()
    data['timestamp'] = datetime.now(timezone.utc).isoformat()

    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)

    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(data) + '\n')

    return jsonify({"status": "logged"}), 200

if __name__ == '__main__':
    app.run(debug=True)
