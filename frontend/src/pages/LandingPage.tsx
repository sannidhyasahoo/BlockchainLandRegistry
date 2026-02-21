import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ComplaintCarousel from '../components/ComplaintCarousel';
import BentoGrid from '../components/BentoGrid';
import Footer from '../components/Footer';

export default function LandingPage() {
    return (
        <div className="min-h-screen text-white flex flex-col relative w-full overflow-x-hidden bg-brand-900">
            <Navbar />
            <main className="flex-grow w-full px-4 pt-24 pb-8 flex flex-col items-center">
                <Hero />
                <ComplaintCarousel />
                <BentoGrid />
            </main>
            <Footer />
        </div>
    );
}
