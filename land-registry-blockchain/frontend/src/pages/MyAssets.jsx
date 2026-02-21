/**
 * pages/MyAssets.jsx
 * Seller view: owned NFTs + Trust recording + Confirm funds
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useWallet } from "../context/WalletContext";
import { fetchAllProperties, fetchMetadata, getWriteContract, gasOverrides } from "../utils/contract";
import StatusBadge from "../components/StatusBadge";
import { ethers } from "ethers";

export default function MyAssets() {
  const { address, signer } = useWallet();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buyerInputs, setBuyerInputs] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchAllProperties();
      const mine = all.filter(p => p.seller?.toLowerCase() === address?.toLowerCase());
      const withMeta = await Promise.all(mine.map(async p => {
        const meta = await fetchMetadata(p.uri);
        return { ...p, meta };
      }));
      setAssets(withMeta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { if (address) load(); }, [address, load]);

  const handleRecordTrust = async (tokenId) => {
    const buyerAddr = buyerInputs[tokenId];
    if (!buyerAddr || !ethers.isAddress(buyerAddr)) {
      return toast.error("Enter a valid buyer wallet address.");
    }
    const toastId = toast.loading("Recording trust — verifying buyer connection…");
    try {
      const contract = getWriteContract(signer);
      const tx = await contract.recordTrust(tokenId, buyerAddr, gasOverrides());
      await tx.wait();
      toast.success("Trust recorded! Buyer can now deposit funds 🤝", { id: toastId });
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
    }
  };

  const handleConfirmFunds = async (tokenId) => {
    const toastId = toast.loading("Confirming escrow funds…");
    try {
      const contract = getWriteContract(signer);
      const tx = await contract.confirmFunds(tokenId, gasOverrides());
      await tx.wait();
      toast.success("Funds confirmed! Awaiting Registrar approval ✅", { id: toastId });
      load();
    } catch (err) {
      toast.error(err.reason || err.message || "Failed", { id: toastId });
    }
  };

  if (!address) {
    return (
      <div className="page">
        <div className="connect-prompt">Connect your wallet to view your properties.</div>
      </div>
    );
  }

  const statusInfo = {
    0: { color: "var(--text-3)", text: () => "Mint request pending registrar approval." },
    2: { color: "var(--teal)", text: (p) => `Waiting for buyer (${p.potentialBuyer?.slice(0,6)}…) to deposit funds.` },
    3: { color: "var(--yellow)", text: () => "Buyer has deposited funds. Review and confirm." },
    4: { color: "var(--accent-2)", text: () => "Awaiting Registrar approval for final transfer." },
    5: { color: "var(--green)", text: () => "This property has been sold. Ownership transferred." },
    6: { color: "var(--red)", text: () => "This property is frozen by the Registrar for dispute/collateral." },
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Properties</h1>
        <p>Manage your property listings, record trust with buyers, and confirm transactions</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading your properties…</div>
      ) : assets.length === 0 ? (
        <div className="empty-state">
          <span>📦</span>
          <p>You don't own any properties yet. Mint one from the dashboard.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "800px" }}>
          {assets.map(p => (
            <div key={p.tokenId} className={`action-block ${p.frozen ? "danger" : ""}`}>
              {/* Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h4 style={{ margin: 0 }}>{p.meta?.name || `Property #${p.tokenId}`}</h4>
                  <span style={{ fontSize: "12px", color: "var(--text-3)" }}>
                    {p.priceEth} POL
                  </span>
                </div>
                <StatusBadge status={p.status} />
              </div>

              {/* Progress Timeline */}
              <div style={{
                display: "flex", gap: "8px", alignItems: "center",
                padding: "12px 16px", background: "var(--bg-glass)",
                borderRadius: "10px", marginBottom: "16px",
                fontSize: "11px", fontWeight: 600, color: "var(--text-3)",
                flexWrap: "wrap"
              }}>
                {[
                  [1, "Minted"], [2, "Trusted"], [3, "Escrowed"], [4, "Confirmed"], [5, "Sold"]
                ].map(([s, label], i) => (
                  <span key={s} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    {i > 0 && <span style={{ color: "var(--text-3)", margin: "0 2px" }}>→</span>}
                    <span style={{ color: p.status >= s ? "var(--teal)" : "inherit" }}>{label}</span>
                  </span>
                ))}
              </div>

              {/* Action: Record Trust (Seller meets buyer physically & records connection) */}
              {p.status === 1 && (
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "12px", lineHeight: 1.6 }}>
                    <strong>Step:</strong> After physically meeting the buyer, enter their wallet address below to establish a trusted connection for this property.
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "6px", fontWeight: 600 }}>
                        Buyer Wallet Address
                      </label>
                      <input
                        placeholder="0xBuyer…"
                        value={buyerInputs[p.tokenId] || ""}
                        onChange={e => setBuyerInputs(prev => ({ ...prev, [p.tokenId]: e.target.value }))}
                        style={{ marginBottom: 0 }}
                      />
                    </div>
                    <button className="btn-primary" style={{ whiteSpace: "nowrap", height: "40px" }}
                      onClick={() => handleRecordTrust(p.tokenId)}>
                      Record Trust 🤝
                    </button>
                  </div>
                </div>
              )}

              {/* Action: Confirm Funds */}
              {p.status === 3 && (
                <div>
                  <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "12px" }}>
                    Buyer has deposited <strong style={{ color: "var(--teal)" }}>{ethers.formatEther(p.escrow)} POL</strong> into escrow. 
                    Review the amount and confirm to proceed to Registrar approval.
                  </p>
                  <button className="btn-success" onClick={() => handleConfirmFunds(p.tokenId)}>
                    ✓ Confirm Funds & Approve Amount
                  </button>
                </div>
              )}

              {/* Status messages */}
              {statusInfo[p.status] && (
                <div style={{ fontSize: "12px", color: statusInfo[p.status].color, fontWeight: 500, marginTop: p.status === 1 || p.status === 3 ? "16px" : "0" }}>
                  ℹ️ {statusInfo[p.status].text(p)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
