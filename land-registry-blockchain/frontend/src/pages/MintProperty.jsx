/**
 * pages/MintProperty.jsx
 * Citizen form: upload to IPFS and request mint
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useWallet } from "../context/WalletContext";
import { uploadFileToIPFS, uploadMetadataToIPFS } from "../utils/ipfs";
import { getWriteContract, parsePrice, gasOverrides } from "../utils/contract";
import { BLOCK_EXPLORER } from "../constants";

const INITIAL = {
  name: "",
  description: "",
  area: "",
  type: "Residential",
  zone: "",
  legalStatus: "Clear Title",
  priceEth: "",
};

export default function MintProperty() {
  const { signer } = useWallet();
  const role = localStorage.getItem("userRole");
  const navigate = useNavigate();

  const [form, setForm]       = useState(INITIAL);
  const [deedFile, setDeed]   = useState(null);
  const [imageFile, setImage] = useState(null);
  const [step, setStep]       = useState("idle");
  const [txHash, setTxHash]   = useState("");

  if (role === "registrar") {
    return (
      <div className="page" style={{ textAlign: "center", padding: "80px 20px", color: "var(--text-3)" }}>
        <p>Registrars cannot request mints.</p>
      </div>
    );
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!deedFile)              return toast.error("Upload a deed document.");
    if (!form.priceEth || isNaN(Number(form.priceEth))) return toast.error("Enter a valid price.");

    try {
      setStep("uploading-deed");
      toast.loading("Uploading deed to IPFS…", { id: "mint" });
      const fileCID = await uploadFileToIPFS(deedFile);

      let imageCID = null;
      if (imageFile) {
        setStep("uploading-image");
        toast.loading("Uploading image…", { id: "mint" });
        imageCID = await uploadFileToIPFS(imageFile);
      }

      setStep("uploading-meta");
      toast.loading("Uploading metadata…", { id: "mint" });
      const metaCID = await uploadMetadataToIPFS(form, fileCID, imageCID);
      const tokenURI = `ipfs://${metaCID}`;

      setStep("minting");
      toast.loading("Confirm in MetaMask…", { id: "mint" });
      const contract = getWriteContract(signer);
      const price = parsePrice(form.priceEth);
      const tx = await contract.requestMint(tokenURI, price, gasOverrides());

      toast.loading("Mining transaction…", { id: "mint" });
      await tx.wait();

      setTxHash(tx.hash);
      setStep("done");
      toast.success("Mint request submitted! 🎉", { id: "mint" });
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
          <h2>Mint Request Submitted</h2>
          <p>Your property has been submitted for registrar approval.</p>
          <a href={`${BLOCK_EXPLORER}/tx/${txHash}`} target="_blank" rel="noopener noreferrer" className="btn-primary">
            View on PolygonScan ↗
          </a>
          <div className="success-actions">
            <button className="btn-secondary" onClick={() => { setForm(INITIAL); setStep("idle"); }}>Mint Another</button>
            <button className="btn-ghost" onClick={() => navigate("/user-dashboard")}>View Properties</button>
          </div>
        </div>
      </div>
    );
  }

  const busy = step !== "idle";
  const stepLabel = {
    "uploading-deed":  "Uploading deed to IPFS…",
    "uploading-image": "Uploading image to IPFS…",
    "uploading-meta":  "Building metadata…",
    "minting":         "Minting on chain…",
  }[step] || "";

  return (
    <div className="page">
      <div className="page-header">
        <h1>Request New Mint</h1>
        <p>Upload land documents to IPFS and submit a mint request</p>
      </div>

      <form className="mint-form" onSubmit={handleSubmit}>
        {/* Property Details */}
        <section className="form-section">
          <h3>Property Details</h3>
          <div className="form-row">
            <label>
              Name *
              <input value={form.name} onChange={(e) => set("name", e.target.value)}
                placeholder="Plot #101 – MSR Nagar" required disabled={busy} />
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
              placeholder="Brief description of the property"
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

        {/* Price */}
        <section className="form-section">
          <h3>Listing</h3>
          <div className="form-row">
            <label>
              Price (POL) *
              <input type="number" step="0.001" min="0" value={form.priceEth}
                onChange={(e) => set("priceEth", e.target.value)}
                placeholder="10.5" required disabled={busy} />
            </label>
          </div>
        </section>

        {/* Documents */}
        <section className="form-section">
          <h3>Documents</h3>
          <div className="form-row">
            <label className="file-label">
              <span>Deed Document * <em>(PDF or image)</em></span>
              <div className={`file-drop ${deedFile ? "has-file" : ""}`}
                onClick={() => document.getElementById("deed-input").click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setDeed(e.dataTransfer.files[0]); }}
              >
                {deedFile ? (
                  <>{deedFile.name}</>
                ) : (
                  <>Click or drag to upload</>
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
                  <>{imageFile.name}</>
                ) : (
                  <>Click or drag to upload</>
                )}
              </div>
              <input id="image-input" type="file" accept="image/*"
                onChange={(e) => setImage(e.target.files[0])} hidden />
            </label>
          </div>
        </section>

        {/* Submit */}
        <div className="form-submit">
          {busy && <div className="step-indicator">{stepLabel}</div>}
          <button type="submit" className="btn-primary btn-large" disabled={busy}>
            {busy ? "Processing…" : "Submit Mint Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
