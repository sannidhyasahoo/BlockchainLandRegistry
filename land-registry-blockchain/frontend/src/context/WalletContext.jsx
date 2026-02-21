/**
 * context/WalletContext.jsx
 * ──────────────────────────────────────────────────────────────────
 * Provides: wallet address, signer, isRegistrar, network check
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { ethers } from "ethers";
import { AMOY_NETWORK, CHAIN_ID, REGISTRAR_ADDRESS } from "../constants";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress]         = useState(null);
  const [signer, setSigner]           = useState(null);
  const [chainOk, setChainOk]         = useState(false);
  const [connecting, setConnecting]   = useState(false);

  const isRegistrar = address?.toLowerCase() === REGISTRAR_ADDRESS?.toLowerCase();

  // ── Switch / add Amoy network ──────────────────────────────────
  const switchToAmoy = useCallback(async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: AMOY_NETWORK.chainId }],
      });
    } catch (err) {
      if (err.code === 4902) {
        await window.ethereum.request({
          method: "wallet_addEthereumChain",
          params: [AMOY_NETWORK],
        });
      } else throw err;
    }
  }, []);

  // ── Connect MetaMask ───────────────────────────────────────────
  const connect = useCallback(async () => {
    if (!window.ethereum) {
      alert("MetaMask not found. Please install it.");
      return;
    }
    setConnecting(true);
    try {
      await switchToAmoy();
      const provider = new ethers.BrowserProvider(window.ethereum);
      const s = await provider.getSigner();
      const addr = await s.getAddress();
      const network = await provider.getNetwork();

      setAddress(addr);
      setSigner(s);
      setChainOk(Number(network.chainId) === CHAIN_ID);
    } catch (err) {
      console.error("Connect failed:", err);
    } finally {
      setConnecting(false);
    }
  }, [switchToAmoy]);

  const disconnect = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setChainOk(false);
  }, []);

  // ── Listen for account / chain changes ────────────────────────
  useEffect(() => {
    if (!window.ethereum) return;

    const onAccounts = (accounts) => {
      if (accounts.length === 0) disconnect();
      else connect();
    };
    const onChain = () => connect();

    window.ethereum.on("accountsChanged", onAccounts);
    window.ethereum.on("chainChanged", onChain);

    // Auto-reconnect if already approved
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0) connect();
    });

    return () => {
      window.ethereum.removeListener("accountsChanged", onAccounts);
      window.ethereum.removeListener("chainChanged", onChain);
    };
  }, [connect, disconnect]);

  return (
    <WalletContext.Provider value={{ address, signer, isRegistrar, chainOk, connecting, connect, disconnect, switchToAmoy }}>
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => useContext(WalletContext);
