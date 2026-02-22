import { ethers } from "ethers";
import fs from "fs";

const RPC_URL = "https://rpc-amoy.polygon.technology";
const CONTRACT_ADDRESS = "0x4C2cf6A1354B9BE2A6D790465cC30E9A549590e7";

const abiRaw = fs.readFileSync("./src/abi/LandRegistry.json", "utf8");
const abi = JSON.parse(abiRaw).abi;

async function test() {
  console.log("Starting test...");
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, abi, provider);

  console.log("Fetching property 1...");
  try {
    const prop = await contract.getProperty(1);
    console.log("Property 1:", prop);
  } catch (e) {
    console.error("Error fetching property:", e.message);
  }

  console.log("Fetching total properties...");
  try {
    const total = await contract.totalProperties();
    console.log("Total properties:", total.toString());
  } catch(e) {
    console.error("Error fetching totalProperties:", e.message);
  }

  console.log("Fetching disputes...");
  try {
    const d = await contract.disputes(1);
    console.log("Disputes 1:", d);
  } catch (e) {
    console.error("Error fetching disputes:", e.message);
  }

  console.log("Done test");
}

test();
