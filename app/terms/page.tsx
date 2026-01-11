"use client";

import Navbar from "@/components/Navbar";

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <Navbar />
            <div className="container mx-auto px-4 max-w-4xl font-light italic text-muted-foreground leading-relaxed">
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-12">Sovereign <span className="text-primary italic">Terms</span></h1>

                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">1. ELIGIBILITY</h2>
                    <p>Access to AKSHON is restricted to sovereign entities seeking informational edge. By accessing our matrix, you agree to maintain the integrity of the data provided.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">2. DATA USAGE</h2>
                    <p>All research papers in the Corpus are provided for analytical purposes. Synthesis outputs are proprietary to AKSHON and the accessing entity.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">3. TERMINATION</h2>
                    <p>We reserve the right to terminate access for any entity displaying non-kinetic behavioral patterns or attempting to exploit the synthesis engine.</p>
                </section>

                <p className="text-[10px] uppercase font-mono mt-20 opacity-30">
                    Last Modified: Jan 2026 // AKSHON_LEGAL_L1
                </p>
            </div>
        </main>
    );
}
