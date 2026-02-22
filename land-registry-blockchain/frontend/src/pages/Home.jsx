/**
 * pages/Home.jsx
 * Listings page — browse all available properties
 */
import { useState, useEffect, useCallback } from "react";
import PropertyCard from "../components/PropertyCard";
import { fetchAllProperties } from "../utils/contract";
import { useWallet } from "../context/WalletContext";

export default function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("all");
  const [saleType, setSaleType]     = useState("all"); // "all", "sale", "lease"
  const [sortParam, setSortParam]   = useState("newest"); // "newest", "price_asc", "price_desc"
  const { address }                 = useWallet();
  const role = localStorage.getItem("userRole");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await fetchAllProperties();
      setProperties(all.reverse());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  let filtered = properties.filter((p) => {
    if (filter === "all")       return true;
    if (filter === "available") return p.status === 1;
    if (filter === "trusted")   return p.status === 2;
    if (filter === "mine")      return p.seller?.toLowerCase() === address?.toLowerCase();
    if (filter === "buying")    return p.potentialBuyer?.toLowerCase() === address?.toLowerCase();
    return true;
  });

  if (sortParam === "price_asc") {
    filtered.sort((a, b) => Number(a.price) - Number(b.price));
  } else if (sortParam === "price_desc") {
    filtered.sort((a, b) => Number(b.price) - Number(a.price));
  } else {
    // newest (already reversed from load)
    filtered.sort((a, b) => b.tokenId - a.tokenId);
  }

  // Registrar overview shows all properties with stats
  const isRegistrar = role === "registrar";

  const stats = isRegistrar ? {
    total: properties.length,
    pending: properties.filter(p => p.status === 0).length,
    active: properties.filter(p => p.status === 1).length,
    inProgress: properties.filter(p => [2,3,4].includes(p.status)).length,
    sold: properties.filter(p => p.status === 5).length,
    frozen: properties.filter(p => p.status === 6).length,
  } : null;

  return (
    <div className="page">
      <div className="page-header">
        <h1>{isRegistrar ? "Registry Overview" : "Property Listings"}</h1>
        <p>{isRegistrar
          ? "Overview of all registered properties on the blockchain"
          : "Browse available properties and find your next investment"
        }</p>
      </div>

      {/* Registrar Stats */}
      {isRegistrar && stats && (
        <div className="stats-grid">
          {[
            { label: "Total Properties", value: stats.total, color: "var(--text-1)" },
            { label: "Active", value: stats.active, color: "var(--green)" },
            { label: "In Progress", value: stats.inProgress, color: "var(--yellow)" },
            { label: "Sold", value: stats.sold, color: "var(--accent-2)" },
            { label: "Frozen", value: stats.frozen, color: "var(--red)" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <span className="stat-label">{s.label}</span>
              <span className="stat-value" style={{ color: s.color }}>{s.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="filter-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {isRegistrar ? (
            [["all","All"], ["available","Active"], ["trusted","In Transfer"]].map(([val, label]) => (
              <button key={val} className={`filter-btn ${filter === val ? "active" : ""}`}
                onClick={() => setFilter(val)}>
                {label}
              </button>
            ))
          ) : (
            [["all","All"], ["available","Available"], ["mine","My Listings"], ["buying","My Purchases"]].map(([val, label]) => (
              <button key={val} className={`filter-btn ${filter === val ? "active" : ""}`}
                onClick={() => setFilter(val)}>
                {label}
              </button>
            ))
          )}
          
          {!isRegistrar && (
            <div style={{ marginLeft: '12px', borderLeft: '1px solid var(--border-soft)', paddingLeft: '12px' }}>
              <select 
                value={saleType} 
                onChange={(e) => setSaleType(e.target.value)}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)', color: 'var(--text-1)', fontSize: '13px', fontWeight: 600 }}
              >
                <option value="all">All Types</option>
                <option value="sale">Full Purchase</option>
                <option value="lease">Available for Lease</option>
              </select>
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select 
            value={sortParam} 
            onChange={(e) => setSortParam(e.target.value)}
            style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border-soft)', background: 'var(--bg-elevated)', color: 'var(--text-1)', fontSize: '13px' }}
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
          <button className="btn-ghost refresh-btn" onClick={load}>↻ Refresh</button>
        </div>
      </div>

      {/* Content */}
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
          {filtered.map((p) => <PropertyCard key={p.tokenId} property={p} saleType={saleType} />)}
        </div>
      )}
    </div>
  );
}
