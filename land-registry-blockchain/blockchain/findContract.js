import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
const walletAddress = "0x0274b3605bDe4CCB72fD3fA7F4eb2B7a42B5A387";

async function findContract() {
  const nonce = await provider.getTransactionCount(walletAddress);
  console.log("Current nonce:", nonce);
  
  if (nonce > 0) {
    // The contract was deployed at nonce - 1
    const deployNonce = nonce - 1;
    const contractAddress = ethers.getCreateAddress({
      from: walletAddress,
      nonce: deployNonce
    });
    console.log("Likely deployed contract address:", contractAddress);
  } else {
    console.log("No transactions found for this wallet.");
  }
}

findContract().catch(console.error);
