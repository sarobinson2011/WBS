// src/components/RegisterCollectible.js
import React, { useEffect } from 'react';
import './RegisterCollectible.css';

const RegisterCollectible = ({
    registerRFID,
    setRegisterRFID,
    registerAuthHash,
    setRegisterAuthHash,
    registerOwner,
    setRegisterOwner,
    registerTokenURI,
    setRegisterTokenURI,
    handleRegisterCollectible,
    isValidRFID,
    isValidEthereumAddress,
    isValidIPFSUri,
    registerMessage
}) => {
    useEffect(() => {
        console.log("✅ RegisterCollectible component rendered");
    }, []);

    return (
        <div className="register-box">
            <h3>Register New Collectible</h3>

            <input
                type="text"
                placeholder="Collectible RFID"
                value={registerRFID}
                onChange={(e) => setRegisterRFID(e.target.value)}
                className="register-input"
            />
            {registerRFID && !isValidRFID(registerRFID) && (
                <p className="register-error">
                    RFID must be 15 hex characters (0–9, A–F).
                </p>
            )}

            <input
                type="text"
                placeholder="Authenticity Hash (hex)"
                value={registerAuthHash}
                onChange={(e) => setRegisterAuthHash(e.target.value)}
                className="register-input"
            />

            <input
                type="text"
                placeholder="Collectible Owner Address"
                value={registerOwner}
                onChange={(e) => setRegisterOwner(e.target.value)}
                className="register-input"
            />
            {registerOwner && !isValidEthereumAddress(registerOwner) && (
                <p className="register-error">
                    Must be a valid Ethereum address (0x...).
                </p>
            )}

            <input
                type="text"
                placeholder="Token URI (IPFS link)"
                value={registerTokenURI}
                onChange={(e) => setRegisterTokenURI(e.target.value)}
                className="register-input"
            />
            {registerTokenURI && !isValidIPFSUri(registerTokenURI) && (
                <p className="register-error">
                    Must be a valid IPFS URI (ipfs://...).
                </p>
            )}

            <button className="register-button" onClick={handleRegisterCollectible}>
                Register Collectible
            </button>

            {registerMessage && (
                <p className="register-success">{registerMessage}</p>
            )}
        </div>
    );
};

export default RegisterCollectible;
