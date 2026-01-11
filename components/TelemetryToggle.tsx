"use client";

import { useState, useEffect } from "react";
import { Activity, ShieldCheck, ShieldAlert } from "lucide-react";
import { getConsent, setConsent as saveConsent } from "@/lib/analytics";

export default function TelemetryToggle() {
    const [isTracking, setIsTracking] = useState(false);

    useEffect(() => {
        setIsTracking(getConsent());
    }, []);

    const toggleTracking = () => {
        const newState = !isTracking;
        saveConsent(newState);
        setIsTracking(newState);
        // Refresh to stop/start tracking scripts if necessary
        window.location.reload();
    };

    const toggleTheme = () => {
        document.body.classList.toggle("dark");
    };

    return (
        <div className="flex items-center gap-2">
             <button
                onClick={toggleTheme}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 hover:border-primary/20 transition-all group"
                title="Toggle Light/Dark Protocol"
            >
                <div className="w-2 h-2 rounded-full bg-secondary/50 group-hover:bg-secondary transition-colors" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                    Cycle_Lux
                </span>
            </button>
            <button
                onClick={toggleTracking}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/5 hover:border-primary/20 transition-all group"
                title={isTracking ? "Telemetry Active" : "Telemetry Inactive"}
            >
                <div className={`w-2 h-2 rounded-full ${isTracking ? "bg-primary animate-pulse" : "bg-white/20"}`} />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/40 group-hover:text-white transition-colors">
                    {isTracking ? "Uplink_Active" : "Uplink_Offline"}
                </span>
                {isTracking ? <ShieldCheck className="w-3 h-3 text-primary/50" /> : <ShieldAlert className="w-3 h-3 text-white/20" />}
            </button>
        </div>
    );
}
