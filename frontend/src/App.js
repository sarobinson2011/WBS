import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import contractABI from './contracts/BottleRegistry.json';
import nftABI from './contracts/BottleNFT.json';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [adminAddress, setAdminAddress] = useState(null);

  // Transfer-related state
  const [rfid, setRfid] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [bottleInfo, setBottleInfo] = useState(null);
  const [transferMessage, setTransferMessage] = useState('');

  // Register-related state
  const [registerRFID, setRegisterRFID] = useState('');
  const [registerOwner, setRegisterOwner] = useState('');
  const [registerAuthHash, setRegisterAuthHash] = useState('');
  const [registerTokenURI, setRegisterTokenURI] = useState('');
  const [registerMessage, setRegisterMessage] = useState('');

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setWalletAddress(accounts[0]);
        console.log("Connected wallet:", accounts[0]);

        const contract = new ethers.Contract(
          process.env.REACT_APP_BOTTLE_REGISTRY_ADDRESS,
          contractABI,
          provider
        );
        const admin = await contract.admin();
        setAdminAddress(admin);
        console.log("Admin address:", admin);
      } catch (err) {
        console.error("User rejected connection", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', () => {
        connectWallet();
      });
    }
  }, []);

  const isValidRFID = (value) => {
    const hexPattern = /^[0-9a-fA-F]{15}$/;
    return hexPattern.test(value);
  };

  const getBottleOwner = async (rfid) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.REACT_APP_BOTTLE_REGISTRY_ADDRESS,
        contractABI,
        provider
      );

      const [id, , owner] = await contract.getBottle(rfid);
      return owner;
    } catch (err) {
      console.error("Error fetching bottle owner:", err);
      return null;
    }
  };

  const handleTransferOwnership = async () => {
    if (!window.ethereum || !rfid || !newOwner) {
      alert("Missing wallet, RFID, or new owner address.");
      return;
    }

    setTransferMessage('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const registry = new ethers.Contract(
        process.env.REACT_APP_BOTTLE_REGISTRY_ADDRESS,
        contractABI,
        signer
      );

      const nftContract = new ethers.Contract(
        process.env.REACT_APP_BOTTLE_NFT_ADDRESS,
        nftABI,
        signer
      );

      const bottleOwner = await getBottleOwner(rfid);

      if (!bottleOwner || bottleOwner.toLowerCase() !== userAddress.toLowerCase()) {
        alert("❌ You are not the current bottle owner.");
        return;
      }

      const isApproved = await nftContract.isApprovedForAll(userAddress, registry.target);
      if (!isApproved) {
        alert("⚠️ Approval required. Sending approval transaction...");
        const approvalTx = await nftContract.setApprovalForAll(registry.target, true);
        await approvalTx.wait();
        alert("✅ Registry approved to manage your NFTs.");
      }

      alert("Sending transfer transaction...");
      const tx = await registry.transferBottleOwnership(rfid, newOwner);
      await tx.wait();
      setTransferMessage("✅ Ownership transferred successfully.");
    } catch (err) {
      console.error("Transfer failed:", err);
      setTransferMessage('');
      alert("❌ Transfer failed. See console for details.");
    }
  };

  const handleCheckBottle = async () => {
    if (!rfid) {
      alert("Please enter an RFID.");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.REACT_APP_BOTTLE_REGISTRY_ADDRESS,
        contractABI,
        provider
      );

      const [returnedRfid, authenticityHash, owner] = await contract.getBottle(rfid);
      console.log("Bottle info:", returnedRfid, authenticityHash, owner);

      setBottleInfo({
        rfid: returnedRfid,
        hash: authenticityHash,
        owner: owner
      });
    } catch (err) {
      console.error("Error calling getBottle:", err);
      alert("Failed to fetch bottle info. Check RFID or try again.");
      setBottleInfo(null);
    }
  };

  const handleRedeemBottle = async () => {
    console.log("Redeem Bottle clicked");
    // To be implemented
  };

  const handleRegisterBottle = async () => {
    if (!isValidRFID(registerRFID)) {
      alert("❌ Invalid RFID. Must be 15 hex characters (0-9, a-f).");
      return;
    }

    if (!registerAuthHash || !registerOwner || !registerTokenURI) {
      alert("Please fill in all fields.");
      return;
    }

    setRegisterMessage('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        process.env.REACT_APP_BOTTLE_REGISTRY_ADDRESS,
        contractABI,
        signer
      );

      const tx = await contract.registerBottle(
        registerRFID,
        registerAuthHash,
        registerOwner,
        registerTokenURI
      );
      await tx.wait();

      setRegisterMessage("✅ Bottle registered successfully.");

      // Clear form
      setRegisterRFID('');
      setRegisterAuthHash('');
      setRegisterOwner('');
      setRegisterTokenURI('');
    } catch (err) {
      console.error("Registration failed:", err);
      setRegisterMessage('');
      alert("❌ Failed to register bottle. Check console.");
    }
  };

  return (
    <div className="App">
      <header style={styles.header}>
        <h1>Whiskey by Steve</h1>
      </header>

      <main style={styles.main}>
        <button style={styles.button} onClick={connectWallet}>
          {walletAddress
            ? `Wallet: ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
            : 'Connect Wallet'}
        </button>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <h3>Bottle Actions</h3>
          <input
            type="text"
            placeholder="Bottle RFID"
            value={rfid}
            onChange={(e) => setRfid(e.target.value)}
            style={styles.input}
          />
          <input
            type="text"
            placeholder="New Owner Address"
            value={newOwner}
            onChange={(e) => setNewOwner(e.target.value)}
            style={styles.input}
          />
          <button style={styles.button} onClick={handleTransferOwnership}>
            Transfer Ownership
          </button>
          <button style={styles.button} onClick={handleCheckBottle}>
            Check Bottle
          </button>
          <button style={styles.button} onClick={handleRedeemBottle}>
            Redeem Bottle
          </button>
          {transferMessage && (
            <p style={{ ...styles.successMessage, marginTop: '1rem' }}>{transferMessage}</p>
          )}
        </div>

        {bottleInfo && (
          <div style={styles.bottleInfo}>
            <h4>Bottle Info</h4>
            <p><strong>RFID:</strong> {bottleInfo.rfid}</p>
            <p><strong>Owner:</strong> {bottleInfo.owner}</p>
            {walletAddress &&
              (bottleInfo.owner.toLowerCase() === walletAddress.toLowerCase() ? (
                <p style={{ color: 'green' }}>✅ You are the bottle owner.</p>
              ) : (
                <p style={{ color: 'red' }}>❌ You are NOT the bottle owner.</p>
              ))}
          </div>
        )}

        {walletAddress && adminAddress &&
          walletAddress.toLowerCase() === adminAddress.toLowerCase() && (
            <div style={styles.adminBox}>
              <h3>Register New Bottle</h3>
              <input
                type="text"
                placeholder="Bottle RFID"
                value={registerRFID}
                onChange={(e) => setRegisterRFID(e.target.value)}
                style={styles.input}
              />
              {registerRFID && !isValidRFID(registerRFID) && (
                <p style={{ color: 'red', marginTop: '-0.5rem' }}>
                  RFID must be 15 hex characters (0–9, A–F).
                </p>
              )}
              <input
                type="text"
                placeholder="Authenticity Hash (hex)"
                value={registerAuthHash}
                onChange={(e) => setRegisterAuthHash(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Bottle Owner Address"
                value={registerOwner}
                onChange={(e) => setRegisterOwner(e.target.value)}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="Token URI (IPFS link)"
                value={registerTokenURI}
                onChange={(e) => setRegisterTokenURI(e.target.value)}
                style={styles.input}
              />
              <button style={styles.button} onClick={handleRegisterBottle}>
                Register Bottle
              </button>
              {registerMessage && (
                <p style={{ ...styles.successMessage, marginTop: '1rem' }}>{registerMessage}</p>
              )}
            </div>
          )}
      </main>
    </div>
  );
}

const styles = {
  header: {
    backgroundColor: '#222',
    color: 'white',
    padding: '1rem',
    textAlign: 'center',
  },
  main: {
    marginTop: '3rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  button: {
    padding: '0.75rem 1.5rem',
    fontSize: '1rem',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  input: {
    padding: '0.5rem',
    margin: '0.5rem',
    width: '300px',
    fontSize: '1rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
  },
  bottleInfo: {
    marginTop: '2rem',
    padding: '1rem',
    border: '1px solid #ccc',
    borderRadius: '8px',
    width: '400px',
    textAlign: 'left',
  },
  adminBox: {
    marginTop: '3rem',
    padding: '1rem',
    border: '2px dashed #999',
    borderRadius: '8px',
    width: '420px',
    textAlign: 'left',
  },
  successMessage: {
    color: 'green',
    fontWeight: 'bold',
  },
};

export default App;
