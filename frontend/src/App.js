import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

// Components
import Header from './components/Header';
import ConnectWalletButton from './components/ConnectWalletButton';
import BottleActions from './components/BottleActions';
import BottleInfo from './components/BottleInfo';
import RegisterBottle from './components/RegisterBottle';

// ABIs
import contractABI from './contracts/BottleRegistry.json';
import nftABI from './contracts/BottleNFT.json';

// 🔐 `Valid`ation helpers
const isValidRFID = (value) => /^[0-9a-fA-F]{15}$/.test(value);
const isValidEthereumAddress = (addr) => /^0x[a-fA-F0-9]{40}$/.test(addr);
const isValidIPFSUri = (uri) => /^ipfs:\/\/[a-zA-Z0-9]{46,}$/.test(uri);

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [adminAddress, setAdminAddress] = useState(null);

  // Transfer state
  const [rfid, setRfid] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [transferMessage, setTransferMessage] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [redeemMessage, setRedeemMessage] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [bottleInfo, setBottleInfo] = useState(null);

  // Register state
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
          process.env.REACT_APP_BOTTLE_REGISTRY_ADDRESS,
          contractABI,
          provider
        );
        const admin = await contract.admin();
        setAdminAddress(admin);

        console.log("Connected wallet:", accounts[0]);
      } catch (err) {
        console.error("Wallet connection failed", err);
      }
    } else {
      alert("Please install MetaMask!");
    }
  };

  const logBottleAction = async (action, rfid, userAddress, details = {}) => {
    try {
      await fetch('http://localhost:5000/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rfid,
          user: userAddress,
          ...details
        }),
      });
    } catch (err) {
      console.error("Logging failed:", err);
    }
  };

  const getBottleOwner = async (rfid) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const contract = new ethers.Contract(
        process.env.REACT_APP_BOTTLE_REGISTRY_ADDRESS,
        contractABI,
        provider
      );
      const [, , owner] = await contract.getBottle(rfid);
      return owner;
    } catch (err) {
      console.error("Error fetching bottle owner:", err);
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
        alert("You are not the current bottle owner.");
        return;
      }

      const isApproved = await nftContract.isApprovedForAll(userAddress, registry.target);
      if (!isApproved) {
        const approvalTx = await nftContract.setApprovalForAll(registry.target, true);
        await approvalTx.wait();
      }

      const tx = await registry.transferBottleOwnership(rfid, newOwner);
      await tx.wait();

      await logBottleAction("transfer", rfid, userAddress, { newOwner });
      setTransferMessage("✅ Ownership transferred successfully.");
    } catch (err) {
      console.error("Transfer failed:", err);
      setTransferMessage("❌ Transfer failed. See console for details.");
    } finally {
      setTransferLoading(false);
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
      setBottleInfo({ rfid: returnedRfid, hash: authenticityHash, owner });
    } catch (err) {
      console.error("Error fetching bottle:", err);
      setBottleInfo(null);
      alert("Could not fetch bottle. Make sure the RFID is valid.");
    }
  };

  const handleRedeemBottle = async () => {
    if (!rfid) {
      alert("Please enter the RFID of the bottle to redeem.");
      return;
    }

    setRedeemMessage('');
    setRedeemLoading(true);

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

      const contract = new ethers.Contract(
        process.env.REACT_APP_BOTTLE_REGISTRY_ADDRESS,
        contractABI,
        signer
      );

      const tx = await contract.redeemBottle(rfid);
      await tx.wait();

      await logBottleAction("redeem", rfid, userAddress);
      setRedeemMessage("✅ Bottle redeemed and NFT burned successfully.");
      setRfid('');
      setBottleInfo(null);
    } catch (err) {
      console.error("Redemption failed:", err);
      setRedeemMessage("❌ Redemption failed. See console for details.");
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleRegisterBottle = async () => {
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

    setRegisterMessage('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();

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

      await logBottleAction("register", registerRFID, userAddress, {
        newOwner: registerOwner,
        tokenURI: registerTokenURI
      });

      setRegisterMessage("✅ Bottle registered successfully.");
      setRegisterRFID('');
      setRegisterAuthHash('');
      setRegisterOwner('');
      setRegisterTokenURI('');
    } catch (err) {
      console.error("Registration failed:", err);
      setRegisterMessage("❌ Failed to register bottle.");
    }
  };

  return (
    <div className="App">
      <Header />

      <main style={styles.main}>
        <ConnectWalletButton
          walletAddress={walletAddress}
          onConnect={connectWallet}
        />

        <BottleActions
          rfid={rfid}
          setRfid={setRfid}
          newOwner={newOwner}
          setNewOwner={setNewOwner}
          onTransfer={handleTransferOwnership}
          onCheck={handleCheckBottle}
          onRedeem={handleRedeemBottle}
          transferMessage={transferMessage}
          transferLoading={transferLoading}
          redeemMessage={redeemMessage}
          redeemLoading={redeemLoading}
        />

        <BottleInfo
          bottleInfo={bottleInfo}
          walletAddress={walletAddress}
        />

        {walletAddress && adminAddress &&
          walletAddress.toLowerCase() === adminAddress.toLowerCase() && (
            <RegisterBottle
              registerRFID={registerRFID}
              setRegisterRFID={setRegisterRFID}
              registerAuthHash={registerAuthHash}
              setRegisterAuthHash={setRegisterAuthHash}
              registerOwner={registerOwner}
              setRegisterOwner={setRegisterOwner}
              registerTokenURI={registerTokenURI}
              setRegisterTokenURI={setRegisterTokenURI}
              handleRegisterBottle={handleRegisterBottle}
              isValidRFID={isValidRFID}
              isValidEthereumAddress={isValidEthereumAddress}
              isValidIPFSUri={isValidIPFSUri}
              registerMessage={registerMessage}
            />
          )}
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
