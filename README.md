<div align="center">
  
  # 🏛️ LandChain: The Future of Real Estate On-Chain
  
  ### Transparent, Secure, and Instant Physical Asset Tokenization
  
  **Mint, trade, lease, and form partnerships on immutable property deeds.** <br/>
  *Experience decentralized transactions equipped with 3-party trust mechanics and AI-powered risk assessment.*

  <br />

  [![Solidity](https://img.shields.io/badge/Solidity-%23363636.svg?style=for-the-badge&logo=solidity&logoColor=white)](https://soliditylang.org/)
  [![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
  [![Polygon](https://img.shields.io/badge/Polygon-%238247E5.svg?style=for-the-badge&logo=polygon&logoColor=white)](https://polygon.technology/)
  
</div>

---

## 🌟 Vision & Overview

The traditional real estate industry is plagued by bureaucratic inefficiencies, opaque legal histories, rampant fraud, and agonizingly slow settlement times. For a market worth hundreds of trillions of dollars globally, the infrastructure relies on an archaic system of paper deeds and fragmented databases.

**LandChain** fundamentally disrupts this model. It is a next-generation decentralized application (dApp) designed to securely digitize and manage the entire lifecycle of Real World Assets (RWAs). By leveraging the security of the **Polygon blockchain**, AI-driven anomaly detection via **Google Gemini**, and a beautiful, intuitive frontend, LandChain eliminates middlemen and introduces an era of absolute ownership transparency.

Whether you are minting a new property ledger, executing a high-value decentralized sale via secure escrow, fractionalizing ownership into a smart partnership, or negotiating an automated lease—LandChain handles the complex legal and trust mechanics transparently on-chain.

---

## 🔥 The "Why": Impact & Benefits

### For Buyers & Citizens
*   **Zero Fraud:** Because property histories are immutable and publicly auditable on the blockchain, "double-selling" or forging deeds becomes cryptographically impossible.
*   **Instant Settlement:** Escrow funds and property title transfers execute atomically via smart contracts. What used to take 30–60 days in a traditional closing process now happens in seconds once trust is established.
*   **Democratized Access:** Through the **Smart Partnerships** module, everyday investors can pool capital to co-own high-value real estate 50/50 without complex legal structuring.

### For Authorities & Registrars
*   **AI Pre-emptive Auditing:** The ecosystem doesn't solely rely on human review. LandChain integrates **Google Gemini AI** directly into the Registrar Console. Before a property is minted, the AI evaluates the metadata, deed CID, and pricing to flag high-risk anomalies (e.g., severe under-pricing, suspicious descriptions).
*   **Deep Block Sweeping:** Registrars have access to a deterministic timeline. Every state change (Minted, Trust Recorded, Funds Escrowed, Transferred, Frozen) is queryable, offering a pristine audit trail.
*   **Emergency Intervention:** Through the **Dispute & Freeze Module**, authorities can instantaneously halt trading on contested properties by logging an IPFS CID of a valid court order on-chain.

---

## ✨ Core Mechanics

### 🛡️ The 3-Step Trust Matrix
Decentralized physical asset sales carry the unique problem of the "Oracle Problem"—proving a digital transaction mapped to a physical reality. LandChain solves this:
1.  **Minting:** Property is added to the ledger pending Registrar approval.
2.  **Physical Trust Registration:** Both the buyer and the seller (or a 51% consensus of partners) must cryptographically sign that they have met physically and inspected the real-world property.
3.  **Escrow & Finalization:** Only after physical trust is recorded can the buyer deposit MATIC/POL into the contract's secure escrow. The seller then finalizes the transfer, simultaneously releasing the deed to the buyer and the funds to the seller(s).

### 🏢 Smart Partnerships (Multi-Sig)
Fractionalize ownership instantly. Co-own properties with customizable percentage splits. 
*   **Automated Revenue:** When a partnered property is sold or leased out, the smart contract automatically routes the profit to the respective partners according to their fractional share.
*   **Consensus Execution:** Critical actions (like selling the property) require a multi-sig approval process ensuring no single partner goes rogue.

### ⏳ Automated Leases
Don't want to sell? Lease your property out. Smart contracts handle upfront rent collection, strictly enforce lease durations, and auto-expire access rights seamlessly.

---

## 🏗️ Technical Architecture

LandChain is built on a split architecture ensuring maximum security, blistering speed, and a premium "glassmorphic" user experience.

1.  **Frontend (`/frontend`)**: 
    *   **Framework**: React.js powered by Vite.
    *   **Styling**: Tailwind CSS utilizing highly customized, GPU-accelerated micro-animations (`pulse-glow`, `float`, `gradient-shift`).
    *   **Authentication**: Clerk for robust, Web2-friendly onboarding.
    *   **AI Integration**: `@google/generative-ai` SDK communicating with Gemini 1.5.
2.  **Blockchain (`/blockchain`)**: 
    *   **Network**: Polygon Amoy Testnet.
    *   **Contracts**: Solidity `^0.8.20` featuring OpenZeppelin's `ERC721URIStorage` and `AccessControl`.
    *   **Storage**: Pinata IPFS for decentralized storage of property JPEGs and PDF Deeds.

---

## 🚀 Getting Started (Local Development)

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16+)
*   [MetaMask](https://metamask.io/) extension installed in your browser.
*   Test MATIC on the Polygon Amoy network (available via [Polygon Faucet](https://faucet.polygon.technology/)).

### 1. Smart Contract Setup

```bash
cd blockchain

# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to Polygon Amoy
# Note: Ensure your .env has PRIVATE_KEY populated with your wallet containing Amoy MATIC.
npm run deploy:amoy
```

*Save the deployed contract address! You will need it in the next step.*

### 2. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Update Environment Variables
# Create a .env file and populate it with the required keys
# Ensure you copy your newly deployed CONTRACT_ADDRESS to VITE_CONTRACT_ADDRESS

# Start the development server
npm run dev
```

Visit `http://localhost:5173` to view the application!

---

## 🔐 Environment Variables

You will need the following APIs and keys to run LandChain at its full potential:

*   `VITE_CONTRACT_ADDRESS`: The deployed address of your LandRegistry.sol contract.
*   `VITE_REGISTRAR_ADDRESS`: The wallet address of the deployment account (which holds the `REGISTRAR_ROLE`).
*   `VITE_RPC_URL`: Set to `https://rpc-amoy.polygon.technology`.
*   `VITE_PINATA_JWT` / `VITE_PINATA_GATEWAY`: For Pinata IPFS uploads.
*   `VITE_CLERK_PUBLISHABLE_KEY`: For user authentication.
*   `VITE_GEMINI_API_KEY`: Required for the AI Preemptive Evaluation feature in the Registrar Console.

---

## 📄 P.S. Demo Resilience

To ensure flawless demonstrations at hackathons, LandChain features **Synthetic History Generation**. 
Public RPC endpoints often rate-limit heavy block-sweeping queries (which breaks transaction history logs). If the frontend detects an RPC timeout while pulling logs, it automatically generates a deterministic timeline of synthetic events based directly on the property’s current state struct on-chain. 

This guarantees that the **Audit History** tab is always beautifully populated and functional on stage, regardless of network congestion!

---
<div align="center">
  <i>Built for the Future of Decentralized Real Estate. By Sannidhya Sahoo.</i>
</div>
