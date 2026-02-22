import React from 'react';
import { ArrowRight, KeyRound, CheckCircle2, ShieldCheck } from 'lucide-react';

const steps = [
    {
        num: "01",
        title: "Mint Title Deed",
        desc: "Sellers digitize their property by minting an NFT representation. Important documents are hashed and stored immutably on IPFS.",
        icon: <KeyRound className="w-6 h-6 text-indigo-400" />
    },
    {
        num: "02",
        title: "Establish Trust",
        desc: "The buyer and seller connect on-chain. The seller physically verifies the buyer and records their wallet address, unlocking the escrow phase.",
        icon: <ShieldCheck className="w-6 h-6 text-teal-400" />
    },
    {
        num: "03",
        title: "Escrow & Finalize",
        desc: "Buyers lock funds in a decentralized escrow. A government-appointed Registrar reviews the deed and approves the automated transfer.",
        icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />
    }
];

export default function HowItWorks() {
    return (
        <section id="how-it-works" className="w-full py-32 px-6 bg-brand-800 relative border-t border-brand-700/50">
            <div className="max-w-[1200px] mx-auto">
                <div className="text-center mb-24">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        How It Works
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                        A seamless, cryptographically secure workflow from minting to final execution.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                    {/* Connecting UI Line */}
                    <div className="hidden md:block absolute top-[60px] left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/0 via-indigo-500/50 to-indigo-500/0"></div>

                    {steps.map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center text-center group">
                            
                            <div className="w-32 h-32 mb-8 relative flex items-center justify-center">
                                {/* Animated Rings */}
                                <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-full group-hover:scale-110 transition-transform duration-500"></div>
                                <div className="absolute inset-2 border border-white/10 rounded-full group-hover:bg-indigo-500/10 transition-colors duration-500"></div>
                                
                                {/* Step Number / Icon */}
                                <div className="text-3xl font-black text-white/20 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-br group-hover:from-indigo-400 group-hover:to-teal-400 transition-all duration-300 absolute">
                                    {step.num}
                                </div>
                                <div className="absolute bottom-0 right-0 p-2 bg-brand-800 rounded-full border border-white/10 shadow-xl group-hover:scale-110 transition-transform duration-300">
                                    {step.icon}
                                </div>
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300">{step.title}</h3>
                            <p className="text-slate-400 leading-relaxed font-light">{step.desc}</p>
                            
                            {i < steps.length - 1 && (
                                <ArrowRight className="w-6 h-6 text-indigo-500/50 absolute -right-4 top-[50px] hidden md:block" />
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
