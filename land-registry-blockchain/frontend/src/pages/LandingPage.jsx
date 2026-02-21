import React from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import ComplaintCarousel from '../components/landing/ComplaintCarousel';
import BentoGrid from '../components/landing/BentoGrid';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
    return (
        <div className="min-h-screen text-white flex flex-col relative w-full overflow-x-hidden bg-brand-900">
            <LandingNavbar />
            <main className="flex-grow w-full pt-20 flex flex-col items-center">
                <div className="w-full max-w-[1600px] px-6 py-8">
                    <Hero />
                </div>
                <ComplaintCarousel />
                <BentoGrid />
            </main>
            <LandingFooter />
        </div>
    );
}
