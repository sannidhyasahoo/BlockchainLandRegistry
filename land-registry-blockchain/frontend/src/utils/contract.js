/**
 * utils/contract.js
 * Thin wrapper around ethers.js for interacting with LandRegistry.sol
 */

import { ethers } from "ethers";
import artifact from "../abi/LandRegistry.json";
const ABI = artifact.abi;
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
  const [price, status, seller, potentialBuyer, trustRecorded, sellerConfirmed, escrow, frozen] =
    await contract.getProperty(tokenId);
  const uri = await contract.tokenURI(tokenId);
  return {
    tokenId: Number(tokenId),
    price,
    priceEth: ethers.formatEther(price),
    status: Number(status),
    seller,
    potentialBuyer,
    trustRecorded,
    sellerConfirmed,
    escrow,
    frozen,
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

// ── Fetch pending mint requests ──────────────────────────────────────────────
export async function fetchPendingMints() {
  const contract = getReadContract();
  try {
    const total = await contract.nextRequestId();
    const ids = Array.from({ length: Number(total) }, (_, i) => i);
    const requests = [];
    for (const id of ids) {
      const [seller, uri, price, isPending] = await contract.mintRequests(id);
      if (isPending) {
        requests.push({
          requestId: Number(id),
          seller,
          uri,
          price,
          priceEth: ethers.formatEther(price),
        });
      }
    }
    return requests;
  } catch (err) {
    console.error("fetchPendingMints error:", err);
    return [];
  }
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

/**
 * Gas overrides for Polygon Amoy.
 * MetaMask's BrowserProvider ignores provider-level getFeeData overrides,
 * so we must pass explicit gas params in every write transaction.
 */
export function gasOverrides(extra = {}) {
  return {
    maxPriorityFeePerGas: ethers.parseUnits("30", "gwei"),
    maxFeePerGas: ethers.parseUnits("50", "gwei"),
    ...extra,
  };
}

