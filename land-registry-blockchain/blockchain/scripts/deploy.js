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
  projectRoot,
  "artifacts",
  "contracts",
  "LandRegistry.sol",
  "LandRegistry.json"
);
const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));

async function main() {
  // ── Provider & Signer ─────────────────────────────────────────────────────
  const provider = new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology");
  const wallet   = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  🏛️  LandRegistry Deployment — Polygon Amoy");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  Deployer address : ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`  Deployer balance : ${ethers.formatEther(balance)} MATIC`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  if (balance === 0n) {
    console.error("\n❌ Deployer has 0 MATIC balance.");
    console.error("   Please fund your wallet at: https://faucet.polygon.technology/");
    process.exit(1);
  }

  // ── Deploy ────────────────────────────────────────────────────────────────
  console.log("\n🚀 Deploying LandRegistry...\n");

  const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);
  const contract = await factory.deploy();
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ LandRegistry deployed successfully!");
  console.log(`   Contract address : ${contractAddress}`);

  // ── Verify REGISTRAR_ROLE was granted in constructor ──────────────────────
  const REGISTRAR_ROLE = await contract.REGISTRAR_ROLE();
  const hasRole = await contract.hasRole(REGISTRAR_ROLE, wallet.address);

  console.log(`   REGISTRAR_ROLE   : ${REGISTRAR_ROLE}`);
  console.log(`   Deployer is Registrar: ${hasRole ? "✅ YES" : "❌ NO"}`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  📋  Save these values in your .env / frontend:");
  console.log(`  CONTRACT_ADDRESS=${contractAddress}`);
  console.log(`  REGISTRAR_ADDRESS=${wallet.address}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main().catch((error) => {
  console.error("\n❌ Deployment failed:");
  console.error(error.message || error);
  process.exitCode = 1;
});