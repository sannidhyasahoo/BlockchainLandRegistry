// ── Contract ──────────────────────────────────────────────────────────────────
export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS;
export const REGISTRAR_ADDRESS = import.meta.env.VITE_REGISTRAR_ADDRESS?.toLowerCase();
export const CHAIN_ID = Number(import.meta.env.VITE_NETWORK_CHAIN_ID) || 80002;
export const RPC_URL = import.meta.env.VITE_RPC_URL;
export const BLOCK_EXPLORER = import.meta.env.VITE_BLOCK_EXPLORER;

// ── Pinata ────────────────────────────────────────────────────────────────────
export const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;
export const PINATA_GATEWAY = import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud";

// ── Property Status Enum (mirrors Solidity) ───────────────────────────────────
export const STATUS = {
  0: { label: "Active",   color: "#22c55e", bg: "#052e16" },
  1: { label: "Pending",  color: "#f59e0b", bg: "#451a03" },
  2: { label: "Sold",     color: "#6366f1", bg: "#1e1b4b" },
  3: { label: "Disputed", color: "#ef4444", bg: "#450a0a" },
};

// ── Amoy Network Definition (for wallet_switchEthereumChain) ─────────────────
export const AMOY_NETWORK = {
  chainId: `0x${CHAIN_ID.toString(16)}`,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  rpcUrls: [RPC_URL],
  blockExplorerUrls: [BLOCK_EXPLORER],
};
