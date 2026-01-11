"use client";

import Navbar from "@/components/Navbar";

export default function PrivacyPage() {
    return (
        <main className="min-h-screen bg-black pt-32 pb-24">
            <Navbar />
            <div className="container mx-auto px-4 max-w-4xl font-light italic text-muted-foreground leading-relaxed">
                <h1 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-12">Data <span className="text-primary italic">Privacy</span></h1>

                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">1. MINIMAL FOOTPRINT</h2>
                    <p>AKSHON operates on a principle of least-required data. We only capture the communication channels you explicitly provide (email) to facilitate authentication.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">2. SECURITY AUDITS</h2>
                    <p>Every interaction with the Research Corpus is logged to prevent unauthorized extraction. These logs are stored in encrypted GCP buckets and purged every 90 days.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">3. ANALYTICS TELEMETRY</h2>
                    <p>We utilize high-integrity, anonymous telemetry to optimize the matrix performance. You have the sovereign right to opt-out of all tracking via the telemetry console. No personal identifiers or IP addresses are linked to your research sessions.</p>
                </section>

                <section className="mb-12">
                    <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-4">4. COOKIES & LOCAL STORAGE</h2>
                    <p>We use session-based identifiers and localStorage to maintain your connection to the Synthesis engine and remember your telemetry preferences. No third-party tracking pixels are utilized.</p>
                </section>

                <p className="text-[10px] uppercase font-mono mt-20 opacity-30">
                    Compliance: SOC2 / GDPR_ALIGNED // AKSHON_SECURE_GUARD
                </p>
            </div>
        </main>
    );
}
