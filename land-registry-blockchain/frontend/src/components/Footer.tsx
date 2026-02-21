import { Twitter, Linkedin, Github } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full bg-brand-900 border-t border-brand-800 py-16 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-12">
                <div className="flex flex-col items-center md:items-start gap-4 max-w-sm">
                    <span className="text-2xl font-semibold text-white tracking-tight">
                        Intelligstry
                    </span>
                    <p className="text-sm font-medium text-brand-300 mb-2 text-center md:text-left leading-relaxed">
                        Intelligstry is a next-generation real estate and land registry suite built for scale. Our platform mitigates title fraud, reduces redundant bureaucratic processes, and provides an immutable chain of ownership.
                    </p>
                    <span className="text-sm font-medium text-brand-400">
                        Intelligstry © 2026. All rights reserved.
                    </span>

                    <div className="flex items-center gap-6 mt-2">
                        <a href="#" className="text-brand-400 hover:text-white transition-colors duration-200">
                            <Twitter className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-brand-400 hover:text-white transition-colors duration-200">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="#" className="text-brand-400 hover:text-white transition-colors duration-200">
                            <Github className="w-5 h-5" />
                        </a>
                    </div>
                </div>

                <div className="flex flex-wrap gap-12 md:gap-24 justify-center md:justify-end">
                    <div className="flex flex-col gap-3 text-center md:text-left">
                        <span className="text-white font-semibold mb-2">Company</span>
                        <a href="#" className="text-sm text-brand-300 hover:text-white transition-colors duration-200">About Us</a>
                        <a href="#" className="text-sm text-brand-300 hover:text-white transition-colors duration-200">Careers</a>
                        <a href="#" className="text-sm text-brand-300 hover:text-white transition-colors duration-200">Contact</a>
                        <a href="#" className="text-sm text-brand-300 hover:text-white transition-colors duration-200">Newsroom</a>
                    </div>
                    <div className="flex flex-col gap-3 text-center md:text-left">
                        <span className="text-white font-semibold mb-2">Legal</span>
                        <a href="#" className="text-sm text-brand-300 hover:text-white transition-colors duration-200">Privacy Policy</a>
                        <a href="#" className="text-sm text-brand-300 hover:text-white transition-colors duration-200">Terms of Service</a>
                        <a href="#" className="text-sm text-brand-300 hover:text-white transition-colors duration-200">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
