import React from 'react';
import { Landmark } from 'lucide-react'; // Institutional icon placeholder
import { Link } from 'react-router-dom';

export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-brand-900/90 backdrop-blur-sm border-b border-brand-800">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                {/* Left Side: Logo & Brand */}
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-brand-700 flex items-center justify-center border border-brand-600">
                        <Landmark className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-semibold text-lg tracking-tight text-white">Intelligstry</span>
                </div>

                {/* Right Side: Links & Auth */}
                <nav className="flex items-center gap-6">
                    <a
                        href="#about"
                        className="text-sm font-medium text-brand-200 hover:text-white transition-opacity duration-200"
                    >
                        About
                    </a>

                    <Link to="/dashboard">
                        <button className="text-sm font-medium text-white bg-brand-700 hover:bg-brand-600 px-4 py-2 rounded-md transition-opacity duration-200 cursor-pointer">
                            Sign In
                        </button>
                    </Link>
                </nav>
            </div>
        </header>
    );
}
