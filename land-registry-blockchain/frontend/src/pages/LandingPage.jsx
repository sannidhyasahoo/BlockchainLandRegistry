import React, { useEffect } from 'react';
import LandingNavbar from '../components/landing/LandingNavbar';
import Hero from '../components/landing/Hero';
import HowItWorks from '../components/landing/HowItWorks';
import Features from '../components/landing/Features';
import LandingFooter from '../components/landing/LandingFooter';

export default function LandingPage() {
    
    // Ensure scroll starts at top on load
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen text-white flex flex-col relative w-full overflow-x-hidden bg-brand-900 scroll-smooth">
            <LandingNavbar />
            
            <main className="flex-grow w-full flex flex-col items-center">
                <Hero />
                <Features />
                <HowItWorks />
            </main>
            
            <LandingFooter />
        </div>
    );
}
