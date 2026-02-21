/**
 * utils/contract.js
 * Thin wrapper around ethers.js for interacting with LandRegistry.sol
 */

import { ethers } from "ethers";
import ABI from "../abi/LandRegistry.json";
import { CONTRACT_ADDRESS, RPC_URL } from "../constants";

// ── Read-only provider (no wallet needed) ─────────────────────────────────────
export function getReadProvider() {
  return new ethers.JsonRpcProvider(RPC_URL);
}

// ── Read-only contract instance ───────────────────────────────────────────────
export function getReadContract() {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, getReadProvider());
}

// ── Write contract instance (needs a signer from MetaMask) ───────────────────
export function getWriteContract(signer) {
  return new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
}

// ── Fetch a single property ───────────────────────────────────────────────────
export async function fetchProperty(tokenId) {
  const contract = getReadContract();
  const [price, status, seller, buyer, escrow] = await contract.getProperty(tokenId);
  const uri = await contract.tokenURI(tokenId);
  return {
    tokenId: Number(tokenId),
    price,
    priceEth: ethers.formatEther(price),
    status: Number(status),
    seller,
    buyer,
    escrow,
    uri,
  };
}

// ── Fetch all minted properties ───────────────────────────────────────────────
export async function fetchAllProperties() {
  const contract = getReadContract();
  const total = await contract.totalProperties();
  const ids = Array.from({ length: Number(total) }, (_, i) => i);
  const properties = await Promise.all(ids.map(fetchProperty));
  return properties;
}

// ── Fetch metadata JSON from IPFS gateway ────────────────────────────────────
export async function fetchMetadata(uri) {
  if (!uri) return null;
  try {
    const url = uri.startsWith("ipfs://")
      ? `${import.meta.env.VITE_PINATA_GATEWAY}/ipfs/${uri.slice(7)}`
      : uri;
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ── Format price helper ───────────────────────────────────────────────────────
export function formatPrice(weiPrice) {
  return ethers.formatEther(weiPrice);
}

export function parsePrice(ethAmount) {
  return ethers.parseEther(String(ethAmount));
}

/** Resolve an IPFS CID / ipfs:// URI to a viewable HTTP gateway URL */
export function ipfsToHttp(cid) {
  if (!cid) return "";
  const clean = cid.replace(/^ipfs:\/\//, "");
  return `${import.meta.env.VITE_PINATA_GATEWAY || "https://gateway.pinata.cloud"}/ipfs/${clean}`;
}
