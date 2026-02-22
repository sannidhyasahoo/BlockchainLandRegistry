import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function LandingNavbar() {
    const role = localStorage.getItem("userRole");
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-8'}`}>
            <div className="max-w-[1400px] mx-auto px-8">
                <div className={`glass-card rounded-[24px] px-8 py-5 flex items-center justify-between transition-all duration-300 ${scrolled ? 'bg-opacity-90 shadow-2xl' : 'bg-opacity-50'}`}>
                    
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                            L
                        </div>
                        <span className="text-xl font-bold text-white tracking-wide">
                            LandChain
                        </span>
                    </Link>

                    {/* Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-sm font-medium text-slate-300  hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">How it Works</a>
                    </div>

                    {/* CTA */}
                    <div className="flex items-center gap-4">
                        {role ? (
                            <>
                                <Link to={role === "registrar" ? "/registrar-dashboard" : "/user-dashboard"} className="px-6 py-3 rounded-md bg-white text-sky-950 font-bold text-sm hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all duration-300 hover:scale-[1.02]">
                                    Enter App →
                                </Link>
                                <button 
                                    className="text-sm font-semibold text-brand-300 hover:text-white transition-colors border border-brand-700 px-5 py-2.5 rounded-md ml-2"
                                    onClick={() => {
                                        localStorage.removeItem("userRole");
                                        window.location.reload();
                                    }}
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <Link to="/sign-in" className="px-8 py-3 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] transition-all duration-300 hover:scale-[1.02] border border-white/10">
                                Launch App
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
