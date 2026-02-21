import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LiquidBackground from './LiquidBackground';

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
                <h1 className="text-2xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-10 leading-tight block whitespace-nowrap font-calibri">
                    Secure &amp; Programmable Digital Land Registry
                </h1>

                <Link to="/dashboard">
                    <button className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-md transition-colors duration-200 text-lg shadow-sm w-fit tap-highlight-transparent cursor-pointer hover:scale-[1.02] transform">
                        Get Started
                    </button>
                </Link>
            </motion.div>
        </section>
    );
}
