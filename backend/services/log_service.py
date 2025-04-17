import json, os
from datetime import datetime, timezone

LOG_FILE = 'logs/collectible_log.jsonl'

def write_log_entry(data):
    try:
        data['timestamp'] = datetime.now(timezone.utc).isoformat()
        os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
        with open(LOG_FILE, 'a') as f:
            f.write(json.dumps(data) + '\n')
        return True
    except Exception as e:
        print(f"Logging error: {e}")
        return False
