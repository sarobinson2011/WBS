import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Components
import Header from './components/Header.jsx';
import ConnectWalletButton from './components/ConnectWalletButton.jsx';
import CollectibleActions from './components/CollectibleActions.jsx';
import CollectibleInfo from './components/CollectibleInfo.jsx';
import RegisterCollectible from './components/RegisterCollectible.jsx';

// Pages
import MarketplacePage from './pages/MarketplacePage.jsx';

// ABIs
import contractABI from './contracts/CollectibleRegistry.json';
import nftABI from './contracts/CollectibleNFT.json';

const isValidRFID = (value) => /^[0-9a-fA-F]{15}$/.test(value);
const isValidEthereumAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const isValidIPFSUri = (uri) => /^ipfs:\/\/[a-zA-Z0-9]{46,}$/.test(uri);

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [adminAddress, setAdminAddress] = useState(null);
  const [rfid, setRfid] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [collectibleInfo, setCollectibleInfo] = useState(null);

  const [registerRFID, setRegisterRFID] = useState('');
  const [registerOwner, setRegisterOwner] = useState('');
  const [registerAuthHash, setRegisterAuthHash] = useState('');
  const [registerTokenURI, setRegisterTokenURI] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        connectWallet();
      });
    }
  }, []);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);

        const contract = new ethers.Contract(
          import.meta.env.VITE_COLLECTIBLE_REGISTRY_ADDRESS,
          contractABI,
          provider
        );

        const admin = await contract.owner();
        setAdminAddress(admin);

        console.log("Connected wallet:", accounts[0]);
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const logCollectibleAction = async (action, rfid, userAddress, details = {}) => {
    try {
      await fetch('http://localhost:5000/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, rfid, user: userAddress, ...details }),
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  };

  const getCollectibleOwner = async (rfid) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        import.meta.env.VITE_COLLECTIBLE_REGISTRY_ADDRESS,
        contractABI,
        provider
      );
      const [, , owner] = await contract.getCollectible(rfid);
      return owner;
    } catch (err) {
      return null;
    }
  };

  const handleTransferOwnership = async () => {
    if (!rfid || !newOwner) {
      alert("Missing RFID or new owner address.");
      return;
    }

    setTransferMessage('');
    setTransferLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const registry = new ethers.Contract(
        import.meta.env.VITE_COLLECTIBLE_REGISTRY_ADDRESS,
        contractABI,
        signer
      );
      const nftContract = new ethers.Contract(
        import.meta.env.VITE_COLLECTIBLE_NFT_ADDRESS,
        nftABI,
        signer
      );

      const collectibleOwner = await getCollectibleOwner(rfid);
      if (!collectibleOwner || collectibleOwner.toLowerCase() !== userAddress.toLowerCase()) {
        alert("You are not the current collectible owner.");
        return;
      }

      const isApproved = await nftContract.isApprovedForAll(userAddress, registry.target);
      if (!isApproved) {
        const approvalTx = await nftContract.setApprovalForAll(registry.target, true);
        await approvalTx.wait();
      }

      const tx = await registry.transferCollectibleOwnership(rfid, newOwner);
      await tx.wait();

      await logCollectibleAction("transfer", rfid, userAddress, { newOwner });
      setTransferMessage("✅ Ownership transferred successfully.");
    } catch (err) {
      console.error("Transfer failed:", err);
      setTransferMessage("❌ Transfer failed. See console for details.");
    } finally {
      setTransferLoading(false);
    }
  };

  const handleCheckCollectible = async () => {
    if (!rfid) {
      alert("Please enter an RFID.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        import.meta.env.VITE_COLLECTIBLE_REGISTRY_ADDRESS,
        contractABI,
        provider
      );
      const [returnedRfid, authenticityHash, owner] = await contract.getCollectible(rfid);
      setCollectibleInfo({ rfid: returnedRfid, hash: authenticityHash, owner });
    } catch (err) {
      console.error("Error fetching collectible:", err);
      setCollectibleInfo(null);
      alert("Could not fetch collectible. Make sure the RFID is valid.");
    }
  };

  const handleRedeemCollectible = async () => {
    if (!rfid) {
      alert("Please enter the RFID of the collectible to redeem.");
      return;
    }

    setRedeemMessage('');
    setRedeemLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new ethers.Contract(
        import.meta.env.VITE_COLLECTIBLE_REGISTRY_ADDRESS,
        contractABI,
        signer
      );

      const tx = await contract.redeemCollectible(rfid);
      await tx.wait();

      await logCollectibleAction("redeem", rfid, userAddress);
      setRedeemMessage("✅ Collectible redeemed and NFT burned successfully.");
      setRfid('');
      setCollectibleInfo(null);
    } catch (err) {
      console.error("Redemption failed:", err);
      setRedeemMessage("❌ Redemption failed. See console for details.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleRegisterCollectible = async () => {
    if (!isValidRFID(registerRFID)) {
      alert("❌ Invalid RFID. Must be 15 hex characters.");
      return;
    }

    if (!isValidEthereumAddress(registerOwner)) {
      alert("❌ Invalid Ethereum address.");
      return;
    }

    if (!isValidIPFSUri(registerTokenURI)) {
      alert("❌ Invalid IPFS URI.");
      return;
    }

    if (!registerAuthHash || !registerOwner || !registerTokenURI) {
      alert("Please fill in all fields.");
      return;
    }

    const existingOwner = await getCollectibleOwner(registerRFID);
    if (existingOwner) {
      alert("❌ RFID already registered on-chain.");
      return;
    }

    setRegisterMessage('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new ethers.Contract(
        import.meta.env.VITE_COLLECTIBLE_REGISTRY_ADDRESS,
        contractABI,
        signer
      );

      const tx = await contract.registerCollectible(
        registerRFID,
        registerAuthHash,
        registerOwner,
        registerTokenURI
      );
      await tx.wait();

      await logCollectibleAction("register", registerRFID, userAddress, {
        newOwner: registerOwner,
        tokenURI: registerTokenURI,
        authenticityHash: registerAuthHash
      });

      setRegisterMessage("✅ Collectible registered successfully.");
      setRegisterRFID('');
      setRegisterAuthHash('');
      setRegisterOwner('');
      setRegisterTokenURI('');
    } catch (err) {
      console.error("Registration failed:", err);
      setRegisterMessage("❌ Failed to register collectible.");
    }
  };

  return (
    <div className="App">
      <Header />
      <nav style={{ margin: '1rem' }}>
        <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
        <Link to="/marketplace">Marketplace</Link>
      </nav>
      <main style={styles.main}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <ConnectWalletButton walletAddress={walletAddress} onConnect={connectWallet} />
                <CollectibleActions
                  rfid={rfid}
                  setRfid={setRfid}
                  newOwner={newOwner}
                  setNewOwner={setNewOwner}
                  onTransfer={handleTransferOwnership}
                  onCheck={handleCheckCollectible}
                  onRedeem={handleRedeemCollectible}
                  transferMessage={transferMessage}
                  transferLoading={transferLoading}
                  redeemMessage={redeemMessage}
                  redeemLoading={redeemLoading}
                />
                <CollectibleInfo collectibleInfo={collectibleInfo} walletAddress={walletAddress} />
                {walletAddress && adminAddress &&
                  walletAddress.toLowerCase() === adminAddress.toLowerCase() && (
                    <RegisterCollectible
                      registerRFID={registerRFID}
                      setRegisterRFID={setRegisterRFID}
                      registerAuthHash={registerAuthHash}
                      setRegisterAuthHash={setRegisterAuthHash}
                      registerOwner={registerOwner}
                      setRegisterOwner={setRegisterOwner}
                      registerTokenURI={registerTokenURI}
                      setRegisterTokenURI={setRegisterTokenURI}
                      handleRegisterCollectible={handleRegisterCollectible}
                      isValidRFID={isValidRFID}
                      isValidEthereumAddress={isValidEthereumAddress}
                      isValidIPFSUri={isValidIPFSUri}
                      registerMessage={registerMessage}
                    />
                  )}
              </>
            }
          />
          <Route path="/marketplace" element={<MarketplacePage />} />
        </Routes>
      </main>
    </div>
  );
}

const styles = {
  main: {
    marginTop: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
};

export default App;
