import Link from "next/link";
import { RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";

export default function TicketCTA() {
    return (
        <section className="relative w-full py-20 overflow-hidden bg-gray-50 dark:bg-slate-950 border-t border-gray-200 dark:border-white/5 transition-colors duration-300">
            {/* Watermark Background Pattern - Animated */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden flex flex-col justify-center gap-12 rotate-[-12deg] scale-150">
                {[...Array(6)].map((_, rowIndex) => (
                    <div
                        key={rowIndex}
                        className={`flex whitespace-nowrap gap-12 ${rowIndex % 2 === 0 ? 'animate-scroll' : 'animate-scroll-reverse'}`}
                    >
                        {[...Array(10)].map((_, i) => (
                            <span key={i} className="text-6xl font-black uppercase text-black dark:text-white">
                                Royal Class
                            </span>
                        ))}
                    </div>
                ))}
            </div>

            <div className="relative z-10 container mx-auto px-4 text-center">
                <div className="mb-2 flex justify-center">
                    <RefreshCw className="w-8 h-8 text-[#D4AF37] animate-spin-slow mb-4" />
                </div>

                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">
                    Manage Your <span className="text-[#D4AF37]">Tickets!</span>
                </h2>

                <p className="max-w-2xl mx-auto text-gray-600 dark:text-slate-400 mb-8 text-sm md:text-base leading-relaxed">
                    Need to transfer your ticket to someone else? Our secure transfer system makes it easy to pass your tickets to friends or family.
                    <br className="hidden md:block" />
                    Quick, safe, and hassle-free!
                </p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                    {/* Primary Action */}
                    <button className="group relative px-6 py-3 bg-[#D4AF37] hover:bg-[#8C7326] text-black rounded-lg font-bold transition-all duration-300 flex items-center gap-2 shadow-lg shadow-[#8C7326]/20 hover:shadow-[#8C7326]/40 transform hover:-translate-y-1">
                        <RefreshCw className="w-4 h-4" />
                        <span>Transfer Tickets</span>
                    </button>

                    {/* Secondary Action - Verify */}
                    <button className="px-6 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-transparent hover:border-[#D4AF37]/50 hover:bg-[#F7E08B] dark:hover:bg-[#D4AF37]/5 text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-all duration-300 flex items-center gap-2 group">
                        <AlertCircle className="w-4 h-4 text-[#D4AF37]" />
                        <span>Verify Pass</span>
                    </button>

                    {/* Secondary Action - Secure */}
                    <button className="px-6 py-3 rounded-lg border border-gray-300 dark:border-[#8C7326]/50 bg-white dark:bg-transparent hover:border-[#D4AF37]/50 hover:bg-[#F7E08B] dark:hover:bg-[#D4AF37]/5 text-gray-700 dark:text-slate-300 hover:text-[#8C7326] dark:hover:text-[#F7E08B] transition-all duration-300 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <span>Secure Pass Access</span>
                    </button>
                </div>
            </div>
        </section>
    );
}

