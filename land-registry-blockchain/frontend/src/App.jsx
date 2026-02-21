import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "./context/WalletContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import MintProperty from "./pages/MintProperty";
import PropertyDetail from "./pages/PropertyDetail";

import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Dashboard App */}
          <Route
            path="/dashboard/*"
            element={
              <div className="app-shell">
                <Navbar />
                <main className="main-content">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/mint" element={<MintProperty />} />
                    <Route path="/property/:id" element={<PropertyDetail />} />
                  </Routes>
                </main>
              </div>
            }
          />
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
