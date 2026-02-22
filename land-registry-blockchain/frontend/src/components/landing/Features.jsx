import React from 'react';
import { ShieldCheck, FileKey, Coins, ArrowRightLeft, Cpu, Users } from 'lucide-react';

const features = [
    {
        title: "Immutable Ledgers",
        description: "Cryptographically secured on Polygon. Title fraud is mathematically impossible when every transfer is etched into the blockchain.",
        icon: <ShieldCheck className="w-8 h-8 text-teal-400" />,
        className: "md:col-span-2 md:row-span-2",
        gradient: "from-teal-500/20 to-indigo-500/20"
    },
    {
        title: "AI Risk Assessment",
        description: "Gemini 2.5 Flash preemptively evaluates transactions for compliance and fraud risks in real-time.",
        icon: <Cpu className="w-8 h-8 text-purple-400" />,
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-purple-500/20 to-pink-500/20"
    },
    {
        title: "Smart Partnerships",
        description: "Form 50/50 multi-sig trust groups instantly. Smart contracts split rent and sale yields automatically.",
        icon: <Users className="w-8 h-8 text-indigo-400" />,
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-indigo-500/20 to-blue-500/20"
    },
    {
        title: "Decentralized Escrow",
        description: "Funds are locked on-chain until the Registrar finalizes the transfer. Zero counterparty risk.",
        icon: <Coins className="w-8 h-8 text-yellow-400" />,
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-yellow-500/20 to-orange-500/20"
    },
    {
        title: "Transparent Audits",
        description: "Every action is tracked in an unalterable, synthesized timeline event log accessible to everyone.",
        icon: <ArrowRightLeft className="w-8 h-8 text-emerald-400" />,
        className: "md:col-span-1 md:row-span-1",
        gradient: "from-emerald-500/20 to-teal-500/20"
    }
];

export default function Features() {
    return (
        <section id="features" className="w-full py-32 px-6 bg-brand-900 relative">
            <div className="max-w-[1200px] mx-auto relative z-10">
                <div className="text-center mb-20 animate-reveal">
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                        Powering the <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-teal-400">Next Generation</span>
                        <br /> of Real Estate
                    </h2>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-light">
                        LandChain provides the core infrastructure to mint, trade, and manage property rights securely on the blockchain.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-6 auto-rows-[250px]">
                    {features.map((feature, i) => (
                        <div 
                            key={i} 
                            className={`glass-card rounded-3xl p-8 relative overflow-hidden group hover:-translate-y-1 transition-all duration-500 ${feature.className}`}
                            style={{ animationDelay: `${i * 100}ms` }}
                        >
                            {/* Animated Background Light */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out`}></div>
                            
                            {/* Animated Border Glow */}
                            <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-out"></div>
                            <div className="absolute inset-x-0 -bottom-px h-px w-full bg-gradient-to-r from-transparent via-white/30 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-1000 ease-out"></div>

                            <div className="relative z-10 h-full flex flex-col justify-between">
                                <div className="p-3 bg-white/5 rounded-2xl w-fit border border-white/10 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{feature.title}</h3>
                                    <p className="text-slate-400 leading-relaxed font-light text-sm md:text-base">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            
            {/* Soft background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"></div>
        </section>
    );
}
