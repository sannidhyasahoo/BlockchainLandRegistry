import React from 'react';
import { Link } from 'react-router-dom';

export default function Hero() {
    return (
        <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-brand-900 pt-32 pb-20">
            {/* Animated Background Gradients */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/20 blur-[120px] mix-blend-screen animate-pulse-glow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 max-w-[1400px] mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center">
                
                {/* Left Content */}
                <div className="flex flex-col items-start text-left animate-reveal">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-8 border border-indigo-500/30">
                        <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                        <span className="text-xs font-bold tracking-wider text-indigo-200 uppercase">Live on Polygon Amoy</span>
                    </div>

                    <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.05]">
                        The Future of <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient">Real Estate</span> <br />
                        is On-Chain.
                    </h1>

                    <p className="text-xl text-slate-300 mb-10 max-w-xl leading-relaxed font-light">
                        Mint, trade, lease, and form partnerships on immutable property deeds. Experience decentralized transactions with instant settlement and AI-powered risk assessment.
                    </p>

                    <div className="flex flex-wrap items-center gap-6">
                        <Link to="/signin">
                            <button className="px-8 py-3.5 rounded-md bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] transition-all duration-300 hover:-translate-y-1">
                                Enter App
                            </button>
                        </Link>
                        <a href="#how-it-works" className="px-8 py-3.5 rounded-md glass-card text-white font-bold text-lg hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                            See How it Works
                        </a>
                    </div>
                </div>

                {/* Right Content - Abstract Floating Cards */}
                <div className="relative h-[600px] hidden lg:block perspective-1000">
                    
                    {/* Main Card */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] glass-card rounded-2xl p-6 border border-white/10 shadow-2xl animate-float z-20 bg-brand-900/40">
                        <div className="h-40 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 mb-6 border border-white/5 relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
                             <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-[10px] font-bold text-teal-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span> Active Sale
                             </div>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-1">Luxury Villa #4092</h3>
                                <p className="text-xs text-slate-400 font-mono">0x4C2c...90e7</p>
                            </div>
                            <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                <div>
                                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Price</p>
                                    <p className="text-xl font-bold text-teal-400">45.00 POL</p>
                                </div>
                                <div className="px-4 py-2 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-xs font-bold text-indigo-200">
                                    Buy Now
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Secondary Card 1 (Partnership) */}
                    <div className="absolute top-[10%] left-[5%] w-[260px] glass-card rounded-2xl p-4 border border-white/10 shadow-xl animate-float-delayed z-10 rotate-[-8deg] bg-brand-900/40">
                        <div className="flex items-center gap-3 mb-3 pb-3 border-b border-white/10">
                            <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                🤝
                            </div>
                            <div>
                                <p className="text-xs font-bold text-white">Partnership Created</p>
                                <p className="text-[10px] text-slate-400">Tokens split 50/50 automatically</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center px-2">
                            <span className="text-xs font-mono text-indigo-300">Partner 1</span>
                            <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">50%</span>
                        </div>
                    </div>

                    {/* Secondary Card 2 (Lease) */}
                    <div className="absolute bottom-[10%] right-[0%] w-[260px] glass-card rounded-2xl p-4 border border-white/10 shadow-xl animate-float z-30 rotate-[6deg] bg-brand-900/40" style={{ animationDelay: '1s' }}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <p className="text-xs font-bold text-white mb-1">Active Lease</p>
                                <p className="text-[10px] text-slate-400 font-mono">Tenant: 0x8920...43e7</p>
                            </div>
                            <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-[10px] font-bold rounded border border-yellow-400/30">
                                Expires in 30d
                            </span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-400 to-indigo-400 h-full w-[25%] rounded-full"></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}
