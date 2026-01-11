"use client";

import { motion } from "framer-motion";
import { TrendingDown, DollarSign, Bitcoin } from "lucide-react";

export default function WealthErosion() {
  const dataPoints = [
    { year: 1913, value: 100 },
    { year: 1940, value: 60 },
    { year: 1970, value: 25 },
    { year: 2000, value: 10 },
    { year: 2024, value: 4 },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto p-8 md:p-12 glass-chroma rounded-[40px] border border-white/20 relative overflow-hidden shadow-soft-depth">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <TrendingDown className="w-32 h-32 text-red-500" />
      </div>

      <div className="relative z-10">
        <div className="mb-10 text-center md:text-left">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-red-400 font-mono text-[10px] uppercase tracking-[0.4em] mb-2"
          >
            Systematic Devaluation
          </motion.div>
          <h3 className="text-3xl md:text-4xl font-black text-foreground italic uppercase tracking-tighter mb-4">
            The Silent <span className="text-red-500">Theft</span>
          </h3>
          <p className="text-muted-foreground font-light italic max-w-xl">
            Since the creation of the Federal Reserve in 1913, the dollar has lost over 96% of its purchasing power.
            This is not an accident. It is the business model.
          </p>
        </div>

        {/* Chart Area */}
        <div className="h-64 flex items-end justify-between gap-4 px-4 border-b border-white/10 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
             <div className="w-full h-px bg-white/20 border-t border-dashed" />
             <div className="w-full h-px bg-white/20 border-t border-dashed" />
             <div className="w-full h-px bg-white/20 border-t border-dashed" />
          </div>

          {dataPoints.map((point, i) => (
            <div key={point.year} className="flex flex-col items-center gap-2 group w-full">
              <div className="relative w-full flex justify-center items-end h-full">
                 <motion.div
                    initial={{ height: 0 }}
                    whileInView={{ height: `${point.value}%` }}
                    transition={{ duration: 1, delay: i * 0.2, ease: "circOut" }}
                    className="w-8 md:w-16 bg-gradient-to-t from-red-500/20 to-red-500/80 rounded-t-lg relative group-hover:from-red-500/40 group-hover:to-red-500 transition-colors"
                 >
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold text-red-400">
                        ${point.value}
                    </div>
                 </motion.div>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground mt-2">{point.year}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-2xl bg-red-500/5 border border-red-500/20">
                <div className="flex items-center gap-3 mb-3 text-red-400">
                    <DollarSign className="w-5 h-5" />
                    <h4 className="font-bold uppercase tracking-widest text-xs">The Fiat Trap</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Money is printed by institutions to steal value from your labor.
                    Inflation eats your savings faster than you can earn.
                </p>
            </div>

            <div className="p-6 rounded-2xl bg-green-500/5 border border-green-500/20">
                <div className="flex items-center gap-3 mb-3 text-green-400">
                    <Bitcoin className="w-5 h-5" />
                    <h4 className="font-bold uppercase tracking-widest text-xs">The Sovereign Exit</h4>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    Opt out of the rigged triangle. Store your energy in a system that cannot be diluted by political decree.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
