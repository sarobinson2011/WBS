// src/components/CollectibleInfo.js
import React, { useEffect } from 'react';
import './CollectibleInfo.css';

const CollectibleInfo = ({ collectibleInfo, walletAddress }) => {
    useEffect(() => {
        console.log("✅ CollectibleInfo rendered:", collectibleInfo);
    }, [collectibleInfo]);

    if (!collectibleInfo) return null;

    const isOwner =
        walletAddress &&
        collectibleInfo.owner.toLowerCase() === walletAddress.toLowerCase();

    return (
        <div className="collectible-info-box">
            <h4>Collectible Info</h4>
            <p><strong>RFID:</strong> {collectibleInfo.rfid}</p>
            <p><strong>Owner:</strong> {collectibleInfo.owner}</p>
            <p className={isOwner ? 'collectible-info-owner-yes' : 'collectible-info-owner-no'}>
                {isOwner
                    ? '✅ You are the Collectible owner.'
                    : '❌ You are NOT the Collectible owner.'}
            </p>
        </div>
    );
};

export default CollectibleInfo;
