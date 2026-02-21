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
    // Duplicate array to enable smooth infinite scrolling
    const carouselItems = [...mockComplaints, ...mockComplaints];

    return (
        <section className="w-full py-20 px-4 bg-brand-800 border-y border-brand-700 overflow-hidden text-slate-100 flex flex-col items-center">

            <div className="w-full max-w-[1400px] mb-8 text-center" />

            {/* Viewport for carousel */}
            <div className="w-full max-w-[1600px] relative">
                <div
                    className="flex w-max gap-6 animate-carousel pause-hover"
                >
                    {carouselItems.map((item, index) => (
                        <div
                            key={index}
                            className="w-[360px] md:w-[420px] bg-brand-900 border border-brand-700/60 p-6 rounded-3xl flex flex-col justify-between flex-shrink-0"
                        >
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-semibold text-brand-100 text-sm tracking-wide">{item.handle}</span>
                                {item.platform === 'twitter' ? (
                                    <Twitter className="w-4 h-4 text-[#1DA1F2]/80" />
                                ) : (
                                    <Instagram className="w-4 h-4 text-[#E1306C]/80" />
                                )}
                            </div>
                            <p className="text-sm text-brand-200 mb-6 leading-relaxed">
                                "{item.content}"
                            </p>
                            <div className="text-xs text-brand-400 font-medium">
                                {item.date}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
