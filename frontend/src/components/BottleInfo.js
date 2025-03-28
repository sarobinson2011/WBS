import React from 'react';
import './BottleInfo.css';

const BottleInfo = ({ bottleInfo, walletAddress }) => {
    if (!bottleInfo) return null;

    const isOwner =
        walletAddress &&
        bottleInfo.owner.toLowerCase() === walletAddress.toLowerCase();

    return (
        <div className="bottle-info-box">
            <h4>Bottle Info</h4>
            <p><strong>RFID:</strong> {bottleInfo.rfid}</p>
            <p><strong>Owner:</strong> {bottleInfo.owner}</p>
            <p className={isOwner ? 'bottle-info-owner-yes' : 'bottle-info-owner-no'}>
                {isOwner
                    ? '✅ You are the bottle owner.'
                    : '❌ You are NOT the bottle owner.'}
            </p>
        </div>
    );
};

export default BottleInfo;
