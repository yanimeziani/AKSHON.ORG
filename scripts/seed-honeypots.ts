import { bucket } from "../lib/gcp";

/**
 * Seeds the GCP bucket with honeypot files to detect unauthorized scanning.
 */
async function seedHoneypots() {
    console.log("🚀 Seeding honeypots...");

    const honeypots = [
        {
            path: "secrets/admin_access_keys.json",
            content: JSON.stringify({
                project_id: "akshon-internal",
                private_key: "NOT_A_REAL_KEY_HONEYPOT",
                client_email: "admin-honeypot@akshon.org"
            }, null, 2)
        },
        {
            path: "admin/config.env",
            content: "STRIPE_SECRET=sk_live_honeypot_12345\nDATABASE_URL=postgres://admin:trap@127.0.0.1:5432/secrets"
        },
        {
            path: "research/internal_audit_2025_private.pdf",
            content: "This is a honeypot file. If you are reading this, your access has been logged.",
            contentType: "application/pdf"
        }
    ];

    for (const poison of honeypots) {
        const file = bucket.file(poison.path);
        await file.save(poison.content, {
            contentType: poison.contentType || "application/json",
            metadata: {
                notes: "Honeypot for security auditing",
            }
        });
        console.log(`✅ Seeded honeypot: ${poison.path}`);
    }

    console.log("✨ All honeypots active. Compliance auditing enabled via getSecureUrl().");
}

seedHoneypots().catch(console.error);
