/**
 * pages/PendingMints.jsx — "Incoming Deeds" for Registrar
 */
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useWallet } from "../context/WalletContext";
import { fetchPendingMints, getWriteContract, fetchMetadata, ipfsToHttp, gasOverrides } from "../utils/contract";

export default function PendingMints() {
  const { signer } = useWallet();
  const role = localStorage.getItem("userRole");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchPendingMints();
      const withMeta = await Promise.all(all.map(async (r) => {
        const meta = await fetchMetadata(r.uri);
        return { ...r, meta };
      }));
      setRequests(withMeta);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleApprove = async (requestId) => {
    const toastId = toast.loading("Approving & minting…");
    try {
      const contract = getWriteContract(signer);
      const tx = await contract.approveAndMint(requestId, gasOverrides());
      toast.loading("Mining…", { id: toastId });
      await tx.wait();
      toast.success("Approved & Minted! 🎉", { id: toastId });
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

  return (
    <div className="page">
      <div className="page-header">
        <h1>Incoming Deeds</h1>
        <p>Review citizen mint requests and verify documents before approving</p>
      </div>

      {loading ? (
        <div className="loading-spinner">Loading requests…</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <span>📨</span>
          <p>No pending mint requests.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
          {requests.map(r => (
            <div key={r.requestId} className="action-block">
              <h4 style={{ marginBottom: "12px" }}>
                {r.meta?.name || `Request #${r.requestId}`}
              </h4>

              <div style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "6px" }}>
                <span style={{ color: "var(--text-3)" }}>Seller: </span>
                <span style={{ fontFamily: "var(--font-mono)" }}>{r.seller?.slice(0, 10)}…</span>
              </div>

              <div style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "16px" }}>
                <span style={{ color: "var(--text-3)" }}>Price: </span>
                <span style={{ color: "var(--teal)", fontWeight: 600 }}>{r.priceEth} POL</span>
              </div>

              {r.meta?.attributes?.find(a => a.trait_type === "Deed_CID")?.value && (
                <a href={ipfsToHttp(r.meta?.attributes?.find(a => a.trait_type === "Deed_CID")?.value)}
                  target="_blank" rel="noreferrer"
                  style={{ display: "block", fontSize: "12px", color: "var(--teal)", marginBottom: "16px",
                    textDecoration: "underline" }}>
                  View Deed ↗
                </a>
              )}

              <button className="btn-success" onClick={() => handleApprove(r.requestId)}>
                Approve & Mint
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
