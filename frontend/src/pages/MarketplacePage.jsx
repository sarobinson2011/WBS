import React from 'react';
import ConnectWalletButton from '../components/ConnectWalletButton.jsx';

const MarketplacePage = ({ walletAddress, connectWallet }) => {
    return (
        <main style={styles.main}>
            <ConnectWalletButton walletAddress={walletAddress} onConnect={connectWallet} />
            <h2 style={styles.heading}>Marketplace</h2>
            <p>Meeds populating... obviously.</p>
        </main>
    );
};

const styles = {
    main: {
        marginTop: '0.1rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
    },
    heading: {
        marginTop: '3rem', // adjust this value as needed
    },
};

export default MarketplacePage;
