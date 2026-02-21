/**
 * pages/MintProperty.jsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Registrar-only form:
 *  1. Fill property details
 *  2. Upload deed PDF → Pinata → File CID
 *  3. Optional image upload → Image CID
 *  4. Build ERC-721 metadata → Metadata CID (tokenURI)
 *  5. Call mintProperty(seller, tokenURI, price)
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useWallet } from "../context/WalletContext";
import { uploadFileToIPFS, uploadMetadataToIPFS } from "../utils/ipfs";
import { getWriteContract, parsePrice } from "../utils/contract";
import { BLOCK_EXPLORER } from "../constants";

const INITIAL = {
  name: "",
  description: "",
  area: "",
  type: "Residential",
  zone: "",
  legalStatus: "Clear Title",
  sellerAddress: "",
  priceEth: "",
};

export default function MintProperty() {
  const { signer, isRegistrar } = useWallet();
  const navigate = useNavigate();

  const [form, setForm]       = useState(INITIAL);
  const [deedFile, setDeed]   = useState(null);
  const [imageFile, setImage] = useState(null);
  const [step, setStep]       = useState("idle"); // idle | uploading-deed | uploading-image | uploading-meta | minting | done
  const [txHash, setTxHash]   = useState("");

  if (!isRegistrar) {
    return (
      <div className="page">
        <div className="access-denied">
          <span>🔒</span>
          <h2>Registrar Access Only</h2>
          <p>Only the registered government Registrar wallet can mint new properties.</p>
        </div>
      </div>
    );
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── Validation ────────────────────────────────────────────────
    if (!deedFile)              return toast.error("Upload a deed document (PDF/image).");
    if (!form.sellerAddress)    return toast.error("Enter the seller's wallet address.");
    if (!form.priceEth || isNaN(Number(form.priceEth))) return toast.error("Enter a valid price.");

    try {
      // Step 1: Upload deed to IPFS
      setStep("uploading-deed");
      toast.loading("Uploading deed to IPFS…", { id: "mint" });
      const fileCID = await uploadFileToIPFS(deedFile);

      // Step 2: Upload image if separate
      let imageCID = null;
      if (imageFile) {
        setStep("uploading-image");
        toast.loading("Uploading property image…", { id: "mint" });
        imageCID = await uploadFileToIPFS(imageFile);
      }

      // Step 3: Build and upload metadata
      setStep("uploading-meta");
      toast.loading("Uploading metadata to IPFS…", { id: "mint" });
      const metaCID = await uploadMetadataToIPFS(form, fileCID, imageCID);
      const tokenURI = `ipfs://${metaCID}`;

      // Step 4: Mint on-chain
      setStep("minting");
      toast.loading("Confirm transaction in MetaMask…", { id: "mint" });
      const contract = getWriteContract(signer);
      const price = parsePrice(form.priceEth);
      const tx = await contract.mintProperty(form.sellerAddress, tokenURI, price);

      toast.loading("Mining transaction…", { id: "mint" });
      await tx.wait();

      setTxHash(tx.hash);
      setStep("done");
      toast.success("Property minted successfully! 🎉", { id: "mint" });
    } catch (err) {
      setStep("idle");
      toast.error(err.reason || err.message || "Transaction failed", { id: "mint" });
    }
  };

  if (step === "done") {
    return (
      <div className="page">
        <div className="success-panel">
          <div className="success-icon">✅</div>
          <h2>Property Minted!</h2>
          <p>The property NFT has been minted and listed on-chain.</p>
          <a href={`${BLOCK_EXPLORER}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
            View on PolygonScan ↗
          </a>
          <div className="success-actions">
            <button className="btn-secondary" onClick={() => { setForm(INITIAL); setStep("idle"); }}>Mint Another</button>
            <button className="btn-ghost" onClick={() => navigate("/dashboard")}>View All Properties</button>
          </div>
        </div>
      </div>
    );
  }

  const busy = step !== "idle";
  const stepLabel = {
    "uploading-deed":  "⬆ Uploading deed to IPFS…",
    "uploading-image": "⬆ Uploading image to IPFS…",
    "uploading-meta":  "⬆ Building metadata on IPFS…",
    "minting":         "⛏ Minting on blockchain…",
  }[step] || "";

  return (
    <div className="page">
      <div className="page-header">
        <h1>✦ Mint New Property</h1>
        <p>Upload land documents to IPFS and register the property NFT on-chain</p>
      </div>

      <form className="mint-form" onSubmit={handleSubmit}>
        {/* ── Property Details ─────────────────────────────── */}
        <section className="form-section">
          <h3>Property Details</h3>
          <div className="form-row">
            <label>
              Property Name *
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Plot #101 – MSR Nagar, Bengaluru" required disabled={busy} />
            </label>
            <label>
              Area
              <input value={form.area} onChange={(e) => set("area", e.target.value)}
                placeholder="1200 sqft" disabled={busy} />
            </label>
          </div>
          <div className="form-row">
            <label>
              Type
              <select value={form.type} onChange={(e) => set("type", e.target.value)} disabled={busy}>
                {["Residential","Commercial","Agricultural","Industrial"].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label>
              Zone
              <input value={form.zone} onChange={(e) => set("zone", e.target.value)}
                placeholder="North Bengaluru" disabled={busy} />
            </label>
          </div>
          <label>
            Description *
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              placeholder="A 1200 sqft residential plot near RIT-B campus. Verified by Registrar."
              rows={3} required disabled={busy} />
          </label>
          <label>
            Legal Status
            <select value={form.legalStatus} onChange={(e) => set("legalStatus", e.target.value)} disabled={busy}>
              {["Clear Title","Under Litigation","Disputed","Encumbered"].map(s => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
        </section>

        {/* ── Seller & Price ───────────────────────────────── */}
        <section className="form-section">
          <h3>Listing Details</h3>
          <div className="form-row">
            <label>
              Seller Wallet Address *
              <input value={form.sellerAddress} onChange={(e) => set("sellerAddress", e.target.value)}
                placeholder="0xSeller..." required disabled={busy} />
            </label>
            <label>
              Listing Price (POL) *
              <input type="number" step="0.001" min="0" value={form.priceEth}
                onChange={(e) => set("priceEth", e.target.value)}
                placeholder="10.5" required disabled={busy} />
            </label>
          </div>
        </section>

        {/* ── Document Upload ──────────────────────────────── */}
        <section className="form-section">
          <h3>Documents (IPFS)</h3>
          <div className="form-row">
            <label className="file-label">
              <span>Deed Document * <em>(PDF or image)</em></span>
              <div className={`file-drop ${deedFile ? "has-file" : ""}`}
                onClick={() => document.getElementById("deed-input").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setDeed(e.dataTransfer.files[0]); }}
              >
                {deedFile ? (
                  <><span className="file-icon">📄</span>{deedFile.name}</>
                ) : (
                  <><span className="file-icon">⬆</span>Click or drag file here</>
                )}
              </div>
              <input id="deed-input" type="file" accept=".pdf,image/*"
                onChange={(e) => setDeed(e.target.files[0])} hidden />
            </label>

            <label className="file-label">
              <span>Property Image <em>(optional)</em></span>
              <div className={`file-drop ${imageFile ? "has-file" : ""}`}
                onClick={() => document.getElementById("image-input").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setImage(e.dataTransfer.files[0]); }}
              >
                {imageFile ? (
                  <><span className="file-icon">🖼️</span>{imageFile.name}</>
                ) : (
                  <><span className="file-icon">⬆</span>Click or drag file here</>
                )}
              </div>
              <input id="image-input" type="file" accept="image/*"
                onChange={(e) => setImage(e.target.files[0])} hidden />
            </label>
          </div>
        </section>

        {/* ── Submit ───────────────────────────────────────── */}
        <div className="form-submit">
          {busy && <div className="step-indicator">{stepLabel}</div>}
          <button type="submit" className="btn-primary btn-large" disabled={busy}>
            {busy ? "Processing…" : "⬆ Upload to IPFS & Mint NFT"}
          </button>
        </div>
      </form>
    </div>
  );
}
