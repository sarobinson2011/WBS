import React from 'react';
import './CollectibleActions.css';

const CollectibleActions = ({
    rfid,
    newOwner,
    setRfid,
    setNewOwner,
    onTransfer,
    onCheck,
    onRedeem,
    transferMessage,
    redeemMessage,
    transferLoading,
    redeemLoading
}) => {
    const isBusy = transferLoading || redeemLoading;

    return (
        <div className="Collectible-actions-container">
            <h3>Collectible Actions</h3>

            <input
                type="text"
                placeholder="Collectible RFID"
                value={rfid}
                onChange={(e) => setRfid(e.target.value)}
                className="Collectible-actions-input"
                disabled={isBusy}
            />

            <input
                type="text"
                placeholder="New Owner Address"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="Collectible-actions-input"
                disabled={isBusy}
            />

            <button
                className="Collectible-actions-button"
                onClick={onTransfer}
                disabled={isBusy}
            >
                {transferLoading ? 'Transferring...' : 'Transfer Ownership'}
            </button>

            <button
                className="Collectible-actions-button"
                onClick={onCheck}
                disabled={isBusy}
            >
                Check Collectible
            </button>

            <button
                className="Collectible-actions-button"
                onClick={onRedeem}
                disabled={isBusy}
            >
                {redeemLoading ? 'Redeeming...' : 'Redeem Collectible'}
            </button>

            {transferMessage && (
                <p className="Collectible-actions-success">{transferMessage}</p>
            )}

            {redeemMessage && (
                <p className="Collectible-actions-success">{redeemMessage}</p>
            )}
        </div>
    );
};

export default CollectibleActions;
