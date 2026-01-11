"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";

export default function LiquidMetalDemo() {
  return (
    <div className="w-full py-20 flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Grid/Lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative w-full max-w-4xl aspect-[16/9] bg-card rounded-[3rem] shadow-soft-depth p-12 flex items-center justify-center overflow-hidden border border-white/40"
      >

        {/* Decorative corner texts */}
        <div className="absolute top-8 left-8 text-[0.6rem] font-mono tracking-widest text-muted-foreground/60">
          DESIGN<br/>EXPERIMENT
        </div>
        <div className="absolute top-8 right-8 text-[0.6rem] font-mono tracking-widest text-muted-foreground/60 text-right">
          YEAR<br/>2025
        </div>
        <div className="absolute bottom-8 left-8 text-[0.6rem] font-mono tracking-widest text-muted-foreground/60">
          TOOL<br/>PAPER DESIGN
        </div>
        <div className="absolute bottom-8 right-8 text-[0.6rem] font-mono tracking-widest text-muted-foreground/60 text-right">
          CHROMA GLASS<br/>LIQUID METALLIC
        </div>

        {/* Liquid Metal Controls */}
        <div className="flex items-center gap-8 relative z-10 scale-125 origin-center">

          {/* Plus Button with Chromatic Ring */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group relative w-32 h-32 rounded-full flex items-center justify-center cursor-pointer"
          >
            {/* The Outer Ring */}
            <div className="absolute inset-0 rounded-full p-[3px] bg-gradient-to-br from-white via-[#E0E0E0] to-[#A0A0A0] shadow-[0_10px_30px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,1)]" />

            {/* The Chromatic/Metallic Ring */}
            <div className="absolute inset-[3px] rounded-full p-[2px] bg-[conic-gradient(from_0deg,#d4d4d4,#ffffff,#e5e5e5,#ffffff,#d4d4d4)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]">
               {/* Iridescent overlay */}
               <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-40 transition-opacity duration-700 bg-[conic-gradient(from_0deg,#ff9a9e,#fecfef,#a1c4fd,#c2e9fb,#e0c3fc,#ff9a9e)] blur-sm" />
            </div>

            {/* Inner Button Surface */}
            <div className="absolute inset-[8px] rounded-full bg-linear-to-b from-white to-[#F5F5F5] shadow-[-2px_-2px_5px_rgba(255,255,255,1),2px_2px_5px_rgba(0,0,0,0.1)] flex items-center justify-center z-10">
              <Plus className="w-8 h-8 text-neutral-500/80" strokeWidth={1.5} />
            </div>
          </motion.div>

          {/* Upload Pill */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative h-32 px-12 rounded-[4rem] bg-white flex items-center gap-6 shadow-[inset_0_1px_1px_rgba(255,255,255,1),0_20px_40px_-10px_rgba(0,0,0,0.05)] border border-white/60 overflow-hidden min-w-[300px]"
          >
            <div className="absolute inset-0 rounded-[4rem] bg-gradient-to-b from-white to-[#FAFAFA] -z-10" />

            {/* Inner Metallic Stroke Border (Simulated) */}
            <div className="absolute inset-0 rounded-[4rem] border border-white/80 pointer-events-none" />
            <div className="absolute inset-[1px] rounded-[4rem] border border-black/5 pointer-events-none" />

            <span className="text-6xl font-normal tracking-tight text-neutral-800/80 drop-shadow-sm select-none blur-[0.5px]">
              Upload f
            </span>

            {/* Fading gradient on text (as per image) */}
            <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-[#FAFAFA] via-white/80 rounded-r-[4rem]" />
          </motion.div>

        </div>

      </motion.div>
    </div>
  );
}
