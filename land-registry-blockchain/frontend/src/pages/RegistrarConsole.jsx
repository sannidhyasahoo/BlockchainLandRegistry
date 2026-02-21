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

export default function RegistrarConsole() {
  const { signer } = useWallet();
  const role = localStorage.getItem("userRole");
  const [settlements, setSettlements] = useState([]);
  const [allProps, setAllProps] = useState([]);
  const [loading, setLoading] = useState(true);

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
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
    }
  };

  const handleReject = async (tokenId) => {
    // Rejecting = freezing the property, which refunds escrow
    const toastId = toast.loading("Rejecting and freezing…");
    try {
      const contract = getWriteContract(signer);
      const tx = await contract.toggleFreeze(tokenId, gasOverrides());
      await tx.wait();
      toast.success("Transaction rejected. Property frozen & funds refunded.", { id: toastId });
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
    }
  };

  const handleToggleFreeze = async (tokenId, isFrozen) => {
    const toastId = toast.loading(isFrozen ? "Unfreezing…" : "Freezing…");
    try {
      const contract = getWriteContract(signer);
      const tx = await contract.toggleFreeze(tokenId, gasOverrides());
      await tx.wait();
      toast.success(isFrozen ? "Property unfrozen! Reset to Active." : "Property frozen! 🔒", { id: toastId });
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px" }}>
            {settlements.map(p => (
              <div key={p.tokenId} className="action-block">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h4 style={{ margin: 0 }}>{p.meta?.name || `Property #${p.tokenId}`}</h4>
                  <StatusBadge status={p.status} />
                </div>

                <div style={{ fontSize: "12px", color: "var(--text-2)", lineHeight: 2 }}>
                  <div><span style={{ color: "var(--text-3)" }}>Seller:</span> <span style={{ fontFamily: "var(--font-mono)" }}>{p.seller?.slice(0,10)}…{p.seller?.slice(-6)}</span></div>
                  <div><span style={{ color: "var(--text-3)" }}>Buyer:</span> <span style={{ fontFamily: "var(--font-mono)" }}>{p.potentialBuyer?.slice(0,10)}…{p.potentialBuyer?.slice(-6)}</span></div>
                  <div><span style={{ color: "var(--text-3)" }}>Escrowed:</span> <span style={{ color: "var(--teal)", fontWeight: 600 }}>{ethers.formatEther(p.escrow)} POL</span></div>
                  <div style={{ marginTop: "4px", fontSize: "11px" }}>
                    <span style={{ color: "var(--text-3)" }}>Trust:</span> <span style={{ color: p.trustRecorded ? "var(--green)" : "var(--red)" }}>{p.trustRecorded ? "✓ Verified" : "✗ Not verified"}</span>
                    <span style={{ margin: "0 8px", color: "var(--text-3)" }}>|</span>
                    <span style={{ color: "var(--text-3)" }}>Seller Confirmed:</span> <span style={{ color: p.sellerConfirmed ? "var(--green)" : "var(--red)" }}>{p.sellerConfirmed ? "✓ Yes" : "✗ No"}</span>
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                  <button className="btn-success" style={{ flex: 1 }} onClick={() => handleFinalize(p.tokenId)}>
                    ✓ Approve Transfer
                  </button>
                  <button className="btn-danger" style={{ flex: 1 }} onClick={() => handleReject(p.tokenId)}>
                    ✗ Reject & Refund
                  </button>
                </div>
              </div>
            ))}
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
    </div>
  );
}
