"use client";

import { motion } from "framer-motion";

export default function AkshonLogo({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
    const dimensions = {
        sm: "w-6 h-6 text-sm",
        md: "w-8 h-8 text-xl",
        lg: "w-12 h-12 text-3xl",
    }[size];

    return (
        <div className="flex items-center gap-2 group cursor-pointer">
            <motion.div
                whileHover={{ rotate: 90, scale: 1.1 }}
                className={`${dimensions} rounded bg-primary flex items-center justify-center font-black text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]`}
            >
                A
            </motion.div>
            <span className={`font-black tracking-tighter text-white uppercase italic ${size === "lg" ? "text-4xl" : "text-xl"}`}>
                Ak<span className="text-primary tracking-normal group-hover:text-white transition-colors">shon</span>
            </span>
        </div>
    );
}
