import { useState } from "react";
import { ethers } from "ethers";
import marketAbi from "../contracts/CollectibleMarket.json";

const ListCollectibleForm = ({ marketAddress }) => {
    const [nftAddress, setNftAddress] = useState("");
    const [tokenId, setTokenId] = useState("");
    const [price, setPrice] = useState("");
    const [status, setStatus] = useState("");

    const handleList = async (e) => {
        e.preventDefault();
        try {
            if (!window.ethereum) throw new Error("Wallet not found");

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            // Step 1: Check if NFT is already approved
            const nftAbi = [
                "function getApproved(uint256 tokenId) view returns (address)",
                "function approve(address to, uint256 tokenId) external"
            ];
            const nft = new ethers.Contract(nftAddress, nftAbi, signer);
            const approved = await nft.getApproved(tokenId);

            if (approved.toLowerCase() !== marketAddress.toLowerCase()) {
                setStatus("Approving marketplace to transfer your NFT...");
                const approvalTx = await nft.approve(marketAddress, tokenId);
                setStatus("Waiting for approval transaction to confirm...");
                await approvalTx.wait();
                setStatus("Marketplace approved.");
            } else {
                setStatus("Marketplace already approved.");
            }

            // Step 2: Call listCollectible
            const market = new ethers.Contract(marketAddress, marketAbi, signer);
            setStatus("Listing collectible...");

            const tx = await market.listCollectible(
                nftAddress,
                tokenId,
                ethers.parseUnits(price, 6)
            );

            setStatus("Transaction sent: " + tx.hash);
            await tx.wait();
            setStatus("✅ Collectible listed!");
        } catch (err) {
            console.error(err);
            setStatus("❌ Error: " + err.message);
        }
    };

    return (
        <form onSubmit={handleList} className="p-4 border rounded shadow space-y-3">
            <h2 className="text-lg font-bold">List a Collectible</h2>
            <input
                type="text"
                placeholder="NFT Address"
                value={nftAddress}
                onChange={(e) => setNftAddress(e.target.value)}
                className="w-full p-2 border"
            />
            <input
                type="number"
                placeholder="Token ID"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="w-full p-2 border"
            />
            <input
                type="text"
                placeholder="Price in USDC"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2 border"
            />
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                List
            </button>
            <div className="text-sm mt-2">{status}</div>
        </form>
    );
};

export default ListCollectibleForm;
