import React from 'react';
import { ShieldCheck, FileKey, Coins, ArrowRightLeft } from 'lucide-react';

const mockSolutions = [
    {
        icon: <ShieldCheck className="w-12 h-12 text-brand-300" />,
        text: "Immutable chain of ownership prevents title fraud."
    },
    {
        icon: <FileKey className="w-12 h-12 text-brand-300" />,
        text: "Real-time cryptographic verification for all parties."
    },
    {
        icon: <Coins className="w-12 h-12 text-brand-300" />,
        text: "Automated stamp duty processing."
    },
    {
        icon: <ArrowRightLeft className="w-12 h-12 text-brand-300" />,
        text: "Transparent mutation and subdivision tracking logs."
    }
];

export default function BentoGrid() {
    const carouselItems = [...mockSolutions, ...mockSolutions, ...mockSolutions];

    return (
        <section id="solutions" className="w-full py-32 px-4 bg-brand-900 overflow-hidden">
            <div className="w-full max-w-7xl mx-auto mb-20 text-center">
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
                    Solutions Provided
                </h2>
                <p className="text-xl md:text-2xl text-brand-200 max-w-4xl mx-auto leading-relaxed">
                    Cutting-edge blockchain technology addressing critical challenges in land management
                </p>
            </div>

            <div className="w-full relative">
                <div className="flex w-max gap-8 animate-carousel pause-hover">
                    {carouselItems.map((item, index) => (
                        <div
                            key={index}
                            className="w-[420px] min-h-[280px] bg-gradient-to-br from-brand-800 to-brand-800/80 border border-brand-700/60 p-10 rounded-3xl flex flex-col justify-between flex-shrink-0 hover:scale-[1.02] hover:border-brand-600/80 hover:shadow-xl hover:shadow-brand-700/30 transition-all duration-300"
                        >
                            <div className="mb-8">
                                {item.icon}
                            </div>
                            <span className="text-2xl font-semibold text-white leading-relaxed">
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
