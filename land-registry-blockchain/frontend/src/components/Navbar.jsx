/**
 * components/Navbar.jsx
 */
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { BLOCK_EXPLORER, CONTRACT_ADDRESS } from "../constants";

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
