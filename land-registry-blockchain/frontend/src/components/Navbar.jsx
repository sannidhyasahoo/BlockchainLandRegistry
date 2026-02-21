/**
 * components/Navbar.jsx
 */
import { Link, useLocation } from "react-router-dom";
import { UserButton } from "@clerk/clerk-react";
import { useWallet } from "../context/WalletContext";
import { BLOCK_EXPLORER, CONTRACT_ADDRESS } from "../constants";

export default function Navbar() {
  const { address, isRegistrar, connecting, connect, disconnect } = useWallet();
  const { pathname } = useLocation();

  const short = (addr) => addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "";

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="nav-logo">🏛️</span>
        <span className="nav-title">LandChain</span>
        <span className="nav-sub">Polygon Amoy</span>
      </div>

      <div className="nav-links">
        <Link className={`nav-link ${pathname === "/dashboard" || pathname === "/dashboard/" ? "active" : ""}`} to="/dashboard">Properties</Link>
        {isRegistrar && (
          <Link className={`nav-link ${pathname === "/dashboard/mint" ? "active" : ""}`} to="/dashboard/mint">
            ✦ Mint Property
          </Link>
        )}
        <a
          className="nav-link"
          href={`${BLOCK_EXPLORER}/address/${CONTRACT_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Contract ↗
        </a>
      </div>

      <div className="nav-wallet">
        {address ? (
          <div className="wallet-connected">
            {isRegistrar && <span className="registrar-badge">Registrar</span>}
            <span className="wallet-address">{short(address)}</span>
            <button className="btn-ghost" onClick={disconnect}>Disconnect</button>
          </div>
        ) : (
          <button className="btn-primary" onClick={connect} disabled={connecting}>
            {connecting ? "Connecting…" : "Connect Wallet"}
          </button>
        )}

        {/* Clerk Profile & Logout Dropdown */}
        <div className="ml-4 flex items-center border-l border-white/10 pl-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </nav>
  );
}
