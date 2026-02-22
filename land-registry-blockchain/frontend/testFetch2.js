import { ethers } from "ethers";
import fs from "fs";
import { fetch } from "undici"; // Node 18+ native fetch under the hood

const RPC_URL = "https://rpc-amoy.polygon.technology";
const CONTRACT_ADDRESS = "0x4C2cf6A1354B9BE2A6D790465cC30E9A549590e7";
const PINATA_GATEWAY = "https://gateway.pinata.cloud";

const abiRaw = fs.readFileSync("./src/abi/LandRegistry.json", "utf8");
const abi = JSON.parse(abiRaw).abi;

async function test() {
  console.log("Starting test...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  let uri = null;
  try {
    console.log("Fetching tokenURI 1...");
    uri = await contract.tokenURI(1);
    console.log("URI:", uri);
  } catch (e) {
    console.error("Error fetching tokenURI:", e.message);
  }

  if (uri) {
    const url = uri.startsWith("ipfs://") ? `${PINATA_GATEWAY}/ipfs/${uri.slice(7)}` : uri;
    console.log("Fetching metadata from IPFS:", url);
    const timeoutMsg = setTimeout(() => console.log("Still fetching after 3s..."), 3000);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
      const data = await res.json();
      console.log("Metadata:", data.name);
    } catch(e) {
      console.error("Error fetching metadata:", e.message);
    }
    clearTimeout(timeoutMsg);
  }
  
  console.log("Fetching history...");
  try {
    const filter = contract.filters.PropertyMinted(1);
    const logs = await contract.queryFilter(filter);
    console.log("Mint logs:", logs.length);
  } catch(e) {
    console.error("Error history:", e.message);
  }

  console.log("Done test");
}

test();
