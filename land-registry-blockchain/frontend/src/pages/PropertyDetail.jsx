/**
 * pages/PropertyDetail.jsx
 * Full property view with timeline and role-based actions.
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchProperty, fetchMetadata, getWriteContract, gasOverrides } from "../utils/contract";
import { ipfsToHttp } from "../utils/ipfs";
import StatusBadge from "../components/StatusBadge";
import { useWallet } from "../context/WalletContext";
import { BLOCK_EXPLORER, CONTRACT_ADDRESS } from "../constants";
import { ethers } from "ethers";

export default function PropertyDetail() {
  const { id } = useParams();
  const { address, signer } = useWallet();
  const role = localStorage.getItem("userRole");
  const isRegistrarRole = role === "registrar";
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [meta, setMeta]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchProperty(Number(id));
      setProperty(p);
      if (p.uri) { const m = await fetchMetadata(p.uri); setMeta(m); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Actions
  const doTx = async (label, fn) => {
    setBusy(true);
    const toastId = toast.loading(label + "…");
    try {
      const contract = getWriteContract(signer);
      const tx = await fn(contract);
      toast.loading("Mining…", { id: toastId });
      await tx.wait();
      toast.success("Done! 🎉", { id: toastId });
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const handleDeposit = () => {
    if (!property) return;
    doTx("Depositing escrow", (c) => c.depositFunds(property.tokenId, gasOverrides({ value: property.price })));
  };
  const handleFinalize = () => doTx("Finalizing", (c) => c.finalizeTransfer(Number(id), gasOverrides()));
  const handleFreeze = () => doTx("Toggling freeze", (c) => c.toggleFreeze(Number(id), gasOverrides()));

  if (loading) {
    return <div className="page"><div className="loading-spinner">Loading property…</div></div>;
  }
  if (!property) {
    return <div className="page"><div className="empty-state"><span>❌</span><p>Property not found.</p></div></div>;
  }

  const priceEth = ethers.formatEther(property.price || "0");
  const imageUrl = meta?.image ? ipfsToHttp(meta.image) : null;
  const short = (addr) => addr ? `${addr.slice(0, 8)}…${addr.slice(-6)}` : "—";
  const isSeller = address?.toLowerCase() === property.seller?.toLowerCase();
  const isBuyer = address?.toLowerCase() === property.potentialBuyer?.toLowerCase();

  const deedCid = meta?.attributes?.find(a => a.trait_type === "Deed_CID")?.value;

  const steps = [
    { s: 1, label: "Minted" },
    { s: 2, label: "Trusted" },
    { s: 3, label: "Escrowed" },
    { s: 4, label: "Confirmed" },
    { s: 5, label: "Sold" },
  ];

  return (
    <div className="page detail-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="detail-layout">
        {/* Left Column */}
        <div>
          <div className="detail-image">
            {imageUrl ? <img src={imageUrl} alt={meta?.name} /> : (
              <div className="detail-image-placeholder">🏠</div>
            )}
          </div>

          {/* Meta list */}
          <div className="detail-meta-list">
            <div className="meta-row">
              <span className="meta-key">Token ID</span>
              <span className="meta-val">#{property.tokenId}</span>
            </div>
            <div className="meta-row">
              <span className="meta-key">Owner</span>
              <span className="meta-val" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{short(property.seller)}</span>
            </div>
            {property.potentialBuyer && property.potentialBuyer !== ethers.ZeroAddress && (
              <div className="meta-row">
                <span className="meta-key">Buyer</span>
                <span className="meta-val" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{short(property.potentialBuyer)}</span>
              </div>
            )}
            <div className="meta-row">
              <span className="meta-key">Escrow</span>
              <span className="meta-val" style={{ color: "var(--teal)" }}>{ethers.formatEther(property.escrow)} POL</span>
            </div>
            <div className="meta-row">
              <span className="meta-key">Contract</span>
              <a className="meta-val" href={`${BLOCK_EXPLORER}/address/${CONTRACT_ADDRESS}`}
                target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-2)", fontSize: "11px" }}>
                View on PolygonScan ↗
              </a>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div>
          <div className="detail-header">
            <h1>{meta?.name || `Property #${property.tokenId}`}</h1>
            <StatusBadge status={property.status} />
          </div>

          <p className="detail-desc">{meta?.description || "No description available."}</p>

          {/* Info Grid */}
          <div className="detail-info-grid">
            <div className="info-card">
              <span className="info-label">Price</span>
              <span className="info-value highlight">{priceEth} POL</span>
            </div>
            {meta?.attributes?.filter(a => !a.trait_type.includes("CID")).map(a => (
              <div className="info-card" key={a.trait_type}>
                <span className="info-label">{a.trait_type.replace(/_/g, " ")}</span>
                <span className="info-value">{a.value}</span>
              </div>
            ))}
          </div>

          {/* Deed Document */}
          {deedCid && (
            <a className="deed-link" href={ipfsToHttp(deedCid)} target="_blank" rel="noopener noreferrer">
              📄 View Deed Document ↗
            </a>
          )}

          {/* Timeline */}
          <div style={{
            display: "flex", gap: "8px", alignItems: "center",
            padding: "14px 18px", background: "var(--bg-glass)",
            borderRadius: "12px", marginBottom: "24px",
            fontSize: "11px", fontWeight: 700,
            border: "1px solid var(--border-soft)",
            flexWrap: "wrap"
          }}>
            {steps.map((st, i) => (
              <span key={st.s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                {i > 0 && <span style={{ color: "var(--text-3)", margin: "0 2px" }}>→</span>}
                <span style={{ color: property.status >= st.s ? "var(--teal)" : "var(--text-3)" }}>
                  {st.label}
                </span>
              </span>
            ))}
          </div>

          {/* Actions */}
          <div className="action-panel">
            {/* Sold */}
            {property.status === 5 && <div className="sold-notice">Property has been sold. Ownership transferred.</div>}

            {/* Frozen */}
            {property.frozen && (
              <div className="action-block danger">
                <h4>❄️ Property Frozen</h4>
                <p>This property is currently frozen by the Registrar due to dispute or collateral issues.</p>
              </div>
            )}

            {/* Buyer: Deposit (only designated buyer after trust is recorded) */}
            {isBuyer && property.status === 2 && !isRegistrarRole && (
              <div className="action-block">
                <h4>💰 Deposit Escrow</h4>
                <p>
                  Trust has been recorded between you and the seller. Deposit <strong style={{ color: "var(--teal)" }}>{priceEth} POL</strong> to 
                  lock funds in escrow. The seller will then confirm, and the Registrar will approve the final transfer.
                </p>
                <button className="btn-success btn-large" onClick={handleDeposit} disabled={busy}>
                  {busy ? "Processing…" : `Deposit ${priceEth} POL`}
                </button>
              </div>
            )}

            {/* Info for non-designated buyer: property available for trust */}
            {!isSeller && !isBuyer && property.status === 1 && !isRegistrarRole && address && (
              <div className="action-block">
                <h4>🏠 Interested in this property?</h4>
                <p>
                  Contact the seller physically to establish trust. Once you meet, the seller will record your wallet address 
                  as a trusted buyer, enabling you to deposit funds into escrow.
                </p>
                <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>
                  Your wallet: {address}
                </div>
              </div>
            )}

            {/* Registrar: Finalize */}
            {isRegistrarRole && property.status === 4 && (
              <div className="action-block">
                <h4>Finalize Transfer</h4>
                <p>Both parties confirmed. Execute the NFT transfer and release escrowed POL to the seller.</p>
                <button className="btn-success" onClick={handleFinalize} disabled={busy}>
                  {busy ? "Processing…" : "✓ Approve & Finalize Transfer"}
                </button>
              </div>
            )}

            {/* Registrar: Freeze */}
            {isRegistrarRole && property.status !== 5 && (
              <div className="action-block danger">
                <h4>{property.frozen ? "Unfreeze" : "Freeze"} Property</h4>
                <p>{property.frozen 
                  ? "Unfreezing will reset the property to Active and refund any escrowed funds."
                  : "Freeze this property for dispute resolution, collateral issues, or legal compliance."
                }</p>
                <button className={property.frozen ? "btn-success" : "btn-danger"} onClick={handleFreeze} disabled={busy}>
                  {property.frozen ? "🔓 Unfreeze" : "🔒 Freeze"}
                </button>
              </div>
            )}

            {/* No wallet */}
            {!address && property.status < 5 && (
              <div className="connect-prompt">Connect your wallet to interact with this property.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
