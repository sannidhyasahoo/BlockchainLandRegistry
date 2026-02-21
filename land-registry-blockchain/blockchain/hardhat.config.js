import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// ── Load .env manually (avoids dotenvx/dotenv version quirks) ─────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, ".env");

let PRIVATE_KEY = "";
try {
  const envContent = readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed.startsWith("PRIVATE_KEY=")) {
      PRIVATE_KEY = trimmed.split("=").slice(1).join("=").trim();
      break;
    }
  }
} catch {
  console.warn("⚠️  .env file not found – PRIVATE_KEY will be empty.");
}

/** @type {import("hardhat/config").HardhatUserConfig} */
const config = {
  // ── Solidity Compiler ──────────────────────────────────────────
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },

  // ── Source Paths ───────────────────────────────────────────────
  paths: {
    sources: { solidity: ["./contracts"] },
  },

  // ── Networks ───────────────────────────────────────────────────
  networks: {
    // Polygon Amoy Testnet (chainId: 80002)
    amoy: {
      type: "http",
      url: "https://rpc-amoy.polygon.technology",
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      chainId: 80002,
    },
  },
};

export default config;
