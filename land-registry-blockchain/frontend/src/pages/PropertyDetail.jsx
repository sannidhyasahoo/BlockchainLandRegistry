/**
 * pages/PropertyDetail.jsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Shows full property info + actions based on wallet role:
 *   Buyer:     startPurchase() — deposit exact price
 *   Registrar: approveTransfer() / disputeProperty() / resolveDispute()
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchProperty, fetchMetadata, getWriteContract } from "../utils/contract";
import { ipfsToHttp } from "../utils/ipfs";
import StatusBadge from "../components/StatusBadge";
import { useWallet } from "../context/WalletContext";
import { BLOCK_EXPLORER, CONTRACT_ADDRESS } from "../constants";
import { ethers } from "ethers";

export default function PropertyDetail() {
  const { id } = useParams();
  const { address, signer, isRegistrar } = useWallet();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [meta, setMeta]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [dispute, setDispute]   = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchProperty(id);
      setProperty(p);
      const m = await fetchMetadata(p.uri);
      setMeta(m);
    } catch {
      toast.error("Property not found");
      navigate("/dashboard");
    } finally { setLoading(false); }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  const withTx = async (label, fn) => {
    setBusy(true);
    const toastId = toast.loading(`${label}… confirm in MetaMask`);
    try {
      const tx = await fn();
      toast.loading("Mining…", { id: toastId });
      await tx.wait();
      toast.success(`${label} successful! 🎉`, { id: toastId });
      await load();
    } catch (err) {
      toast.error(err.reason || err.message || "Transaction failed", { id: toastId });
    } finally { setBusy(false); }
  };

  // ── Actions ───────────────────────────────────────────────────
  const handleBuy = () => withTx("Purchase deposit", async () => {
    const contract = getWriteContract(signer);
    return contract.startPurchase(id, { value: property.price });
  });

  const handleApprove = () => withTx("Transfer approval", async () => {
    const contract = getWriteContract(signer);
    return contract.approveTransfer(id);
  });

  const handleDispute = () => {
    if (!dispute.trim()) return toast.error("Enter a dispute reason.");
    withTx("Dispute filing", async () => {
      const contract = getWriteContract(signer);
      return contract.disputeProperty(id, dispute);
    });
  };

  const handleResolve = () => withTx("Dispute resolution", async () => {
    const contract = getWriteContract(signer);
    return contract.resolveDispute(id);
  });

  if (loading) return <div className="page"><div className="loading-spinner">Loading…</div></div>;
  if (!property) return null;

  const imageUrl = meta?.image ? ipfsToHttp(meta.image) : null;
  const deedCID = meta?.attributes?.find(a => a.trait_type === "Deed_CID")?.value;
  const short = (addr) => addr && addr !== ethers.ZeroAddress ? `${addr.slice(0,6)}…${addr.slice(-4)}` : "—";

  const canBuy     = address && !isRegistrar && property.status === 0 && property.seller?.toLowerCase() !== address?.toLowerCase();
  const canApprove = isRegistrar && property.status === 1;
  const canDispute = isRegistrar && (property.status === 0 || property.status === 1);
  const canResolve = isRegistrar && property.status === 3;

  return (
    <div className="page detail-page">
      <button className="back-btn" onClick={() => navigate("/dashboard")}>← Back</button>

      <div className="detail-layout">
        {/* ── Left: Image + Info ─── */}
        <div className="detail-left">
          <div className="detail-image">
            {imageUrl ? (
              <img src={imageUrl} alt={meta?.name} />
            ) : (
              <div className="detail-image-placeholder">🏠</div>
            )}
          </div>

          <div className="detail-meta-list">
            {meta?.attributes?.filter(a => a.trait_type !== "Deed_CID").map((a) => (
              <div className="meta-row" key={a.trait_type}>
                <span className="meta-key">{a.trait_type}</span>
                <span className="meta-val">{a.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Details + Actions ─── */}
        <div className="detail-right">
          <div className="detail-header">
            <h1>{meta?.name ?? `Property #${id}`}</h1>
            <StatusBadge status={property.status} />
          </div>

          <p className="detail-desc">{meta?.description}</p>

          <div className="detail-info-grid">
            <div className="info-card">
              <span className="info-label">Token ID</span>
              <span className="info-value">#{property.tokenId}</span>
            </div>
            <div className="info-card">
              <span className="info-label">Price</span>
              <span className="info-value highlight">{property.priceEth} POL</span>
            </div>
            <div className="info-card">
              <span className="info-label">Seller</span>
              <a href={`${BLOCK_EXPLORER}/address/${property.seller}`} target="_blank" rel="noopener noreferrer" className="info-value link">
                {short(property.seller)}
              </a>
            </div>
            {property.buyer && property.buyer !== ethers.ZeroAddress && (
              <div className="info-card">
                <span className="info-label">Buyer</span>
                <a href={`${BLOCK_EXPLORER}/address/${property.buyer}`} target="_blank" rel="noopener noreferrer" className="info-value link">
                  {short(property.buyer)}
                </a>
              </div>
            )}
            {property.status === 1 && (
              <div className="info-card full">
                <span className="info-label">Escrowed</span>
                <span className="info-value">{ethers.formatEther(property.escrow)} POL locked in contract</span>
              </div>
            )}
          </div>

          {deedCID && (
            <a href={ipfsToHttp(deedCID)} target="_blank" rel="noopener noreferrer" className="deed-link">
              📄 View Deed Document on IPFS ↗
            </a>
          )}

          {/* ── Action Panel ─── */}
          {address ? (
            <div className="action-panel">
              {/* BUYER: Start Purchase */}
              {canBuy && (
                <div className="action-block">
                  <h4>Buy this Property</h4>
                  <p>Deposit <strong>{property.priceEth} POL</strong> into escrow. The Registrar will verify and finalise the transfer.</p>
                  <button className="btn-primary btn-large" onClick={handleBuy} disabled={busy}>
                    {busy ? "Processing…" : `Deposit ${property.priceEth} POL`}
                  </button>
                </div>
              )}

              {/* REGISTRAR: Approve Transfer */}
              {canApprove && (
                <div className="action-block">
                  <h4>Approve Legal Transfer</h4>
                  <p>This will release the escrow (<strong>{ethers.formatEther(property.escrow)} POL</strong>) to the seller and transfer the NFT deed to the buyer.</p>
                  <button className="btn-success btn-large" onClick={handleApprove} disabled={busy}>
                    {busy ? "Processing…" : "✓ Approve Transfer"}
                  </button>
                </div>
              )}

              {/* REGISTRAR: Dispute */}
              {canDispute && (
                <div className="action-block danger">
                  <h4>File a Dispute</h4>
                  <input value={dispute} onChange={(e) => setDispute(e.target.value)}
                    placeholder="Reason for legal dispute…" disabled={busy} />
                  <button className="btn-danger" onClick={handleDispute} disabled={busy}>
                    {busy ? "Processing…" : "⚠ File Dispute"}
                  </button>
                </div>
              )}

              {/* REGISTRAR: Resolve Dispute */}
              {canResolve && (
                <div className="action-block">
                  <h4>Resolve Dispute</h4>
                  <p>Buyer funds will be refunded. Property returns to Active status.</p>
                  <button className="btn-success" onClick={handleResolve} disabled={busy}>
                    {busy ? "Processing…" : "✓ Resolve Dispute"}
                  </button>
                </div>
              )}

              {property.status === 2 && (
                <div className="sold-notice">✓ This property has been sold and transferred.</div>
              )}
            </div>
          ) : (
            <div className="connect-prompt">Connect your wallet to interact with this property.</div>
          )}

          <a href={`${BLOCK_EXPLORER}/token/${CONTRACT_ADDRESS}?a=${id}`} target="_blank" rel="noopener noreferrer" className="explorer-link">
            View NFT on PolygonScan ↗
          </a>
        </div>
      </div>
    </div>
  );
}
