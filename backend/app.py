from flask import Flask
from flask_cors import CORS
from routes.log_routes import log_bp
from routes.register_routes import register_bp
from dotenv import load_dotenv

app = Flask(__name__)
CORS(app)

load_dotenv()

# Register Blueprints
app.register_blueprint(log_bp)
app.register_blueprint(register_bp)

if __name__ == '__main__':
    app.run(debug=True)




# curl -X POST http://localhost:5000/register-collectible -H "Content-Type: application/json" -d '{"rfid":"000000000000020","authenticityHash":"0xabc123def4567890abc123def4567890abc123def4567890abc123def4567890","bottleOwner":"0xF8f8269488f73fab3935555FCDdD6035699deE25","tokenURI":"ipfs://QmVUtkyKPHZa6qSvTGNYotUMfPU56VRg1hzqFuUn9ZuLFH"}'



#       Contract addresses (Aurora Testnet)
#
# Collectible Registry Proxy Admin  : 0x20f9409682faa87e1c307Ae83e4875ce13Ef9b8C
# Collectible Registry V1 logic     : 0xd396b5c068aEc21a08b1167B82e62500926F9364
# Collectible Registry Proxy        : 0x1f043010CDD89Fc2d003A997B8385d05A1ef9D0f
# Collectible Registry V2 logic     : xxx

# Collectible NFT Proxy Admin       : 0xf3D0df3b7956901aF2250949b9c630971e5beED7
# Collectible NFT V2 logic          : 0x1019EC58bbDbEb3DC1Ae6Cef3d521Bf4874Edb2B
# Collectible NFT Proxy             : 0xd15b59E0A0DBBD47dcEE4577e8AEf73aEd78f046
# Collectible NFT V3 logic          : xxx