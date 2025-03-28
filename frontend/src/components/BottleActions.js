import React from 'react';
import './BottleActions.css';

const BottleActions = ({
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
        <div className="bottle-actions-container">
            <h3>Bottle Actions</h3>

            <input
                type="text"
                placeholder="Bottle RFID"
                value={rfid}
                onChange={(e) => setRfid(e.target.value)}
                className="bottle-actions-input"
                disabled={isBusy}
            />

            <input
                type="text"
                placeholder="New Owner Address"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className="bottle-actions-input"
                disabled={isBusy}
            />

            <button
                className="bottle-actions-button"
                onClick={onTransfer}
                disabled={isBusy}
            >
                {transferLoading ? 'Transferring...' : 'Transfer Ownership'}
            </button>

            <button
                className="bottle-actions-button"
                onClick={onCheck}
                disabled={isBusy}
            >
                Check Bottle
            </button>

            <button
                className="bottle-actions-button"
                onClick={onRedeem}
                disabled={isBusy}
            >
                {redeemLoading ? 'Redeeming...' : 'Redeem Bottle'}
            </button>

            {transferMessage && (
                <p className="bottle-actions-success">{transferMessage}</p>
            )}

            {redeemMessage && (
                <p className="bottle-actions-success">{redeemMessage}</p>
            )}
        </div>
    );
};

export default BottleActions;
