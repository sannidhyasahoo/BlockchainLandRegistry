import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import LiquidBackground from './LiquidBackground';
import { TypewriterEffect } from '../components/ui/typewriter-effect';

export default function Hero() {
    return (
        <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center pt-24 pb-16 px-6 bg-brand-800 rounded-[2.5rem] overflow-hidden border border-brand-700 shadow-2xl">
            {/* Parallax wrapper for Liquid Background */}
            <div className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%] animate-parallax pointer-events-none z-0">
                <LiquidBackground />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center justify-center text-center max-w-5xl mx-auto"
            >
                <TypewriterEffect
                    words={[
                        { text: "Secure", className: "text-white font-calibri text-2xl md:text-4xl lg:text-5xl tracking-tight" },
                        { text: "&", className: "text-white font-calibri text-2xl md:text-4xl lg:text-5xl tracking-tight" },
                        { text: "Programmable", className: "text-white font-calibri text-2xl md:text-4xl lg:text-5xl tracking-tight" },
                        { text: "Digital", className: "text-white font-calibri text-2xl md:text-4xl lg:text-5xl tracking-tight" },
                        { text: "Land", className: "text-white font-calibri text-2xl md:text-4xl lg:text-5xl tracking-tight" },
                        { text: "Registry", className: "text-white font-calibri text-2xl md:text-4xl lg:text-5xl tracking-tight" }
                    ]}
                    className="mb-10 block whitespace-nowrap"
                    cursorClassName="bg-brand-300"
                />

                <SignedOut>
                    <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                        <button className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-md transition-colors duration-200 text-lg shadow-sm w-fit tap-highlight-transparent cursor-pointer hover:scale-[1.02] transform">
                            Get Started
                        </button>
                    </SignInButton>
                </SignedOut>
                <SignedIn>
                    <Link to="/dashboard">
                        <button className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-md transition-colors duration-200 text-lg shadow-sm w-fit tap-highlight-transparent cursor-pointer hover:scale-[1.02] transform">
                            Go to Dashboard
                        </button>
                    </Link>
                </SignedIn>
            </motion.div>
        </section>
    );
}
