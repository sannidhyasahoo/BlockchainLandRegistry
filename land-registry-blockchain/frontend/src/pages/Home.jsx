/**
 * pages/Home.jsx
 * Lists all minted properties with live blockchain data
 */
import { useState, useEffect, useCallback } from "react";
import PropertyCard from "../components/PropertyCard";
import { fetchAllProperties } from "../utils/contract";
import { useWallet } from "../context/WalletContext";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");
  const { address }                 = useWallet();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchAllProperties();
      setProperties(all.reverse()); // newest first
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = properties.filter((p) => {
    if (filter === "all")    return true;
    if (filter === "active") return p.status === 0;
    if (filter === "mine")   return p.seller?.toLowerCase() === address?.toLowerCase();
    if (filter === "bought") return p.buyer?.toLowerCase() === address?.toLowerCase();
    return true;
  });

  return (
    <div className="page">
      <div className="page-header">
        <h1>Land Registry</h1>
        <p>Secure property ownership on Polygon blockchain</p>
      </div>

      <div className="filter-bar">
        {[["all","All Properties"], ["active","Available"], ["mine","My Listings"], ["bought","My Purchases"]].map(([val, label]) => (
          <button
            key={val}
            className={`filter-btn ${filter === val ? "active" : ""}`}
            onClick={() => setFilter(val)}
          >
            {label}
          </button>
        ))}
        <button className="btn-ghost refresh-btn" onClick={load}>↻ Refresh</button>
      </div>

      {loading ? (
        <div className="loading-grid">
          {[1,2,3,4,5,6].map(i => <div key={i} className="card-skeleton" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <span>🏘️</span>
          <p>{filter === "all" ? "No properties minted yet." : "No properties in this category."}</p>
        </div>
      ) : (
        <div className="property-grid">
          {filtered.map((p) => <PropertyCard key={p.tokenId} property={p} />)}
        </div>
      )}
    </div>
  );
}
