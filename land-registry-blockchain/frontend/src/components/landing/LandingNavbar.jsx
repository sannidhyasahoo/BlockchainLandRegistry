import React from 'react';
import { Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function LandingNavbar() {
    const role = localStorage.getItem("userRole");

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-brand-900/95 backdrop-blur-md border-b border-brand-800/80 shadow-lg">
            <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                {/* Logo & Brand */}
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center border border-brand-500 shadow-md">
                        <Landmark className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-2xl tracking-tight text-white">LandChain</span>
                </Link>

                {/* Navigation */}
                <nav className="flex items-center gap-8">
                    <a
                        href="#about"
                        className="text-base font-medium text-brand-200 hover:text-white transition-colors duration-200"
                    >
                        About
                    </a>

                    {!role ? (
                        <Link to="/sign-in">
                            <button className="text-base font-semibold text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 px-6 py-3 rounded-lg transition-all duration-200 cursor-pointer shadow-md hover:shadow-lg hover:scale-105 transform">
                                Sign In
                            </button>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-6">
                            <Link to={role === "registrar" ? "/registrar-dashboard" : "/user-dashboard"}>
                                <button className="text-base font-semibold text-brand-100 hover:text-white transition-colors">
                                    Dashboard
                                </button>
                            </Link>
                            <button 
                               className="text-sm font-semibold text-brand-300 hover:text-white transition-colors border border-brand-700 px-4 py-2 rounded"
                               onClick={() => {
                                  localStorage.removeItem("userRole");
                                  window.location.reload();
                               }}
                            >
                               Sign Out
                            </button>
                        </div>
                    )}
                </nav>
            </div>
        </header>
    );
}
