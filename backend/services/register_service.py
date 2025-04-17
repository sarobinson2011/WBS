import os
import json
from datetime import datetime, timezone
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

PRIVATE_KEY = os.getenv("ADMIN_PRIVATE_KEY")
RPC_URL = os.getenv("RPC_URL")
CONTRACT_ADDRESS = os.getenv("REGISTRY_PROXY_ADDRESS")
CONTRACT_ABI_PATH = "abi/RegistryV1.json"
LOG_FILE = 'logs/collectible_log.jsonl'

def handle_register_collectible(data):
    required_fields = ["rfid", "authenticityHash", "bottleOwner", "tokenURI"]
    if not all(field in data for field in required_fields):
        raise ValueError("Missing fields")

    w3 = Web3(Web3.HTTPProvider(RPC_URL))
    account = w3.eth.account.from_key(PRIVATE_KEY)

    with open(CONTRACT_ABI_PATH) as f:
        abi = json.load(f)

    contract = w3.eth.contract(address=Web3.to_checksum_address(CONTRACT_ADDRESS), abi=abi)

    txn = contract.functions.registerCollectible(
        data["rfid"],
        Web3.to_bytes(hexstr=data["authenticityHash"]),
        Web3.to_checksum_address(data["bottleOwner"]),
        data["tokenURI"]
    ).build_transaction({
        "from": account.address,
        "nonce": w3.eth.get_transaction_count(account.address),
        "gas": 300000,
        "gasPrice": w3.eth.gas_price
    })

    signed_txn = w3.eth.account.sign_transaction(txn, private_key=PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_txn.raw_transaction)

    # Log the action
    log_data = {
        "action": "register",
        "rfid": data["rfid"],
        "bottleOwner": data["bottleOwner"],
        "authenticityHash": data["authenticityHash"],
        "tokenURI": data["tokenURI"],
        "txHash": tx_hash.hex(),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    with open(LOG_FILE, 'a') as f:
        f.write(json.dumps(log_data) + '\n')

    return tx_hash.hex()
