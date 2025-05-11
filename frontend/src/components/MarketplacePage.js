import React from 'react';
import { Link } from 'react-router-dom';  // this?

function MarketplacePage() {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <nav>
                <Link to="/" style={{ margin: '0 1rem' }}>← Back to Home</Link>
            </nav>
            <h2>Marketplace</h2>
            <p>This page will list collectibles for sale and allow users to purchase them.</p>
        </div>
    );
}

export default MarketplacePage;
