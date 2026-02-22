import { ethers } from "ethers";
import fs from "fs";

const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
const walletAddress = "0x0274b3605bDe4CCB72fD3fA7F4eb2B7a42B5A387";

async function findContract() {
  const nonce = await provider.getTransactionCount(walletAddress);
  const deployNonce = nonce - 1;
  const contractAddress = ethers.getCreateAddress({
    from: walletAddress,
    nonce: deployNonce
  });
  
  fs.writeFileSync("contractAddress.txt", contractAddress);
  console.log("Done");
}

findContract().catch(console.error);
