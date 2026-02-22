/**
 * pages/RegistrarConsole.jsx
 * "Pending Settlements" — finalize + freeze controls
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useWallet } from "../context/WalletContext";
import { fetchAllProperties, fetchMetadata, getWriteContract, gasOverrides } from "../utils/contract";
import StatusBadge from "../components/StatusBadge";
import { ethers } from "ethers";
import { generateReceiptPDF } from "../utils/receipt";
import { evaluateTransaction } from "../utils/gemini";
import { ipfsToHttp } from "../utils/ipfs";

export default function RegistrarConsole() {
  const { address, signer } = useWallet();
  const role = localStorage.getItem("userRole");
  const [settlements, setSettlements] = useState([]);
  const [allProps, setAllProps] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Freeze modal state
  const [freezeModal, setFreezeModal] = useState({ isOpen: false, tokenId: null });
  const [freezeReason, setFreezeReason] = useState("");
  const [freezeCID, setFreezeCID] = useState("");

  // AI Evaluation state
  const [aiEvaluations, setAiEvaluations] = useState({});
  const [evalLoading, setEvalLoading] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchAllProperties();
      const withMeta = await Promise.all(all.map(async p => {
        const meta = await fetchMetadata(p.uri);
        return { ...p, meta };
      }));
      setAllProps(withMeta);
      setSettlements(withMeta.filter(p => p.status === 4));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleFinalize = async (tokenId) => {
    const toastId = toast.loading("Finalizing transfer…");
    try {
      const contract = getWriteContract(signer);
      const tx = await contract.finalizeTransfer(tokenId, gasOverrides());
      await tx.wait();
      toast.success("Transfer finalized! Ownership transferred & funds released 🎉", { id: toastId });
      generateReceiptPDF("Transfer Finalized", tx.hash, tokenId, address);
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
    }
  };

  const handleReject = async (tokenId) => {
    // Rejecting = opening the freeze modal for them to provide a reason
    setFreezeModal({ isOpen: true, tokenId });
  };

  const handleToggleFreeze = async (tokenId, isFrozen) => {
    if (isFrozen) {
      // Unfreeze directly
      const toastId = toast.loading("Unfreezing property…");
      try {
        const contract = getWriteContract(signer);
        const tx = await contract.unfreezeProperty(tokenId, gasOverrides());
        await tx.wait();
        toast.success("Property unfrozen! Reset to Active.", { id: toastId });
        load();
      } catch (err) {
        toast.error(err.reason || err.message || "Failed", { id: toastId });
      }
    } else {
      // Open modal to freeze
      setFreezeModal({ isOpen: true, tokenId });
    }
  };

  const executeFreeze = async () => {
    if (!freezeReason.trim()) {
      toast.error("Reason is required to freeze a property.");
      return;
    }
    const toastId = toast.loading("Freezing property…");
    try {
      const contract = getWriteContract(signer);
      const tx = await contract.freezeProperty(freezeModal.tokenId, freezeReason, freezeCID, gasOverrides());
      await tx.wait();
      toast.success("Property frozen! 🔒", { id: toastId });
      setFreezeModal({ isOpen: false, tokenId: null });
      setFreezeReason("");
      setFreezeCID("");
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
    }
  };

  const handleRunEvaluation = async (property) => {
    setEvalLoading(prev => ({ ...prev, [property.tokenId]: true }));
    try {
      const assessment = await evaluateTransaction(property);
      setAiEvaluations(prev => ({ ...prev, [property.tokenId]: assessment }));
    } catch (err) {
      toast.error(err.message || "Error running AI evaluation");
    } finally {
      setEvalLoading(prev => ({ ...prev, [property.tokenId]: false }));
    }
  };

  if (role !== "registrar") {
    return (
      <div className="page">
        <div className="connect-prompt">Access Denied — Registrar Only</div>
      </div>
    );
  }

  const freezeable = allProps.filter(p => p.status !== 5);

  return (
    <div className="page">
      <div className="page-header">
        <h1>Registrar Console</h1>
        <p>Approve transfers, reject transactions, and manage property controls</p>
      </div>

      {/* Pending Settlements / Buy Approvals */}
      <section style={{ marginBottom: "48px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "var(--text-1)" }}>
          Pending Transfer Approvals
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-3)", marginBottom: "20px" }}>
          Trust recorded, funds deposited, seller confirmed — approve to complete transfer or reject to freeze & refund.
        </p>

        {loading ? (
          <div className="loading-spinner">Loading…</div>
        ) : settlements.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px" }}>
            <p>No pending transfer approvals.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "24px" }}>
            {settlements.map(p => {
              const imageUrl = p.meta?.image ? ipfsToHttp(p.meta.image) : null;
              const isEvaluating = evalLoading[p.tokenId];
              const aiResult = aiEvaluations[p.tokenId];

              return (
                <div key={p.tokenId} className="action-block" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                  {/* Image header */}
                  <div style={{ width: '100%', height: '140px', background: 'var(--bg-card)', position: 'relative' }}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={p.meta?.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🏠</div>
                    )}
                    <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
                      <StatusBadge status={p.status} />
                    </div>
                  </div>

                  <div style={{ padding: '20px', flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>{p.meta?.name || `Property #${p.tokenId}`}</h4>
                    {p.meta?.description && (
                      <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '16px', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.meta.description}
                      </p>
                    )}

                    <div style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 2, background: 'var(--bg-glass)', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: "var(--text-3)" }}>Seller:</span> 
                        <span style={{ fontFamily: "var(--font-mono)" }}>{p.seller?.slice(0,10)}…{p.seller?.slice(-6)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: "var(--text-3)" }}>Buyer:</span> 
                        <span style={{ fontFamily: "var(--font-mono)" }}>{p.potentialBuyer?.slice(0,10)}…{p.potentialBuyer?.slice(-6)}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-soft)', marginTop: '4px', paddingTop: '4px' }}>
                        <span style={{ color: "var(--text-3)" }}>Escrowed Funds:</span> 
                        <span style={{ color: "var(--teal)", fontWeight: 700 }}>{ethers.formatEther(p.escrow)} POL</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: "var(--text-3)" }}>Parties Confirmed:</span> 
                        <span style={{ color: "var(--green)", fontWeight: 600 }}>Yes ✓</span>
                      </div>
                    </div>

                    {/* AI Assessment Block */}
                    <div style={{ marginBottom: '20px', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: aiResult ? '12px' : '0' }}>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-1)' }}>✨ AI Risk Assessment</span>
                        {!aiResult && (
                          <button 
                            className="btn-ghost" 
                            style={{ fontSize: '11px', padding: '4px 8px', height: 'auto', background: 'var(--bg-glass)' }}
                            onClick={() => handleRunEvaluation(p)}
                            disabled={isEvaluating}
                          >
                            {isEvaluating ? "Analyzing..." : "Run Check"}
                          </button>
                        )}
                      </div>
                      {aiResult && (
                        <div style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                          {aiResult}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: "10px" }}>
                      <button className="btn-success" style={{ flex: 1 }} onClick={() => handleFinalize(p.tokenId)}>
                        ✓ Approve Transfer
                      </button>
                      <button className="btn-danger" style={{ flex: 1 }} onClick={() => handleReject(p.tokenId)}>
                        ✗ Reject & Freeze
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Freeze Controls — Treasurer Power */}
      <section>
        <h2 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "var(--text-1)" }}>
          Property Controls — Freeze / Unfreeze
        </h2>
        <p style={{ fontSize: "13px", color: "var(--text-3)", marginBottom: "20px" }}>
          Freeze properties for disputes, collateral issues, or legal compliance. Unfreezing resets to Active and refunds any escrowed funds.
        </p>

        {freezeable.length === 0 ? (
          <div className="empty-state" style={{ padding: "40px" }}>
            <p>No properties to manage.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
            {freezeable.map(p => (
              <div key={p.tokenId} className={`action-block ${p.frozen ? "danger" : ""}`} style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>
                    {p.meta?.name || `#${p.tokenId}`}
                  </span>
                  <StatusBadge status={p.status} />
                </div>
                {p.escrow > 0 && (
                  <div style={{ fontSize: "11px", color: "var(--teal)", marginBottom: "10px" }}>
                    Escrow: {ethers.formatEther(p.escrow)} POL
                  </div>
                )}
                <button
                  className={p.frozen ? "btn-success" : "btn-danger"}
                  style={{ fontSize: "12px" }}
                  onClick={() => handleToggleFreeze(p.tokenId, p.frozen)}
                >
                  {p.frozen ? "🔓 Unfreeze" : "🔒 Freeze"}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Freeze Modal */}
      {freezeModal.isOpen && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="modal-content" style={{ background: 'var(--bg-main)', padding: '30px', border: '1px solid var(--border-soft)', borderRadius: '16px', maxWidth: '400px', width: '100%', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Freeze Property #{freezeModal.tokenId}</h3>
            
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Reason for Freeze *</label>
            <input 
              type="text" 
              value={freezeReason} 
              onChange={e => setFreezeReason(e.target.value)} 
              placeholder="e.g. Disputed ownership, court order..."
              style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px', border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)', color: 'var(--text-1)' }}
            />

            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 600 }}>Court Order IPFS CID (Optional)</label>
            <input 
              type="text" 
              value={freezeCID} 
              onChange={e => setFreezeCID(e.target.value)} 
              placeholder="Qm..."
              style={{ width: '100%', padding: '10px', marginBottom: '24px', borderRadius: '8px', border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)', color: 'var(--text-1)' }}
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button className="btn-success" style={{ flex: 1 }} onClick={executeFreeze}>Confirm Freeze</button>
              <button className="btn-danger" style={{ flex: 1 }} onClick={() => setFreezeModal({ isOpen: false, tokenId: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
