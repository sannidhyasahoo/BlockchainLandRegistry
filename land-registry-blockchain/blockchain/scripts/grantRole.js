/**
 * scripts/grantRole.js
 * Grants REGISTRAR_ROLE to a target address using the deployer (admin) wallet.
 *
 * Usage:  node scripts/grantRole.js <walletAddress>
 * Example: node scripts/grantRole.js 0xC2461Eefe517E4425dcdf77E506730DF294b4D20
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
  const targetAddress = process.argv[2];
  if (!targetAddress || !ethers.isAddress(targetAddress)) {
    console.error("Usage: node scripts/grantRole.js <walletAddress>");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, artifact.abi, wallet);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🔑  Grant REGISTRAR_ROLE");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Contract : ${CONTRACT_ADDRESS}`);
  console.log(`  Admin    : ${wallet.address}`);
  console.log(`  Target   : ${targetAddress}`);

  const REGISTRAR_ROLE = await contract.REGISTRAR_ROLE();

  // Check if already has the role
  const already = await contract.hasRole(REGISTRAR_ROLE, targetAddress);
  if (already) {
    console.log("\n✅ Target already has REGISTRAR_ROLE. No action needed.");
    return;
  }

  // Check if admin is the admin
  const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, wallet.address);
  if (!isAdmin) {
    console.error("\n❌ The wallet in .env is NOT the DEFAULT_ADMIN. Cannot grant roles.");
    process.exit(1);
  }

  console.log("\n🚀 Sending grantRole transaction...");
  const tx = await contract.grantRole(REGISTRAR_ROLE, targetAddress, {
    maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
    maxFeePerGas: ethers.parseUnits("50", "gwei"),
  });
  console.log(`   Tx hash: ${tx.hash}`);
  await tx.wait();

  // Verify
  const hasRole = await contract.hasRole(REGISTRAR_ROLE, targetAddress);
  console.log(`\n✅ REGISTRAR_ROLE granted: ${hasRole ? "YES" : "NO"}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((error) => {
  console.error("\n❌ Failed:", error.message || error);
  process.exitCode = 1;
});
