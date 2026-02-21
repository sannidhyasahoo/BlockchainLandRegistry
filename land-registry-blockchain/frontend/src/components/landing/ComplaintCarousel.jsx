import React from 'react';
import { Twitter, Instagram } from 'lucide-react';

const mockComplaints = [
    {
        platform: 'twitter',
        handle: '@LandOwner123',
        date: 'Oct 12, 2025',
        content: "It has been 3 years and my property mutation is still pending. Different officials keep asking for the same paper over and over.",
    },
    {
        platform: 'instagram',
        handle: 'urban_citizen_99',
        date: 'Nov 04, 2025',
        content: "Just found out my land parcel was sold twice by fraudsters changing the registry records. How is this still possible in 2025?",
    },
    {
        platform: 'twitter',
        handle: '@AgriVoice',
        date: 'Dec 01, 2025',
        content: "Small farmers wait months for standard land division certificates. Manual ledgers are completely outdated and prone to misplacement.",
    },
    {
        platform: 'twitter',
        handle: '@LegalEagle1',
        date: 'Jan 15, 2026',
        content: "Another case of forged title deeds. We genuinely need a tamper-evident system for property registries. The current process is broken.",
    },
    {
        platform: 'instagram',
        handle: 'real_estate_watch',
        date: 'Feb 10, 2026',
        content: "Bribes requested just to view my own property file. Transparency is non-existent in the local administration.",
    }
];

export default function ComplaintCarousel() {
    const carouselItems = [...mockComplaints, ...mockComplaints];

    return (
        <section id="about" className="w-full py-32 px-4 bg-brand-800 border-y border-brand-700 overflow-hidden">
            <div className="w-full max-w-7xl mx-auto mb-20 text-center">
                <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
                    The Problem We Solve
                </h2>
                <p className="text-xl md:text-2xl text-brand-200 max-w-4xl mx-auto leading-relaxed">
                    Real voices from citizens facing challenges with traditional land registry systems
                </p>
            </div>

            <div className="w-full relative">
                <div className="flex w-max gap-8 animate-carousel pause-hover">
                    {carouselItems.map((item, index) => (
                        <div
                            key={index}
                            className="w-[420px] bg-brand-900 border border-brand-700/60 p-8 rounded-3xl flex flex-col justify-between flex-shrink-0 hover:border-brand-600/80 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <span className="font-semibold text-brand-100 text-lg">{item.handle}</span>
                                {item.platform === 'twitter' ? (
                                    <Twitter className="w-6 h-6 text-[#1DA1F2]/80" />
                                ) : (
                                    <Instagram className="w-6 h-6 text-[#E1306C]/80" />
                                )}
                            </div>
                            <p className="text-lg text-brand-200 mb-8 leading-relaxed">
                                "{item.content}"
                            </p>
                            <div className="text-sm text-brand-400 font-medium">
                                {item.date}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
