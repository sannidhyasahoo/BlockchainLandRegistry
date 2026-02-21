import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MintProperty from "./pages/MintProperty";
import PendingMints from "./pages/PendingMints";
import MyAssets from "./pages/MyAssets";
import RegistrarConsole from "./pages/RegistrarConsole";
import PropertyDetail from "./pages/PropertyDetail";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";

const ProtectedRoute = ({ children, allowedRole, redirectPath = "/" }) => {
  const currentRole = localStorage.getItem("userRole");
  if (!currentRole) return <Navigate to="/sign-in" replace />;
  if (allowedRole && currentRole !== allowedRole) return <Navigate to={redirectPath} replace />;
  return children;
};

const DashboardLayout = ({ title }) => (
  <div className="app-shell">
    <Navbar />
    <div style={{ textAlign: "center", fontSize: "10px", padding: "4px 0", borderBottom: "1px solid rgba(255,255,255,0.04)", color: "var(--text-3)", letterSpacing: "2px", fontWeight: 700, textTransform: "uppercase" }}>
      {title}
    </div>
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mint" element={<MintProperty />} />
        <Route path="/my-assets" element={<MyAssets />} />
        <Route path="/pending" element={<PendingMints />} />
        <Route path="/console" element={<RegistrarConsole />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
      </Routes>
    </main>
  </div>
);

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sign-in" element={<SignInPage />} />

          <Route path="/user-dashboard/*" element={
            <ProtectedRoute allowedRole="user" redirectPath="/registrar-dashboard">
              <DashboardLayout title="Citizen Portal" />
            </ProtectedRoute>
          } />

          <Route path="/registrar-dashboard/*" element={
            <ProtectedRoute allowedRole="registrar" redirectPath="/user-dashboard">
              <DashboardLayout title="Registrar Portal" />
            </ProtectedRoute>
          } />

          <Route path="/dashboard/*" element={<Navigate to="/sign-in" />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>

        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a2e",
              color: "#e2e8f0",
              border: "1px solid #334155",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </BrowserRouter>
    </WalletProvider>
  );
}
