import React from 'react';
import { Twitter, Linkedin, Github, Landmark } from 'lucide-react';

export default function LandingFooter() {
    return (
        <footer className="w-full bg-brand-900 border-t border-brand-800 py-20 px-8 mt-auto">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center border border-brand-500">
                                <Landmark className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-bold text-white tracking-tight">
                                LandChain
                            </span>
                        </div>
                        <p className="text-base text-brand-300 mb-6 leading-relaxed max-w-md">
                            A next-generation real estate and land registry suite built for scale. Our platform mitigates title fraud, reduces redundant bureaucratic processes, and provides an immutable chain of ownership.
                        </p>
                        <div className="flex items-center gap-6">
                            <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors duration-200">
                                <Twitter className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors duration-200">
                                <Linkedin className="w-6 h-6" />
                            </a>
                            <a href="#" className="text-brand-400 hover:text-brand-300 transition-colors duration-200">
                                <Github className="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">Company</h3>
                        <div className="flex flex-col gap-4">
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">About Us</a>
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">Careers</a>
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">Contact</a>
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">Newsroom</a>
                        </div>
                    </div>

                    {/* Legal & Resources */}
                    <div>
                        <h3 className="text-white font-bold mb-6 text-lg uppercase tracking-wider">Legal</h3>
                        <div className="flex flex-col gap-4">
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">Privacy Policy</a>
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">Terms of Service</a>
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">Cookie Policy</a>
                        </div>
                        <h3 className="text-white font-bold mb-6 mt-8 text-lg uppercase tracking-wider">Resources</h3>
                        <div className="flex flex-col gap-4">
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">Documentation</a>
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">API Reference</a>
                            <a href="#" className="text-base text-brand-300 hover:text-white transition-colors duration-200">Support</a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-brand-800 pt-8">
                    <p className="text-base text-brand-400 text-center">
                        LandChain © 2026. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
