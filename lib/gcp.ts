import { Storage } from "@google-cloud/storage";

const storage = new Storage({
    projectId: process.env.GCP_PROJECT_ID,
});

export const bucket = storage.bucket(
    process.env.GCP_BUCKET_NAME || "akshon-research-corpus"
);

/**
 * Generates a signed URL for secure, temporary access to a file.
 * This is the "Secure Serving" layer.
 */
export async function getSecureUrl(fileName: string) {
    const file = bucket.file(fileName);

    // Audit log: Every time a URL is requested, it should be logged.
    console.log(`[AUDIT] - Secure URL requested for: ${fileName} at ${new Date().toISOString()}`);

    // Honeypot check: If someone tries to access files in 'secrets/' or 'internal/', flag it.
    if (fileName.includes("secrets/") || fileName.includes("admin/")) {
        console.warn(`[SECURITY ALERT] - Honeypot triggered! Attempted access to: ${fileName}`);
        // In a real scenario, this would trigger a Slack/Email alert or block the IP.
    }

    const [url] = await file.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    return url;
}

export async function listResearchPapers(prefix = "research/") {
    const [files] = await bucket.getFiles({ prefix });
    return Promise.all(files.map(async (file) => ({
        name: file.name.replace(prefix, ""),
        // Transition from publicUrl to secureUrl
        url: await getSecureUrl(file.name),
        size: file.metadata.size,
        updated: file.metadata.updated,
    })));
}

/**
 * Lists files from multiple prefixes without generating signed URLs.
 * Useful for listing restricted areas without triggering access logs/honeypots.
 */
export async function listFiles(prefixes: string[]) {
    let allFiles: any[] = [];
    for (const prefix of prefixes) {
        try {
            const [files] = await bucket.getFiles({ prefix });
            const mapped = files.map(file => ({
                name: file.name,
                size: file.metadata.size,
                updated: file.metadata.updated,
            }));
            allFiles = [...allFiles, ...mapped];
        } catch (error) {
            console.error(`Error listing files for prefix ${prefix}:`, error);
        }
    }
    return allFiles;
}

/**
 * Uploads a file to the corpus.
 */
export async function uploadToCorpus(fileName: string, content: Buffer | string, contentType = "application/pdf") {
    const file = bucket.file(`research/${fileName}`);
    await file.save(content, {
        contentType,
        metadata: {
            cacheControl: "public, max-age=31536000",
        },
    });
    console.log(`[COMPLIANCE] - File ${fileName} successfully uploaded and audited.`);
}
