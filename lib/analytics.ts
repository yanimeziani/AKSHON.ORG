import { db } from "./firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const ANALYTICS_CONSENT_KEY = "akshon_analytics_consent";
const ANALYTICS_USER_ID_KEY = "akshon_anonymous_id";

export type AnalyticsEvent = {
    type: "page_view" | "click" | "download" | "lead_capture_view";
    path: string;
    metadata?: Record<string, any>;
};

export function getConsent(): boolean {
    if (typeof window === "undefined") return false;
    const consent = localStorage.getItem(ANALYTICS_CONSENT_KEY);
    return consent === "true";
}

export function setConsent(consent: boolean) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ANALYTICS_CONSENT_KEY, consent.toString());
}

export function hasSetConsent(): boolean {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(ANALYTICS_CONSENT_KEY) !== null;
}

function getAnonymousId(): string {
    if (typeof window === "undefined") return "server";
    let id = localStorage.getItem(ANALYTICS_USER_ID_KEY);
    if (!id) {
        id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem(ANALYTICS_USER_ID_KEY, id);
    }
    return id;
}

export async function trackEvent(event: AnalyticsEvent) {
    if (!getConsent()) return;

    try {
        await addDoc(collection(db, "analytics"), {
            ...event,
            userId: getAnonymousId(),
            timestamp: serverTimestamp(),
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
            language: typeof navigator !== "undefined" ? navigator.language : "unknown",
        });
    } catch (error) {
        // Silently fail analytics to not break user experience
        console.error("Analytics failed:", error);
    }
}
