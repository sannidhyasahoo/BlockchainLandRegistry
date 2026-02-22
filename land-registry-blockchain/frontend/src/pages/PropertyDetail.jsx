/**
 * pages/PropertyDetail.jsx
 * Full property view with timeline and role-based actions.
 */
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchProperty, fetchMetadata, getWriteContract, gasOverrides, fetchPropertyHistory } from "../utils/contract";
import { ipfsToHttp } from "../utils/ipfs";
import StatusBadge from "../components/StatusBadge";
import { useWallet } from "../context/WalletContext";
import { BLOCK_EXPLORER, CONTRACT_ADDRESS } from "../constants";
import { ethers } from "ethers";
import { generateReceiptPDF } from "../utils/receipt";

export default function PropertyDetail() {
  const { id } = useParams();
  const { address, signer } = useWallet();
  const role = localStorage.getItem("userRole");
  const isRegistrarRole = role === "registrar";
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [meta, setMeta]         = useState(null);
  const [history, setHistory]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [activeTab, setActiveTab]= useState("actions"); // "actions" or "history"

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const p = await fetchProperty(Number(id));
      setProperty(p);
      if (p.uri) { const m = await fetchMetadata(p.uri); setMeta(m); }
      const h = await fetchPropertyHistory(Number(id), p.status);
      setHistory(h);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Actions
  const doTx = async (label, fn, onSuccess) => {
    setBusy(true);
    const toastId = toast.loading(label + "…");
    try {
      const contract = getWriteContract(signer);
      const tx = await fn(contract);
      toast.loading("Mining…", { id: toastId });
      await tx.wait();
      toast.success("Done! 🎉", { id: toastId });
      if (onSuccess) onSuccess(tx.hash);
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
    } finally {
      setBusy(false);
    }
  };

  const handleDeposit = () => {
    if (!property) return;
    doTx(
      "Depositing escrow", 
      (c) => c.depositFunds(property.tokenId, gasOverrides({ value: property.price })),
      (txHash) => generateReceiptPDF("Funds Deposited", txHash, property.tokenId, address)
    );
  };
  const handleFinalize = () => doTx("Finalizing", (c) => c.finalizeTransfer(Number(id), gasOverrides()));
  const handleFreeze = () => doTx("Toggling freeze", (c) => c.toggleFreeze(Number(id), gasOverrides()));

  // Hackathon Multi-Sig
  const handleApproveTrust = () => doTx("Voting to Approve Trust", (c) => c.recordTrust(Number(id), property.potentialBuyer, gasOverrides()));

  // Hackathon Actions
  const [rentInput, setRentInput] = useState("1");
  const [tenantInput, setTenantInput] = useState("0x0000000000000000000000000000000000001234");
  const handleInitiateLease = () => doTx("Initiating Lease", (c) => c.initiateLease(Number(id), tenantInput, 30, gasOverrides({ value: ethers.parseEther(rentInput) })));
  const handleApproveLease = () => doTx("Approving Lease", (c) => c.approveLease(Number(id), gasOverrides()));
  const handleCreatePartnership = () => doTx("Creating Partnership", (c) => c.createPartnership(Number(id), "0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7", gasOverrides()));

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

          {/* Tabs */}
          <div className="detail-tabs" style={{ display: 'flex', gap: '16px', marginBottom: '16px', borderBottom: '1px solid var(--border-soft)' }}>
            <button 
              onClick={() => setActiveTab("actions")}
              style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === "actions" ? '2px solid var(--teal)' : '2px solid transparent', color: activeTab === "actions" ? 'inherit' : 'var(--text-3)', cursor: 'pointer', fontWeight: 600 }}>
              Actions
            </button>
            <button 
              onClick={() => setActiveTab("lease")}
              style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === "lease" ? '2px solid var(--teal)' : '2px solid transparent', color: activeTab === "lease" ? 'inherit' : 'var(--text-3)', cursor: 'pointer', fontWeight: 600 }}>
              Lease & Partnership
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              style={{ padding: '8px 16px', background: 'none', border: 'none', borderBottom: activeTab === "history" ? '2px solid var(--teal)' : '2px solid transparent', color: activeTab === "history" ? 'inherit' : 'var(--text-3)', cursor: 'pointer', fontWeight: 600 }}>
              Audit History
            </button>
          </div>

          {activeTab === "lease" ? (
            <div className="action-panel">
              {/* PARTNERSHIP SECTION */}
              <div className="action-block" style={{ marginBottom: "24px" }}>
                <h4>🤝 Ownership Distribution</h4>
                {!property.partnership ? (
                  <>
                    <p>This property is solely owned by {short(property.seller)}. Distributed ownership (partnerships) allows multiple parties to split rent and sale yields automatically.</p>
                    {isSeller && property.status < 5 && (
                      <button className="btn-secondary" onClick={handleCreatePartnership} disabled={busy}>
                        {busy ? "Processing…" : "Create Demo 50/50 Partnership"}
                      </button>
                    )}
                  </>
                ) : (
                  <div style={{ display: "flex", gap: "24px", alignItems: "center", marginTop: "12px" }}>
                    <svg width="100" height="100" viewBox="0 0 32 32" style={{ borderRadius: "50%", background: "var(--teal)" }}>
                      <circle r="16" cx="16" cy="16" fill="var(--accent-2)" strokeDasharray="50 100" />
                    </svg>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', marginBottom: '8px' }}>
                        <span style={{ color: 'var(--teal)', fontWeight: 'bold' }}>Partner 1 (You)</span>
                        <span>50%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', width: '200px', marginBottom: '16px' }}>
                        <span style={{ color: 'var(--accent-2)', fontWeight: 'bold' }}>Partner 2</span>
                        <span>50%</span>
                      </div>
                      <div style={{ padding: '8px', background: 'rgba(0, 255, 136, 0.1)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-1)' }}>
                        <strong>✨ Smart Yields:</strong> All rent and sale deposits will be automatically split 50/50 between the partners on finalization.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* LEASE SECTION */}
              <div className="action-block">
                <h4>📜 Active Lease</h4>
                {property.lease ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-glass)', borderRadius: '8px', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-3)' }}>Tenant</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{short(property.lease.tenant)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-glass)', borderRadius: '8px', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-3)' }}>Rent Paid</span>
                      <span style={{ color: 'var(--teal)' }}>{ethers.formatEther(property.lease.rent)} POL</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-glass)', borderRadius: '8px', marginBottom: '12px' }}>
                      <span style={{ color: 'var(--text-3)' }}>Expires In</span>
                      <span>{Math.max(0, Math.floor((property.lease.expiry - Date.now() / 1000) / 86400))} Days</span>
                    </div>

                    {!property.lease.isApproved ? (
                      <div style={{ marginTop: '16px', padding: '12px', border: '1px solid var(--yellow)', borderRadius: '8px', background: 'rgba(255, 190, 0, 0.1)' }}>
                        <strong style={{ color: 'var(--yellow)', display: 'block', marginBottom: '4px' }}>⏳ Awaiting Registrar Approval</strong>
                        The tenant has paid the rent upfront into escrow. The Registrar must approve the lease to grant the tenant temporary access and release the funds to the owner.
                        {isRegistrarRole && (
                          <button className="btn-success" style={{ marginTop: '12px', width: '100%' }} onClick={handleApproveLease} disabled={busy}>
                            {busy ? "Processing…" : "✓ Approve Lease & Release Rent"}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div style={{ marginTop: '16px', padding: '12px', border: '1px solid var(--teal)', borderRadius: '8px', background: 'rgba(0, 255, 136, 0.1)' }}>
                        <strong style={{ color: 'var(--teal)' }}>✅ Lease Approved</strong>
                        <p style={{ fontSize: '12px', marginTop: '4px' }}>The tenant has been granted `TENANT_ROLE` access on-chain until the duration expires.</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <p>No active lease on this property. Ensure you have agreed on the terms with the tenant physically.</p>
                    {isSeller && property.status === 1 && (
                      <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px' }}>Demo Tenant Address</label>
                        <input type="text" value={tenantInput} onChange={e => setTenantInput(e.target.value)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', padding: '10px', borderRadius: '6px', color: 'var(--text-1)' }} />
                        
                        <label style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '8px' }}>Upfront Rent (POL)</label>
                        <input type="number" step="0.1" value={rentInput} onChange={e => setRentInput(e.target.value)} style={{ background: 'var(--bg-glass)', border: '1px solid var(--border-soft)', padding: '10px', borderRadius: '6px', color: 'var(--text-1)' }} />
                        
                        <button className="btn-primary" style={{ marginTop: '12px' }} onClick={handleInitiateLease} disabled={busy}>
                          {busy ? "Processing…" : `Initiate Lease (Tenant pays ${rentInput} POL)`}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : activeTab === "actions" ? (
            <div className="action-panel">
              {/* Sold */}
              {property.status === 5 && <div className="sold-notice">Property has been sold. Ownership transferred.</div>}

              {/* Frozen */}
              {property.frozen && (
                <div className="action-block danger">
                  <h4>❄️ Property Frozen</h4>
                  <p>This property is currently frozen by the Registrar due to dispute or collateral issues.</p>
                  {property.dispute && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(255, 75, 75, 0.1)', borderRadius: '8px', border: '1px solid rgba(255, 75, 75, 0.2)' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--red)', marginBottom: '4px' }}>Reason for Freeze</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-1)' }}>{property.dispute.reason}</div>
                      {property.dispute.courtOrderIPFS && (
                        <div style={{ marginTop: '8px' }}>
                          <a href={ipfsToHttp(property.dispute.courtOrderIPFS)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-2)', textDecoration: 'underline' }}>
                            View Court Order ↗
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Buyer: Deposit (only designated buyer after trust is recorded) */}
              {isBuyer && property.status === 2 && !isRegistrarRole && (
                <div className="action-block">
                  <h4>💰 Deposit Escrow</h4>
                  <p>
                    Trust has been recorded. Deposit <strong style={{ color: "var(--teal)" }}>{priceEth} POL</strong> to 
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
          ) : (
            <div className="history-timeline" style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid var(--border-soft)', marginLeft: '10px' }}>
              {history.length === 0 ? (
                <p style={{ color: 'var(--text-3)' }}>No history recorded yet.</p>
              ) : (
                history.map((log, i) => (
                  <div key={i} style={{ marginBottom: '24px', position: 'relative' }}>
                    <div style={{ position: 'absolute', left: '-27px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--teal)', border: '2px solid var(--bg-main)' }}></div>
                    <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>
                      Block #{log.blockNumber} {log.timestamp && ` • ${new Date(log.timestamp * 1000).toLocaleString()}`}
                    </div>
                    <div style={{ fontWeight: 600, marginTop: '4px', color: 'var(--text-1)' }}>
                      {log.type.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <a href={`${BLOCK_EXPLORER}/tx/${log.txHash}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: 'var(--accent-2)', textDecoration: 'underline' }}>
                      View Transaction ↗
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
