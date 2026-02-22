import { ethers } from "ethers";
import fs from "fs";

const RPC_URL = "https://rpc-amoy.polygon.technology";
const CONTRACT_ADDRESS = "0x4C2cf6A1354B9BE2A6D790465cC30E9A549590e7";

const abiRaw = fs.readFileSync("./src/abi/LandRegistry.json", "utf8");
const abi = JSON.parse(abiRaw).abi;

async function testFetch() {
  console.log("Starting timing test...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  const t0 = Date.now();
  console.log("[1] fetchProperty core...");
  const [price, status, seller, potentialBuyer, trustRecorded, sellerConfirmed, escrow, frozen] =
    await contract.getProperty(0);
  const uri = await contract.tokenURI(0);
  console.log(`...took ${Date.now() - t0}ms`);

  const t1 = Date.now();
  console.log("[2] fetchProperty dispute (if frozen)...");
  if (frozen) {
    await contract.disputes(0);
  }
  console.log(`...took ${Date.now() - t1}ms`);

  const t2 = Date.now();
  console.log("[3] fetchPropertyHistory queryFilter Mint...");
  const filterMint = contract.filters.PropertyMinted(0);
  await contract.queryFilter(filterMint, -40000);
  console.log(`...took ${Date.now() - t2}ms`);

  const t3 = Date.now();
  console.log("[4] fetchPropertyHistory queryFilter ALL PARALLEL...");
    const filterTrust = contract.filters.TrustEstablished(0);
    const filterFunds = contract.filters.FundsLocked(0);
    const filterSold = contract.filters.OwnershipTransferred(0);
    const filterFrozen = contract.filters.PropertyFrozen(0);
    const filterUnfrozen = contract.filters.PropertyUnfrozen(0);

    await Promise.all([
      contract.queryFilter(filterMint, -40000),
      contract.queryFilter(filterTrust, -40000),
      contract.queryFilter(filterFunds, -40000),
      contract.queryFilter(filterSold, -40000),
      contract.queryFilter(filterFrozen, -40000),
      contract.queryFilter(filterUnfrozen, -40000),
    ]);
  console.log(`...took ${Date.now() - t3}ms`);

  console.log(`Total time: ${Date.now() - t0}ms`);
}

testFetch();
