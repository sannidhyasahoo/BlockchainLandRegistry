/**
 * scripts/toggleDemoMode.js
 * Toggles the isDemoMode flag on the LandRegistry contract.
 *
 * Usage: node scripts/toggleDemoMode.js <true|false>
 */
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";

// ── Resolve paths ───────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, "..");

// ── Load .env ───────────────────────────────────────────────────────────────
const envPath = join(projectRoot, ".env");
let PRIVATE_KEY = "";
try {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    if (line.trim().startsWith("PRIVATE_KEY=")) {
      PRIVATE_KEY = line.trim().split("=").slice(1).join("=").trim();
      break;
    }
  }
} catch {
  console.error("❌ Cannot read .env file");
  process.exit(1);
}
if (!PRIVATE_KEY) {
  console.error("❌ PRIVATE_KEY not found in .env");
  process.exit(1);
}

// ── Load compiled artifact ──────────────────────────────────────────────────
const artifactPath = join(
  projectRoot, "artifacts", "contracts", "LandRegistry.sol", "LandRegistry.json"
);
const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

// ── Read deployed address ───────────────────────────────────────────────────
const deployedPath = join(projectRoot, "deployed_address.txt");
const CONTRACT_ADDRESS = readFileSync(deployedPath, "utf8").trim();

async function main() {
  const arg = process.argv[2]?.toLowerCase();
  if (arg !== "true" && arg !== "false") {
    console.error("Usage: node scripts/toggleDemoMode.js <true|false>");
    process.exit(1);
  }

  const enable = arg === "true";

  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  🔧  Toggle Demo Mode -> ${enable ? "ON" : "OFF"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Contract : ${CONTRACT_ADDRESS}`);
  console.log(`  Admin    : ${wallet.address}`);

  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, wallet.address);
  if (!isAdmin) {
    console.error("\n❌ The wallet in .env is NOT the DEFAULT_ADMIN. Cannot toggle demo mode.");
    process.exit(1);
  }

  const currentState = await contract.isDemoMode();
  if (currentState === enable) {
    console.log(`\n✅ isDemoMode is already ${enable}. No action needed.`);
    return;
  }

  console.log("\n🚀 Sending transaction...");
  const tx = await contract.setDemoMode(enable, {
    maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
    maxFeePerGas: ethers.parseUnits("50", "gwei"),
  });
  console.log(`   Tx hash: ${tx.hash}`);
  await tx.wait();

  const newState = await contract.isDemoMode();
  console.log(`\n✅ isDemoMode set to: ${newState}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((error) => {
  console.error("\n❌ Failed:", error.message || error);
  process.exitCode = 1;
});
