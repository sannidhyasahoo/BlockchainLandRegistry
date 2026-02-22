/**
 * components/Navbar.jsx
 */
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { BLOCK_EXPLORER, CONTRACT_ADDRESS } from "../constants";
import { useState, useEffect } from "react";
import { fetchAllProperties } from "../utils/contract";

// ── Notifications Component ───────────────────────────────────────────────────
function Notifications({ role, address }) {
  const [alerts, setAlerts] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function load() {
      if (!address && role !== "registrar") return;
      try {
        const props = await fetchAllProperties();
        let actionable = [];
        if (role === "registrar") {
          // Registrar alerts: Awaiting Final (Status 4)
          actionable = props.filter(p => p.status === 4);
        } else {
          // Seller alerts: Funds Locked (Status 3), means buyer deposited
          actionable = props.filter(p => p.status === 3 && p.seller?.toLowerCase() === address?.toLowerCase());
        }
        setAlerts(actionable);
      } catch (err) {
        // fail silently
      }
    }
    load();
    const int = setInterval(load, 15000); // Polling every 15s
    return () => clearInterval(int);
  }, [role, address]);

  const count = alerts.length;

  return (
    <div style={{ position: "relative", marginRight: "16px" }}>
      <button 
        style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", position: "relative", padding: "4px" }}
        onClick={() => setOpen(!open)}
      >
        🔔
        {count > 0 && (
          <span style={{ 
            position: "absolute", top: 0, right: 0, 
            background: "var(--red)", color: "white", 
            borderRadius: "50%", padding: "2px 6px", 
            fontSize: "10px", fontWeight: "bold" 
          }}>
            {count}
          </span>
        )}
      </button>

      {open && (
        <div style={{ 
          position: "absolute", top: "100%", right: 0, marginTop: "8px",
          background: "var(--bg-elevated)", border: "1px solid var(--border-soft)",
          borderRadius: "12px", width: "260px", boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          zIndex: 9999, padding: "8px", overflow: "hidden"
        }}>
          <h4 style={{ margin: "8px", fontSize: "14px", color: "var(--text-1)" }}>Notifications</h4>
          {count === 0 ? (
            <div style={{ padding: "16px", fontSize: "12px", color: "var(--text-3)", textAlign: "center" }}>No new alerts.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {alerts.map(p => (
                <Link 
                  key={p.tokenId} 
                  to={`/property/${p.tokenId}`}
                  style={{ display: "block", padding: "10px", borderRadius: "8px", textDecoration: "none", background: "var(--bg-main)", border: "1px solid var(--border-soft)" }}
                  onClick={() => setOpen(false)}
                >
                  <div style={{ fontSize: "13px", fontWeight: "bold", color: "var(--text-1)" }}>Property #{p.tokenId}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "4px" }}>
                    {role === "registrar" ? "Ready for final sign-off" : "Buyer deposited funds in escrow"}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Navbar Component ──────────────────────────────────────────────────────────
export default function Navbar() {
  const { address, connecting, connect, disconnect } = useWallet();
  const { pathname } = useLocation();
  const role = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName");

  const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";
  const basePath = pathname.startsWith("/registrar") ? "/registrar-dashboard" : "/user-dashboard";
  const isActive = (path) => pathname === path || pathname === `${path}/`;
  const includes = (seg) => pathname.includes(seg);

  const handleSignOut = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    window.location.href = "/sign-in";
  };

  return (
    <nav className="navbar">
      {/* Brand */}
      <Link to={basePath} className="nav-brand">
        <span className="nav-logo">🏛️</span>
        <span className="nav-title">LandChain</span>
        <span className="nav-sub">Amoy</span>
      </Link>

      {/* Links */}
      <div className="nav-links">
        {role !== "registrar" && (
          <>
            <Link className={`nav-link ${isActive(basePath) ? "active" : ""}`} to={basePath}>
              Listings
            </Link>
            <Link className={`nav-link ${includes("/my-assets") ? "active" : ""}`} to={`${basePath}/my-assets`}>
              My Properties
            </Link>
            <Link className={`nav-link ${includes("/mint") ? "active" : ""}`} to={`${basePath}/mint`}>
              + Mint Property
            </Link>
          </>
        )}

        {role === "registrar" && (
          <>
            <Link className={`nav-link ${isActive(basePath) ? "active" : ""}`} to={basePath}>
              Overview
            </Link>
            <Link className={`nav-link ${includes("/pending") ? "active" : ""}`} to={`${basePath}/pending`}>
              Incoming Deeds
            </Link>
            <Link className={`nav-link ${includes("/console") ? "active" : ""}`} to={`${basePath}/console`}>
              Console
            </Link>
          </>
        )}

        <a className="nav-link" href={`${BLOCK_EXPLORER}/address/${CONTRACT_ADDRESS}`}
          target="_blank" rel="noopener noreferrer">
          Contract ↗
        </a>
      </div>

      {/* Wallet + User */}
      <div className="nav-wallet">
        <Notifications role={role} address={address} />

        {userName && (
          <span className="nav-username">
            {role === "registrar" && <span className="registrar-badge">Registrar</span>}
            {userName}
          </span>
        )}
        {address ? (
          <div className="wallet-connected">
            <span className="wallet-address">{short(address)}</span>
            <button className="btn-ghost" onClick={disconnect}>Disconnect</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={connect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Wallet"}
          </button>
        )}
        <button className="btn-ghost" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
    </nav>
  );
}
