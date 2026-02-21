/**
 * utils/ipfs.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Two exports that implement the full Pinata IPFS workflow:
 *
 *  1. uploadFileToIPFS(file)        → returns CID of the raw file
 *  2. uploadMetadataToIPFS(details, fileCID) → returns final metadata CID (tokenURI)
 */

import { PINATA_JWT, PINATA_GATEWAY } from "../constants";

const PINATA_UPLOAD_URL = "https://uploads.pinata.cloud/v3/files";

// ── Helper: call Pinata & return CID ─────────────────────────────────────────
async function pinataUpload(formData) {
  if (!PINATA_JWT || PINATA_JWT === "your_pinata_jwt_here") {
    throw new Error(
      "Pinata JWT not configured. Add VITE_PINATA_JWT to your frontend/.env file."
    );
  }

  const res = await fetch(PINATA_UPLOAD_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${PINATA_JWT}` },
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.details || `Pinata upload failed (${res.status})`);
  }

  const data = await res.json();
  return data.data.cid;          // returns the IPFS CID string
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Upload a PDF or image file to IPFS via Pinata.
 * @param {File} file  Browser File object
 * @returns {Promise<string>} CID of the uploaded file
 */
export async function uploadFileToIPFS(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("name", file.name);
  formData.append("network", "public");

  return pinataUpload(formData);
}

// ─────────────────────────────────────────────────────────────────────────────
/**
 * Build ERC-721 compliant metadata and upload it to IPFS via Pinata.
 *
 * @param {object} details
 *   @param {string} details.name           e.g. "Plot #101 - MSR Nagar"
 *   @param {string} details.description    e.g. "1200 sqft residential plot"
 *   @param {string} details.area           e.g. "1200 sqft"
 *   @param {string} details.type           e.g. "Residential"
 *   @param {string} details.zone           e.g. "North Bengaluru"
 *   @param {string} details.legalStatus    e.g. "Clear Title"
 *   @param {number} details.tokenId        optional, for external_url
 * @param {string} fileCID   CID of the deed document from uploadFileToIPFS()
 * @param {string} [imageCID]  Optional separate image CID
 * @returns {Promise<string>} Final metadata CID to use as tokenURI
 */
export async function uploadMetadataToIPFS(details, fileCID, imageCID) {
  const metadata = {
    name: details.name,
    description: details.description,
    image: imageCID
      ? `ipfs://${imageCID}`
      : `ipfs://${fileCID}`,           // fallback to deed if no separate image
    external_url: details.tokenId
      ? `${window.location.origin}/property/${details.tokenId}`
      : window.location.origin,
    attributes: [
      { trait_type: "Area",         value: details.area },
      { trait_type: "Type",         value: details.type },
      { trait_type: "Zone",         value: details.zone },
      { trait_type: "Legal_Status", value: details.legalStatus },
      { trait_type: "Deed_CID",     value: fileCID },
    ],
  };

  // Convert JSON to a File blob and upload
  const blob = new Blob([JSON.stringify(metadata, null, 2)], {
    type: "application/json",
  });
  const metaFile = new File([blob], "metadata.json");

  const formData = new FormData();
  formData.append("file", metaFile);
  formData.append("name", `LandRegistry - ${details.name}`);
  formData.append("network", "public");

  const cid = await pinataUpload(formData);
  return cid;    // This becomes the tokenURI: `ipfs://<cid>`
}

// ─────────────────────────────────────────────────────────────────────────────
/** Resolve an IPFS CID to a viewable gateway URL */
export function ipfsToHttp(cid) {
  if (!cid) return "";
  const clean = cid.replace(/^ipfs:\/\//, "");
  return `${PINATA_GATEWAY}/ipfs/${clean}`;
}
