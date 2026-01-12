import crypto from 'crypto';

const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://localhost:8080";
const KINETIC_SECRET = process.env.KINETIC_SECRET || "AKSHON_RESONANCE_2026";
const PROJECT_ID = process.env.GCP_PROJECT_ID || "stellar-chariot-477113-j0";

/**
 * Calculates the Resonance Signature for secure API access.
 * Implementation of the Resonance Theorem: Signature = H(T + P + K)
 */
function calculateResonanceSignature(timestamp: string): string {
    const msg = `${timestamp}${PROJECT_ID}${KINETIC_SECRET}`;
    return crypto.createHash('sha256').update(msg).digest('hex');
}

export async function chatWithOllama(prompt: string, model: string = "dolphin-r1:24b") {
    const timestamp = (Date.now() / 1000).toString();
    const signature = calculateResonanceSignature(timestamp);

    try {
        const response = await fetch(`${OLLAMA_HOST}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Resonance-Signature': signature,
                'X-Resonance-Timestamp': timestamp,
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: prompt }],
                stream: false,
            }),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Resonance Mismatch: ${error}`);
        }

        return await response.json();
    } catch (error) {
        console.error("[OLLAMA ERROR] - Harmonic drift detected:", error);
        throw error;
    }
}
