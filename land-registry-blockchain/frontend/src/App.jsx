import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext";
import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MintProperty from "./pages/MintProperty";
import PropertyDetail from "./pages/PropertyDetail";
import LandingPage from "./pages/LandingPage";
import SignInPage from "./pages/SignInPage";
import SSOCallbackPage from "./pages/SSOCallbackPage";
import RoleSelection from "./pages/RoleSelection";

const DashboardLayout = ({ title }) => (
  <div className="app-shell">
    <Navbar />
    {/* Optional badge for distinguishing dashboards */}
    <div className="bg-brand-900 text-center text-brand-300 text-xs py-1 border-b border-brand-800 tracking-wider uppercase font-semibold">
      {title}
    </div>
    <main className="main-content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/mint" element={<MintProperty />} />
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
          {/* Landing Page Route - Auto redirect to dashboard if logged in */}
          <Route path="/" element={
            <>
              <SignedIn>
                <Navigate to="/role-selection" replace />
              </SignedIn>
              <SignedOut>
                <LandingPage />
              </SignedOut>
            </>
          } />

          {/* Auth flows */}
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sso-callback" element={<SSOCallbackPage />} />

          <Route path="/role-selection" element={
            <>
              <SignedIn>
                <RoleSelection />
              </SignedIn>
              <SignedOut>
                <Navigate to="/" />
              </SignedOut>
            </>
          } />

          {/* User Dashboard */}
          <Route
            path="/user-dashboard/*"
            element={
              <>
                <SignedIn>
                  <DashboardLayout title="User Portal" />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/" />
                </SignedOut>
              </>
            }
          />

          {/* Registrar Dashboard */}
          <Route
            path="/registrar-dashboard/*"
            element={
              <>
                <SignedIn>
                  <DashboardLayout title="Registrar Portal" />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/" />
                </SignedOut>
              </>
            }
          />

          <Route path="/dashboard/*" element={<Navigate to="/role-selection" />} />
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
