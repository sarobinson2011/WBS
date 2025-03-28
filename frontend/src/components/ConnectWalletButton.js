import React from 'react';
import './ConnectWalletButton.css';

const ConnectWalletButton = ({ walletAddress, onConnect }) => {
    return (
        <button className="connect-wallet-button" onClick={onConnect}>
            {walletAddress
                ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
                : 'Connect Wallet'}
        </button>
    );
};

export default ConnectWalletButton;
