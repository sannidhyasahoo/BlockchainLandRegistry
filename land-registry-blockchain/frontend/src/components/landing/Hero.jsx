import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import LiquidBackground from './LiquidBackground';

export default function Hero() {
    return (
        <section className="relative w-full min-h-screen flex flex-col items-center justify-center px-6 bg-brand-800 rounded-[2.5rem] overflow-hidden border border-brand-700 shadow-2xl">
            {/* Liquid Background */}
            <div className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%] animate-parallax pointer-events-none z-0">
                <LiquidBackground />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center justify-center text-center max-w-6xl mx-auto"
            >
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]"
                >
                    Secure & Programmable
                    <br />
                    Digital Land Registry
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                    className="text-xl md:text-2xl text-brand-200 mb-12 max-w-4xl leading-relaxed"
                >
                    Blockchain-powered land ownership with immutable records, instant verification, and transparent transactions
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
                >
                    <Link to="/dashboard">
                        <button className="px-14 py-5 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all duration-300 text-xl shadow-lg hover:shadow-brand-500/50 cursor-pointer hover:scale-105 transform">
                            Get Started
                        </button>
                    </Link>
                </motion.div>
            </motion.div>
        </section>
    );
}
