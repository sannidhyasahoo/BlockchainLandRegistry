import { ShieldCheck, FileKey, Coins, ArrowRightLeft } from 'lucide-react';

const mockSolutions = [
    {
        icon: <ShieldCheck className="w-8 h-8 text-brand-300 mb-6" />,
        text: "Immutable chain of ownership prevents title fraud."
    },
    {
        icon: <FileKey className="w-8 h-8 text-brand-300 mb-6" />,
        text: "Real-time cryptographic verification for all parties."
    },
    {
        icon: <Coins className="w-8 h-8 text-brand-300 mb-6" />,
        text: "Automated stamp duty processing."
    },
    {
        icon: <ArrowRightLeft className="w-8 h-8 text-brand-300 mb-6" />,
        text: "Transparent mutation and subdivision tracking logs."
    }
];

export default function BentoGrid() {
    const carouselItems = [...mockSolutions, ...mockSolutions, ...mockSolutions];

    return (
        <section className="w-full py-24 px-4 bg-brand-900 border-none overflow-hidden flex flex-col items-center">
            <div className="w-full max-w-[1400px] mb-12 text-center">
                <h2 className="text-3xl font-semibold tracking-tight text-white mb-8">
                    Solution Provided
                </h2>
            </div>

            <div className="w-full max-w-[1600px] relative">
                <div className="flex w-max gap-6 animate-carousel pause-hover">
                    {carouselItems.map((item, index) => (
                        <div
                            key={index}
                            className="w-[360px] md:w-[420px] bg-brand-800 border border-brand-700/60 p-8 rounded-3xl flex flex-col justify-end flex-shrink-0 hover:scale-[1.01] transition-transform duration-200"
                        >
                            {item.icon}
                            <span className="text-lg font-medium text-white tracking-wide">
                                {item.text}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
